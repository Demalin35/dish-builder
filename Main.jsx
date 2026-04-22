import React from "react";
import IngredientsList from "./components/IngredientsList";
import { useGenerateRecipeMutation } from "./redux/recipesApi";
// import { useLazyGenerateRecipeQuery } from "./redux/recipesApi";
import DishBuilder from "./components/DishBuilder";

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
    const existing = JSON.parse(localStorage.getItem("savedRecipes") || "[]");

    if (existing.includes(recipe)) return;

    const updated = [...existing, recipe];

    localStorage.setItem("savedRecipes", JSON.stringify(updated));

    alert("Recipe saved!");
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
    <main>
      <form action={addIngredient} className="add-ingredient-form">
        <input
          type="text"
          placeholder="e.g. oregano"
          aria-label="Add ingredient"
          name="ingredient"
        />
        <button>Add ingredient</button>
      </form>

      <section className="quick-add-section" aria-label="Common ingredients">
        <p className="quick-add-title">Quick add:</p>
        <div className="quick-add-list">
          {COMMON_INGREDIENTS.map((item) => {
            const isAdded = ingredients.some(
              (ingredient) =>
                ingredient.toLowerCase() === item.value.toLowerCase()
            );

            return (
              <button
                key={item.value}
                type="button"
                className={`quick-add-chip ${isAdded ? "is-added" : ""}`}
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

      <IngredientsList
        ingredients={ingredients}
        onGetRecipe={onGetRecipe}
        onRemoveIngredient={removeIngredient}
        onQuickAddIngredients={handleQuickAddIngredients}
      />

      {isLoading && <p aria-live="polite">Generating recipe…</p>}
      {isError && (
        <p role="alert">
          Failed to generate recipe: {error?.data?.error || "Unknown error"}
        </p>
      )}

      {recipe && <DishBuilder recipe={recipe} onSaveRecipe={saveRecipe} />}
    </main>
  );
}
