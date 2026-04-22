import React from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserSavedRecipes } from "../services/savedRecipesService";

function parseRecipeMeta(recipeText, fallbackIndex) {
  const lines = recipeText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const titleLine =
    lines.find((line) => /^#{1,3}\s+/.test(line)) ||
    lines.find((line) => /^[A-Za-z].{8,}$/.test(line));

  const title = titleLine
    ? titleLine.replace(/^#{1,3}\s+/, "")
    : `Saved recipe ${fallbackIndex + 1}`;

  const preview =
    lines.find((line) => !line.startsWith("#")) ||
    "A saved dish idea ready for your next cook.";

  const words = recipeText
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const stopWords = new Set([
    "the",
    "and",
    "with",
    "from",
    "then",
    "that",
    "into",
    "your",
    "for",
    "this",
    "are",
    "you",
    "add",
    "mix",
    "cook",
    "until",
    "minutes",
    "minute",
    "recipe",
  ]);

  const uniqueKeywords = [];
  for (const word of words) {
    if (word.length < 4 || stopWords.has(word)) continue;
    if (!uniqueKeywords.includes(word)) uniqueKeywords.push(word);
    if (uniqueKeywords.length >= 4) break;
  }

  return { title, preview, tags: uniqueKeywords };
}

export default function SavedRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    setIsLoading(true);
    setError("");

    getUserSavedRecipes()
      .then((items) => {
        if (!isMounted) return;
        setRecipes(items);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Unable to load saved recipes.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <section className="container-page py-8 sm:py-10">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
          Your cookbook
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Saved Recipes
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
          Keep your best recipe ideas in one place and quickly jump back into cooking.
        </p>
      </header>

      {isLoading && (
        <p className="mt-7 text-sm font-medium text-stone-600">Loading saved recipes...</p>
      )}

      {error && (
        <p className="mt-7 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      {!isLoading && !error && recipes.length === 0 && (
        <article className="surface-card mt-7 grid gap-5 rounded-3xl border-dashed p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div>
            <h3 className="text-xl font-semibold text-stone-800">No saved recipes yet</h3>
            <p className="mt-2 text-sm text-stone-600 sm:text-base">
              Save a recipe from the Dish Builder results and it will appear here for easy reuse.
            </p>
          </div>
          <Link to="/" className="btn btn-primary btn-md w-full sm:w-auto">
            Start building recipes
          </Link>
        </article>
      )}

      {!isLoading && !error && recipes.length > 0 && (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {recipes.map((recipeItem, index) => {
            const meta = parseRecipeMeta(recipeItem.content, index);
            return (
              <article
                key={recipeItem.id}
                className="recipe-card surface-card flex h-full flex-col rounded-3xl p-5 sm:p-6"
              >
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Saved #{index + 1}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-stone-900">
                    {meta.title}
                  </h3>
                  <p className="mt-2 text-sm text-stone-600">{meta.preview}</p>
                </div>

                {meta.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {meta.tags.map((tag) => (
                      <span
                        key={`${index}-${tag}`}
                        className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <details className="group mt-auto">
                  <summary className="btn btn-secondary btn-sm cursor-pointer list-none marker:content-none">
                    View full recipe
                  </summary>
                  <div className="mt-4 rounded-2xl bg-stone-50 p-4">
                    <ReactMarkdown className="prose-recipe">{recipeItem.content}</ReactMarkdown>
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
