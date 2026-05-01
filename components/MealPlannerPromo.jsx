import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import mealPlannerImage from "../images/meal-planner.png";

export default function MealPlannerPromo() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  function handleCtaClick() {
    if (isAuthenticated) {
      navigate("/saved-recipes");
      return;
    }

    navigate("/login", { state: { from: "/saved-recipes" } });
  }

  return (
    <section className="mx-auto mt-10 w-full max-w-6xl">
      <article className="overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-100/70 via-white to-brand-50/85 shadow-[var(--shadow-soft-lg)]">
        <div className="grid gap-0 md:grid-cols-[1fr_1.1fr] md:items-stretch">
          <div className="order-1">
            <img
              src={mealPlannerImage}
              alt={t("home.mealPlannerPromo.title")}
              className="h-56 w-full object-cover sm:h-64 md:h-full"
              loading="lazy"
            />
          </div>

          <div className="order-2 flex flex-col justify-center p-5 sm:p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              {t("home.mealPlannerPromo.label")}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
              {t("home.mealPlannerPromo.title")}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
              {t("home.mealPlannerPromo.description")}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCtaClick}
                className="btn btn-primary btn-md w-full sm:w-auto"
              >
                {t("home.mealPlannerPromo.button")}
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
