const recipeImageCache = new Map();

function normalizeTitle(recipeTitle) {
  return (recipeTitle || "").trim().toLowerCase();
}

export async function fetchRecipeImage(recipeTitle) {
  const normalizedTitle = normalizeTitle(recipeTitle);
  if (!normalizedTitle) {
    return null;
  }

  if (recipeImageCache.has(normalizedTitle)) {
    return recipeImageCache.get(normalizedTitle);
  }

  const request = fetch(
    `/api/recipe_image.php?query=${encodeURIComponent(recipeTitle)}`,
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

  recipeImageCache.set(normalizedTitle, request);
  return request;
}
