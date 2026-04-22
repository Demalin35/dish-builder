import ReactMarkdown from "react-markdown";
import React from "react";

export default function DishBuilder({ recipe, onSaveRecipe }) {
  const [isSaved, setIsSaved] = React.useState(false);

  async function handleSave() {
    const didSave = await onSaveRecipe(recipe);
    if (didSave) {
      setIsSaved(true);
    }
  }

  return (
    <section className="container-page mt-12 pb-10 sm:mt-16">
      <h2 className="mb-5 text-2xl font-semibold tracking-tight text-stone-800 sm:text-3xl">
        Dish Builder Recommends
      </h2>
      <article
        className="surface-card w-full max-w-5xl rounded-3xl p-5 sm:p-8 shadow-[var(--shadow-soft-lg)]"
        aria-live="polite"
      >
        <div className="mb-5 flex justify-stretch sm:justify-end">
          <button
            type="button"
            className={`btn btn-md w-full sm:w-auto ${isSaved ? "btn-secondary" : "btn-primary"}`}
            onClick={handleSave}
            disabled={isSaved}
          >
            {isSaved ? "✅ Recipe saved" : "⭐ Save recipe"}
          </button>
        </div>
        <ReactMarkdown className="prose-recipe">{recipe}</ReactMarkdown>
      </article>
    </section>
  );
}
