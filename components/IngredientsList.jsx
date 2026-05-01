import RecipeCarousel from "./RecipeCarousel";
import { useTranslation } from "react-i18next";

const STATIC_INGREDIENT_IDS = new Set([
  "egg",
  "cheese",
  "tomato",
  "garlic",
  "onion",
  "milk",
  "bread",
  "butter",
  "chicken",
  "potato",
  "rice",
  "pepper",
]);

export default function IngredientsList({
  ingredients,
  onGetRecipe,
  onRemoveIngredient,
  onQuickAddIngredients,
  isGenerating = false,
}) {
  const { t } = useTranslation();
  const getDisplayIngredient = (ingredient) =>
    STATIC_INGREDIENT_IDS.has(ingredient.toLowerCase())
      ? t(`ingredients.${ingredient.toLowerCase()}`)
      : ingredient;

  if (ingredients.length === 0) {
    return <RecipeCarousel onQuickAdd={onQuickAddIngredients} />;
  }

  const ingredientsListItems = ingredients.map((ingredient) => (
    <li
      key={ingredient}
      className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2.5 shadow-[var(--shadow-soft)]"
    >
      <button
        type="button"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-brand-600 bg-brand-500 text-xs font-bold text-white transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        aria-label={`${t("buttons.remove")} ${getDisplayIngredient(ingredient)}`}
        title={`${t("buttons.remove")} ${getDisplayIngredient(ingredient)}`}
        onClick={() => onRemoveIngredient(ingredient)}
      >
        ✓
      </button>
      <span className="text-sm font-medium text-stone-700 sm:text-base">
        {getDisplayIngredient(ingredient)}
      </span>
    </li>
  ));

  return (
    <section className="mx-auto mt-9 w-full max-w-5xl">
      <div>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-stone-800 sm:text-2xl">
          {t("home.ingredientsOnHand")}
        </h2>
        <ul
          className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3"
          aria-live="polite"
        >
          {ingredientsListItems}
        </ul>
      </div>

      {ingredients.length >= 3 && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 p-5 text-white shadow-[var(--shadow-soft-lg)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t("home.readyTitle")}</h3>
            <p className="mt-1 text-sm text-brand-100/95">
              {t("home.readySubtitle")}
            </p>
          </div>
          <button
            onClick={onGetRecipe}
            disabled={isGenerating}
            className="btn btn-md sm:min-w-40 border border-white/50 bg-white/95 font-semibold text-brand-700 hover:bg-white"
          >
            {isGenerating ? t("buttons.generating") : t("buttons.getRecipe")}
          </button>
        </div>
      )}
    </section>
  );
}
