import React from "react";
import { useNavigate } from "react-router-dom";
import IngredientsList from "./components/IngredientsList";
import { useGenerateRecipeMutation } from "./redux/recipesApi";
// import { useLazyGenerateRecipeQuery } from "./redux/recipesApi";
import DishBuilder from "./components/DishBuilder";
import ToastMessage from "./components/ToastMessage";
import LoadingOverlay from "./components/LoadingOverlay";
import { useAuth } from "./context/AuthContext";
import { saveRecipeForUser } from "./services/savedRecipesService";

const COMMON_INGREDIENTS = [
  { label: "Egg", value: "egg", emoji: "🥚" },
  { label: "Cheese", value: "cheese", emoji: "🧀" },
  { label: "Tomato", value: "tomato", emoji: "🍅" },
  { label: "Garlic", value: "garlic", emoji: "🧄" },
  { label: "Onion", value: "onion", emoji: "🧅" },
  { label: "Milk", value: "milk", emoji: "🥛" },
  { label: "Bread", value: "bread", emoji: "🍞" },
  { label: "Butter", value: "butter", emoji: "🧈" },
  { label: "Chicken", value: "chicken", emoji: "🍗" },
  { label: "Potato", value: "potato", emoji: "🥔" },
  { label: "Rice", value: "rice", emoji: "🍚" },
  { label: "Pepper", value: "pepper", emoji: "🫑" },
];

function getRecipeErrorMessage(error) {
  const backendMessage = error?.data?.error;
  if (backendMessage) return backendMessage;

  const status = error?.status;
  const originalStatus = error?.originalStatus;
  const parserErrorText = error?.error || "";

  if (status === "PARSING_ERROR" || parserErrorText.includes("Unexpected token")) {
    if (originalStatus === 401) {
      return "Recipe generation is temporarily unavailable. Please check server API credentials.";
    }
    return "Recipe service returned an invalid response. Please try again shortly.";
  }

  if (status === 401 || originalStatus === 401) {
    return "Recipe generation is temporarily unavailable. Please check server API credentials.";
  }

  if (status === 429 || originalStatus === 429) {
    return "Recipe requests are temporarily rate-limited. Please try again in a moment.";
  }

  if (status === 500 || status === 502 || status === 503 || status === 504) {
    return "Recipe service is temporarily unavailable. Please try again.";
  }

  return "Could not generate recipe. Please try again.";
}

export default function Main() {
  const [ingredients, setIngredients] = React.useState([]);
  const [recipe, setRecipe] = React.useState("");
  const [toast, setToast] = React.useState({ message: "", tone: "success" });
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [generateRecipe, { isLoading, isError, error }] =
    useGenerateRecipeMutation();
  const recipeErrorMessage = React.useMemo(() => getRecipeErrorMessage(error), [error]);

  function removeIngredient(ingredientToRemove) {
    setIngredients((prev) =>
      prev.filter((ingredient) => ingredient !== ingredientToRemove)
    );
  }

  async function onGetRecipe() {
    if (isLoading) return;

    try {
      const data = await generateRecipe(ingredients).unwrap();
      setRecipe(data.recipe);
    } catch (e) {
      console.error(e);
    }
  }

  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient")?.trim();
    if (!newIngredient) return;

    setIngredients((prev) => [...prev, newIngredient]);
  }

  function addSingleIngredient(newIngredient) {
    setIngredients((prev) => {
      const exists = prev.some(
        (ingredient) => ingredient.toLowerCase() === newIngredient.toLowerCase()
      );

      if (exists) return prev;
      return [...prev, newIngredient];
    });
  }

  function saveRecipe(recipe) {
    if (!isAuthenticated || !user?.id) {
      navigate("/login", { state: { from: "/saved-recipes" } });
      return false;
    }

    return saveRecipeForUser(recipe)
      .then((didSave) => {
        if (didSave) {
          setToast({ message: "Recipe saved successfully!", tone: "success" });
          return true;
        }

        setToast({
          message: "Could not save recipe. Please try again.",
          tone: "error",
        });
        return false;
      })
      .catch(() => {
        setToast({
          message: "Could not save recipe. Please try again.",
          tone: "error",
        });
        return false;
      });
  }

  React.useEffect(() => {
    if (!toast.message) return undefined;

    const timeout = window.setTimeout(() => {
      setToast({ message: "", tone: "success" });
    }, 2800);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  function handleQuickAddIngredients(newIngredients) {
    setIngredients((prev) => {
      const existing = new Set(prev.map((x) => x.toLowerCase()));
      const merged = [...prev];

      for (const ing of newIngredients) {
        const key = ing.toLowerCase();
        if (!existing.has(key)) {
          merged.push(ing);
          existing.add(key);
        }
      }
      return merged;
    });
  }

  return (
    <main className="container-page relative py-6 sm:py-10">
      {isLoading && <LoadingOverlay message="Generating recipe" />}
      <div className="toast-message-wrap">
        <ToastMessage tone={toast.tone} message={toast.message} />
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-100/70 via-white to-brand-50/85 px-4 py-6 shadow-[var(--shadow-soft-lg)] sm:px-7 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="relative grid items-end gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              Smart pantry cooking
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              Build dinner from ingredients you already have
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
              Add what is in your kitchen and get practical recipe ideas in
              seconds, including ways to use staples creatively.
            </p>

            <form
              action={addIngredient}
              className="mt-6 grid w-full max-w-3xl gap-3 sm:grid-cols-[1fr_auto]"
            >
              <input
                type="text"
                placeholder="e.g. oregano"
                aria-label="Add ingredient"
                name="ingredient"
                className="field-input h-14 rounded-2xl border-white/70 bg-white/95 text-base shadow-[var(--shadow-soft)]"
              />
              <button className="btn-primary btn btn-lg h-14 rounded-2xl px-7">
                + Add ingredient
              </button>
            </form>
          </div>

          <section
            className="rounded-2xl bg-white/80 p-4 shadow-[var(--shadow-soft)] backdrop-blur-sm sm:p-5"
            aria-label="Common ingredients"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Quick add
              </p>
              <span className="text-xs text-stone-400">Tap to add instantly</span>
            </div>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {COMMON_INGREDIENTS.map((item) => {
                const isAdded = ingredients.some(
                  (ingredient) =>
                    ingredient.toLowerCase() === item.value.toLowerCase()
                );

                return (
                  <button
                    key={item.value}
                    type="button"
                    className={`tag-chip ${isAdded ? "border-brand-200 bg-brand-50 text-brand-700 opacity-70" : ""}`}
                    onClick={() => addSingleIngredient(item.value)}
                    disabled={isAdded}
                    aria-pressed={isAdded}
                  >
                    <span aria-hidden="true">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </section>

      <IngredientsList
        ingredients={ingredients}
        onGetRecipe={onGetRecipe}
        onRemoveIngredient={removeIngredient}
        onQuickAddIngredients={handleQuickAddIngredients}
        isGenerating={isLoading}
      />

      {isError && (
        <p className="mt-4 text-center text-sm font-medium text-rose-700" role="alert">
          Failed to generate recipe: {recipeErrorMessage}
        </p>
      )}

      {recipe && <DishBuilder recipe={recipe} onSaveRecipe={saveRecipe} />}
    </main>
  );
}
