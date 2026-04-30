import React from "react";
import { useNavigate } from "react-router-dom";
import IngredientsList from "./components/IngredientsList";
import { useGenerateRecipeMutation } from "./redux/recipesApi";
// import { useLazyGenerateRecipeQuery } from "./redux/recipesApi";
import DishBuilder from "./components/DishBuilder";
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

export default function Main() {
  const [ingredients, setIngredients] = React.useState([]);
  const [recipe, setRecipe] = React.useState("");
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [generateRecipe, { isLoading, isError, error }] =
    useGenerateRecipeMutation();

  function removeIngredient(ingredientToRemove) {
    setIngredients((prev) =>
      prev.filter((ingredient) => ingredient !== ingredientToRemove)
    );
  }

  async function onGetRecipe() {
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
          alert("Recipe saved!");
          return true;
        }
        alert("This recipe is already saved.");
        return false;
      })
      .catch((error) => {
        alert(error.message || "Unable to save recipe right now.");
        return false;
      });
  }

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
    <main className="container-page py-6 sm:py-10">
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
      />

      {isLoading && (
        <p className="mt-5 text-center text-sm font-medium text-brand-700" aria-live="polite">
          Generating recipe...
        </p>
      )}
      {isError && (
        <p className="mt-4 text-center text-sm font-medium text-rose-700" role="alert">
          Failed to generate recipe: {error?.data?.error || "Unknown error"}
        </p>
      )}

      {recipe && <DishBuilder recipe={recipe} onSaveRecipe={saveRecipe} />}
    </main>
  );
}
