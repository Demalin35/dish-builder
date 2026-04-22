import RecipeCarousel from "./RecipeCarousel";

export default function IngredientsList({
  ingredients,
  onGetRecipe,
  onRemoveIngredient,
  onQuickAddIngredients,
}) {
  if (ingredients.length === 0) {
    return <RecipeCarousel onQuickAdd={onQuickAddIngredients} />;
  }

  const ingredientsListItems = ingredients.map((ingredient) => (
    <li key={ingredient} className="ingredient-item">
      <button
        type="button"
        className="ingredient-check"
        aria-label={`Remove ${ingredient}`}
        title={`Remove ${ingredient}`}
        onClick={() => onRemoveIngredient(ingredient)}
      >
        ✓
      </button>
      <span className="ingredient-name">{ingredient}</span>
    </li>
  ));

  return (
    <section>
      <div className="ingredients-centered">
        <h2>Ingredients on hand:</h2>
        <ul className="ingredients-list" aria-live="polite">
          {ingredientsListItems}
        </ul>
      </div>

      {ingredients.length >= 3 && (
        <div className="get-recipe-container">
          <div>
            <h3>Ready for a recipe?</h3>
            <p>Generate a recipe from your list of ingredients.</p>
          </div>
          <button onClick={onGetRecipe}>Get a recipe</button>
        </div>
      )}
    </section>
  );
}
// if (ingredients.length === 0) return null;

// const ingredientsListItems = ingredients.map((ingredient) => (
//   <li key={ingredient} className="ingredient-item">
//     <button
//       type="button"
//       className="ingredient-check"
//       aria-label={`Remove ${ingredient}`}
//       title={`Remove ${ingredient}`}
//       onClick={() => onRemoveIngredient(ingredient)}
//     >
//       ✓
//     </button>
//     <span className="ingredient-name">{ingredient}</span>
//   </li>
// ));

//   return (
//     <section>
//       <div className="ingredients-centered">
//         <h2>Ingredients on hand:</h2>
//         <ul className="ingredients-list" aria-live="polite">
//           {ingredientsListItems}
//         </ul>
//       </div>

//       {ingredients.length >= 3 && (
//         <div className="get-recipe-container">
//           <div>
//             <h3>Ready for a recipe?</h3>
//             <p>Generate a recipe from your list of ingredients.</p>
//           </div>
//           <button onClick={onGetRecipe}>Get a recipe</button>
//         </div>
//       )}
//     </section>
//   );
// }
