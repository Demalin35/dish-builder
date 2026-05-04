const recipeImageCache = new Map();

function normalizeTitle(recipeTitle) {
  return (recipeTitle || "").trim().toLowerCase();
}

function normalizeIngredientList(ingredients) {
  if (!Array.isArray(ingredients)) return [];
  return ingredients
    .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
    .filter(Boolean)
    .sort();
}

export async function fetchRecipeImage(recipeTitle, options = {}) {
  const { ingredients = [], language = "en" } = options;
  const normalizedTitle = normalizeTitle(recipeTitle);
  if (!normalizedTitle) {
    return null;
  }

  const normalizedIngredients = normalizeIngredientList(ingredients);
  const normalizedLanguage = (language || "en").toLowerCase();
  const cacheKey = JSON.stringify({
    title: normalizedTitle,
    language: normalizedLanguage,
    ingredients: normalizedIngredients,
  });

  if (recipeImageCache.has(cacheKey)) {
    return recipeImageCache.get(cacheKey);
  }

  const searchParams = new URLSearchParams({
    query: recipeTitle,
    language: normalizedLanguage,
  });

  if (normalizedIngredients.length) {
    searchParams.set("ingredients", JSON.stringify(normalizedIngredients));
  }

  const request = fetch(
    `/api/recipe_image.php?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load recipe image (${response.status})`);
      }

      const data = await response.json();
      return data.image || null;
    })
    .catch(() => null);

  recipeImageCache.set(cacheKey, request);
  return request;
}
