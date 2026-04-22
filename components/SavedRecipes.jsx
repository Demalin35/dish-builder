import React from "react";
import ReactMarkdown from "react-markdown";
import "./SavedRecipes.css";

export default function SavedRecipes() {
  const [recipes, setRecipes] = React.useState([]);

  React.useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
    setRecipes(stored);
  }, []);

  return (
    <section className="saved-recipes-page">
      <h2>Saved Recipes</h2>

      {recipes.length === 0 && <p>No saved recipes yet.</p>}

      {recipes.map((recipe, index) => (
        <article key={index} className="recipe-card">
          <ReactMarkdown>{recipe}</ReactMarkdown>
        </article>
      ))}
    </section>
  );
}
