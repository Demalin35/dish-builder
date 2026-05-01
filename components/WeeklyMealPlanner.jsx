import React from "react";
import { useTranslation } from "react-i18next";
import {
  assignWeeklyMealSlot,
  clearWholeWeekPlan,
  clearWeeklyMealSlot,
  getWeeklyMealPlan,
} from "../services/weeklyMealPlannerService";

const DAYS = [
  { id: 1, key: "monday" },
  { id: 2, key: "tuesday" },
  { id: 3, key: "wednesday" },
  { id: 4, key: "thursday" },
  { id: 5, key: "friday" },
  { id: 6, key: "saturday" },
  { id: 7, key: "sunday" },
];

const MEALS = [
  { key: "breakfast", emoji: "🍳" },
  { key: "lunch", emoji: "🥗" },
  { key: "dinner", emoji: "🍽️" },
];

function slotKey(dayId, mealType) {
  return `${dayId}:${mealType}`;
}

function createEmptyPlan() {
  const plan = {};
  for (const day of DAYS) {
    for (const meal of MEALS) {
      plan[slotKey(day.id, meal.key)] = null;
    }
  }
  return plan;
}

export default function WeeklyMealPlanner({ recipes }) {
  const { t } = useTranslation();
  const [plan, setPlan] = React.useState(() => createEmptyPlan());
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [pendingSlot, setPendingSlot] = React.useState("");
  const [isClearingWeek, setIsClearingWeek] = React.useState(false);

  const recipesById = React.useMemo(() => {
    const index = new Map();
    for (const recipe of recipes) {
      index.set(recipe.id, recipe);
    }
    return index;
  }, [recipes]);

  const plannedCount = React.useMemo(
    () => Object.values(plan).filter(Boolean).length,
    [plan]
  );
  const totalSlots = DAYS.length * MEALS.length;

  React.useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError("");

    getWeeklyMealPlan()
      .then((slots) => {
        if (!isActive) return;
        const nextPlan = createEmptyPlan();
        for (const slot of slots) {
          const key = slotKey(slot.dayOfWeek, slot.mealType);
          nextPlan[key] = slot.savedRecipeId || null;
        }
        setPlan(nextPlan);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(err.message || t("mealPlanner.loadError"));
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [t]);

  async function handleAssign(dayId, mealType, savedRecipeIdValue) {
    const savedRecipeId = Number(savedRecipeIdValue);
    if (!savedRecipeId) return;
    const key = slotKey(dayId, mealType);
    const previousValue = plan[key];

    setPendingSlot(key);
    setError("");
    setPlan((prev) => ({ ...prev, [key]: savedRecipeId }));

    try {
      await assignWeeklyMealSlot(dayId, mealType, savedRecipeId);
    } catch (err) {
      setPlan((prev) => ({ ...prev, [key]: previousValue || null }));
      setError(err.message || t("mealPlanner.saveError"));
    } finally {
      setPendingSlot("");
    }
  }

  async function handleClearSlot(dayId, mealType) {
    const key = slotKey(dayId, mealType);
    const previousValue = plan[key];

    setPendingSlot(key);
    setError("");
    setPlan((prev) => ({ ...prev, [key]: null }));

    try {
      await clearWeeklyMealSlot(dayId, mealType);
    } catch (err) {
      setPlan((prev) => ({ ...prev, [key]: previousValue || null }));
      setError(err.message || t("mealPlanner.saveError"));
    } finally {
      setPendingSlot("");
    }
  }

  async function handleClearWeek() {
    const previousPlan = plan;
    setIsClearingWeek(true);
    setError("");
    setPlan(createEmptyPlan());

    try {
      await clearWholeWeekPlan();
    } catch (err) {
      setPlan(previousPlan);
      setError(err.message || t("mealPlanner.saveError"));
    } finally {
      setIsClearingWeek(false);
    }
  }

  return (
    <section className="surface-card mt-8 rounded-3xl p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            📅 {t("mealPlanner.title")}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {t("mealPlanner.title")}
          </h3>
          <p className="mt-2 text-sm text-stone-600 sm:text-base">{t("mealPlanner.subtitle")}</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm sm:btn-md whitespace-nowrap"
          onClick={handleClearWeek}
          disabled={isLoading || isClearingWeek}
        >
          {t("mealPlanner.clearWeek")}
        </button>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm font-medium text-stone-600">
          <span>
            {t("mealPlanner.progress", {
              planned: plannedCount,
              total: totalSlots,
            })}
          </span>
          <span>{Math.round((plannedCount / totalSlots) * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-300"
            style={{ width: `${(plannedCount / totalSlots) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="mt-5 text-sm text-stone-600">{t("mealPlanner.loading")}</p>
      ) : recipes.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-brand-200 bg-brand-50/80 px-4 py-3 text-sm font-medium text-brand-700">
          {t("mealPlanner.noSavedRecipes")}
        </p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {DAYS.map((day) => (
            <article
              key={day.id}
              className="rounded-2xl border border-brand-200/70 bg-gradient-to-br from-brand-100/70 via-white to-brand-50/80 p-4 shadow-[var(--shadow-soft)]"
            >
              <h4 className="text-base font-semibold text-stone-900">
                {t(`mealPlanner.${day.key}`)}
              </h4>
              <ul className="mt-3 space-y-3">
                {MEALS.map((meal) => {
                  const key = slotKey(day.id, meal.key);
                  const selectedRecipeId = plan[key];
                  const selectedRecipe = selectedRecipeId
                    ? recipesById.get(selectedRecipeId)
                    : null;
                  const isPending = pendingSlot === key;

                  return (
                    <li key={meal.key} className="rounded-xl border border-stone-200 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-600">
                        {meal.emoji} {t(`mealPlanner.${meal.key}`)}
                      </p>

                      {selectedRecipe ? (
                        <div className="mt-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="line-clamp-1 text-sm font-medium text-stone-800">
                              ✅ {selectedRecipe.content.split("\n")[0].replace(/^#+\s*/, "").trim() || t("mealPlanner.planned")}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost whitespace-nowrap"
                              onClick={() => handleClearSlot(day.id, meal.key)}
                              disabled={isPending || isClearingWeek}
                            >
                              {t("mealPlanner.removeRecipe")}
                            </button>
                          </div>
                          <select
                            className="field-input mt-2 h-10 text-sm"
                            value={selectedRecipeId || ""}
                            onChange={(event) =>
                              handleAssign(day.id, meal.key, event.target.value)
                            }
                            disabled={isPending || isClearingWeek}
                          >
                            <option value="">{t("mealPlanner.addRecipe")}</option>
                            {recipes.map((recipe) => (
                              <option key={recipe.id} value={recipe.id}>
                                {recipe.content.split("\n")[0].replace(/^#+\s*/, "").trim() ||
                                  `${t("savedRecipes.fallbackTitle", { index: recipe.id })}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <p className="text-xs text-stone-500">{t("mealPlanner.emptySlot")}</p>
                          <select
                            className="field-input mt-2 h-10 text-sm"
                            defaultValue=""
                            onChange={(event) =>
                              handleAssign(day.id, meal.key, event.target.value)
                            }
                            disabled={isPending || isClearingWeek}
                          >
                            <option value="">{t("mealPlanner.addRecipe")}</option>
                            {recipes.map((recipe) => (
                              <option key={recipe.id} value={recipe.id}>
                                {recipe.content.split("\n")[0].replace(/^#+\s*/, "").trim() ||
                                  `${t("savedRecipes.fallbackTitle", { index: recipe.id })}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
