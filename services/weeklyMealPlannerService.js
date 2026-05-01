import { getAuthToken } from "./authService";

async function mealPlanRequest(path, options = {}) {
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

export async function getWeeklyMealPlan() {
  const payload = await mealPlanRequest("/api/weekly_meal_plan.php", { method: "GET" });
  return payload.slots || [];
}

export async function assignWeeklyMealSlot(dayOfWeek, mealType, savedRecipeId) {
  const payload = await mealPlanRequest("/api/weekly_meal_plan.php", {
    method: "PUT",
    body: JSON.stringify({ dayOfWeek, mealType, savedRecipeId }),
  });
  return payload.slot;
}

export async function clearWeeklyMealSlot(dayOfWeek, mealType) {
  await mealPlanRequest("/api/weekly_meal_plan.php", {
    method: "DELETE",
    body: JSON.stringify({ dayOfWeek, mealType }),
  });
}

export async function clearWholeWeekPlan() {
  await mealPlanRequest("/api/weekly_meal_plan.php?scope=week", {
    method: "DELETE",
    body: "{}",
  });
}
