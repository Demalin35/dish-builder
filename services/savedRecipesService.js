import { getAuthToken } from "./authService";

async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

export async function getUserSavedRecipes() {
  const payload = await apiRequest("/api/saved_recipes.php", { method: "GET" });
  return payload.recipes || [];
}

export async function saveRecipeForUser(recipe) {
  try {
    await apiRequest("/api/saved_recipes.php", {
      method: "POST",
      body: JSON.stringify({ content: recipe }),
    });
    return true;
  } catch (error) {
    if (error.message === "Recipe already saved") return false;
    throw error;
  }
}

export async function deleteSavedRecipeForUser(recipeId) {
  await apiRequest("/api/saved_recipes.php", {
    method: "DELETE",
    body: JSON.stringify({ id: recipeId }),
  });
}
