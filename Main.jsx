import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import IngredientsList from "./components/IngredientsList";
import { useGenerateRecipeMutation } from "./redux/recipesApi";
// import { useLazyGenerateRecipeQuery } from "./redux/recipesApi";
import DishBuilder from "./components/DishBuilder";
import ToastMessage from "./components/ToastMessage";
import LoadingOverlay from "./components/LoadingOverlay";
import MealPlannerPromo from "./components/MealPlannerPromo";
import { useAuth } from "./context/AuthContext";
import { saveRecipeForUser } from "./services/savedRecipesService";

const COMMON_INGREDIENTS = [
  { value: "egg", emoji: "🥚" },
  { value: "cheese", emoji: "🧀" },
  { value: "tomato", emoji: "🍅" },
  { value: "garlic", emoji: "🧄" },
  { value: "onion", emoji: "🧅" },
  { value: "milk", emoji: "🥛" },
  { value: "bread", emoji: "🍞" },
  { value: "butter", emoji: "🧈" },
  { value: "chicken", emoji: "🍗" },
  { value: "potato", emoji: "🥔" },
  { value: "rice", emoji: "🍚" },
  { value: "pepper", emoji: "🫑" },
];

function recipeToSavableText(recipe) {
  if (!recipe) return "";

  if (typeof recipe === "string") {
    return recipe.trim();
  }

  const title = recipe.title?.trim() || "";
  const summary = recipe.summary?.trim() || "";
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];

  const lines = [];
  if (title) lines.push(`# ${title}`);
  if (summary) lines.push("", summary);
  lines.push("", "## Ingredients");
  if (ingredients.length) {
    ingredients.forEach((ingredient) => lines.push(`- ${ingredient}`));
  } else {
    lines.push("- ");
  }
  lines.push("", "## Cooking Steps");
  if (steps.length) {
    steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
  } else {
    lines.push("1. ");
  }

  return lines.join("\n").trim();
}

function getRecipeErrorMessage(error, t) {
  const backendMessage = error?.data?.error;
  if (backendMessage) return backendMessage;

  const status = error?.status;
  const originalStatus = error?.originalStatus;
  const parserErrorText = error?.error || "";

  if (status === "PARSING_ERROR" || parserErrorText.includes("Unexpected token")) {
    if (originalStatus === 401) {
      return t("errors.recipe.credentials");
    }
    return t("errors.recipe.invalidResponse");
  }

  if (status === 401 || originalStatus === 401) {
    return t("errors.recipe.credentials");
  }

  if (status === 429 || originalStatus === 429) {
    return t("errors.recipe.rateLimited");
  }

  if (status === 500 || status === 502 || status === 503 || status === 504) {
    return t("errors.recipe.unavailable");
  }

  return t("errors.recipe.generic");
}

export default function Main() {
  const { t, i18n } = useTranslation();
  const [ingredients, setIngredients] = React.useState([]);
  const [recipe, setRecipe] = React.useState(null);
  const [toast, setToast] = React.useState({ message: "", tone: "success" });
  const recipeResultRef = React.useRef(null);
  const previousRecipeRef = React.useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [generateRecipe, { isLoading, isError, error }] =
    useGenerateRecipeMutation();
  const recipeErrorMessage = React.useMemo(() => getRecipeErrorMessage(error, t), [error, t]);

  function removeIngredient(ingredientToRemove) {
    setIngredients((prev) =>
      prev.filter((ingredient) => ingredient !== ingredientToRemove)
    );
  }

  async function onGetRecipe() {
    if (isLoading) return;

    try {
      const language = i18n.resolvedLanguage?.startsWith("ru") ? "ru" : "en";
      const data = await generateRecipe({ ingredients, language }).unwrap();
      const recipePayload = data.recipe
        ? {
            ...data.recipe,
            language,
            sourceIngredients: [...ingredients],
            optionalExtraIngredients: Array.isArray(data.optionalExtraIngredients)
              ? data.optionalExtraIngredients
              : Array.isArray(data.warnings?.[0]?.ingredients)
                ? data.warnings[0].ingredients
                : [],
          }
        : null;
      setRecipe(recipePayload);
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

  function saveRecipe(recipeData) {
    if (!isAuthenticated || !user?.id) {
      navigate("/login", { state: { from: "/saved-recipes" } });
      return false;
    }

    return saveRecipeForUser(recipeToSavableText(recipeData))
      .then((didSave) => {
        if (didSave) {
          setToast({ message: t("recipeResult.recipeSavedSuccessfully"), tone: "success" });
          return true;
        }

        setToast({
          message: t("recipeResult.recipeSaveFailed"),
          tone: "error",
        });
        return false;
      })
      .catch(() => {
        setToast({
          message: t("recipeResult.recipeSaveFailed"),
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

  React.useEffect(() => {
    if (!recipe || isLoading || isError) {
      previousRecipeRef.current = recipe;
      return;
    }

    if (previousRecipeRef.current === recipe) return;
    previousRecipeRef.current = recipe;

    window.requestAnimationFrame(() => {
      recipeResultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [recipe, isLoading, isError]);

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
      {isLoading && <LoadingOverlay message={t("buttons.generatingRecipe")} />}
      <div className="toast-message-wrap">
        <ToastMessage tone={toast.tone} message={toast.message} />
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-100/70 via-white to-brand-50/85 px-4 py-6 shadow-[var(--shadow-soft-lg)] sm:px-7 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="relative grid items-end gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              {t("home.badge")}
            </p>
            <h2
              className={`mt-3 font-semibold tracking-tight text-stone-900 ${i18n.resolvedLanguage?.startsWith("ru") ? "text-2xl leading-tight sm:text-3xl lg:text-4xl" : "text-3xl sm:text-4xl lg:text-5xl"}`}
            >
              {t("home.title")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
              {t("home.subtitle")}
            </p>

            <form
              action={addIngredient}
              className="mt-6 grid w-full max-w-3xl gap-3 sm:grid-cols-[1fr_auto]"
            >
              <input
                type="text"
                placeholder={t("home.inputPlaceholder")}
                aria-label="Add ingredient"
                name="ingredient"
                className="field-input h-14 rounded-2xl border-white/70 bg-white/95 text-base shadow-[var(--shadow-soft)]"
              />
              <button className="btn-primary btn btn-lg h-14 rounded-2xl px-7">
                {t("buttons.addIngredient")}
              </button>
            </form>
          </div>

          <section
            className="rounded-2xl bg-white/80 p-4 shadow-[var(--shadow-soft)] backdrop-blur-sm sm:p-5"
            aria-label="Common ingredients"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {t("home.quickAddTitle")}
              </p>
              <span className="text-xs text-stone-400">{t("home.quickAddHint")}</span>
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
                    <span>{t(`ingredients.${item.value}`)}</span>
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
          {t("errors.recipe.prefix")}: {recipeErrorMessage}
        </p>
      )}

      {recipe && (
        <div ref={recipeResultRef} className="scroll-mt-24 sm:scroll-mt-28">
          <DishBuilder recipe={recipe} onSaveRecipe={saveRecipe} />
        </div>
      )}

      <MealPlannerPromo />
    </main>
  );
}
