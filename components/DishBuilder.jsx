import React from "react";
import { parseRecipeContent } from "../services/recipeContentService";
import { fetchRecipeImage } from "../services/recipeImageService";

export default function DishBuilder({ recipe, onSaveRecipe }) {
  const [isSaved, setIsSaved] = React.useState(false);
  const [imageState, setImageState] = React.useState({
    isLoading: true,
    image: null,
    hasError: false,
  });

  const parsedRecipe = React.useMemo(() => parseRecipeContent(recipe), [recipe]);

  React.useEffect(() => {
    let isActive = true;

    setImageState({
      isLoading: true,
      image: null,
      hasError: false,
    });

    fetchRecipeImage(parsedRecipe.title)
      .then((image) => {
        if (!isActive) return;
        setImageState({
          isLoading: false,
          image,
          hasError: !image,
        });
      })
      .catch(() => {
        if (!isActive) return;
        setImageState({
          isLoading: false,
          image: null,
          hasError: true,
        });
      });

    return () => {
      isActive = false;
    };
  }, [parsedRecipe.title]);

  async function handleSave() {
    const didSave = await onSaveRecipe(recipe);
    if (didSave) {
      setIsSaved(true);
    }
  }

  return (
    <section className="container-page mt-12 pb-10 sm:mt-16">
      <h2 className="mx-auto mb-5 w-full max-w-3xl text-2xl font-semibold tracking-tight text-stone-800 sm:text-3xl">
        Dish Builder Recommends
      </h2>
      <article
        className="surface-card mx-auto w-full max-w-3xl rounded-3xl p-5 sm:p-8 shadow-[var(--shadow-soft-lg)]"
        aria-live="polite"
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              🍽️ Recipe
            </p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              {parsedRecipe.title}
            </h3>
          </div>
          <button
            type="button"
            className={`btn btn-md w-full sm:w-auto sm:self-start ${isSaved ? "btn-secondary" : "btn-primary"}`}
            onClick={handleSave}
            disabled={isSaved}
          >
            {isSaved ? "✅ Recipe saved" : "⭐ Save recipe"}
          </button>
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl border border-stone-200">
          {imageState.isLoading ? (
            <div
              className="recipe-image-skeleton h-56 w-full"
              aria-label="Loading recipe image"
            />
          ) : imageState.image ? (
            <>
              <img
                src={imageState.image.imageUrl}
                alt={imageState.image.alt}
                className="h-56 w-full object-cover"
                loading="lazy"
              />
              <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-500">
                <span>Photo: {imageState.image.photographerName}</span>
                <a
                  href={imageState.image.photographerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-700 hover:underline"
                >
                  {imageState.image.source}
                </a>
              </div>
            </>
          ) : (
            <div className="recipe-image-fallback flex h-56 items-center justify-center px-4 text-sm font-medium text-stone-600">
              {imageState.hasError
                ? "Image unavailable right now."
                : "No matching image found."}
            </div>
          )}
        </div>

        {parsedRecipe.introText && (
          <p className="mb-6 text-sm leading-7 text-stone-600 sm:text-base">
            {parsedRecipe.introText}
          </p>
        )}

        <div className="grid gap-5">
          <section className="recipe-section">
            <h4 className="recipe-section-title">🧂 Ingredients</h4>
            {parsedRecipe.ingredients.length ? (
              <ul className="recipe-list">
                {parsedRecipe.ingredients.map((ingredient, index) => (
                  <li key={`${ingredient}-${index}`}>{ingredient}</li>
                ))}
              </ul>
            ) : (
              <p className="recipe-empty">No ingredients listed.</p>
            )}
          </section>

          <section className="recipe-section">
            <h4 className="recipe-section-title">👨‍🍳 Cooking Steps</h4>
            {parsedRecipe.steps.length ? (
              <ol className="recipe-list recipe-list-numbered">
                {parsedRecipe.steps.map((step, index) => (
                  <li key={`${step}-${index}`}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="recipe-empty">No steps listed.</p>
            )}
          </section>
        </div>
      </article>
    </section>
  );
}
