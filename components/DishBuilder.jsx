import ReactMarkdown from "react-markdown";
import React from "react";

export default function DishBuilder({ recipe, onSaveRecipe }) {
  const [isSaved, setIsSaved] = React.useState(false);

  function handleSave() {
    onSaveRecipe(recipe);
    setIsSaved(true);
  }

  return (
    <section className="recipe-section">
      <h2 className="recipe-title">Dish Builder Recommends:</h2>
      <article className="recipe-card" aria-live="polite">
        <div className="recipe-card-actions">
          <button
            type="button"
            className={`save-recipe-btn ${isSaved ? "saved" : ""}`}
            onClick={handleSave}
            disabled={isSaved}
          >
            {isSaved ? "✅ Recipe saved" : "⭐ Save recipe"}
          </button>
        </div>
        <ReactMarkdown>{recipe}</ReactMarkdown>
      </article>
    </section>
  );
}
