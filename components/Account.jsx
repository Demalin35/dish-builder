import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { getUserSavedRecipes } from "../services/savedRecipesService";

export default function Account() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [savedCount, setSavedCount] = React.useState(0);

  React.useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    getUserSavedRecipes()
      .then((items) => {
        if (!isMounted) return;
        setSavedCount(items.length);
      })
      .catch(() => {
        if (!isMounted) return;
        setSavedCount(0);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <section className="container-page py-8 sm:py-10">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
          {t("account.badge")}
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          {t("account.title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
          {t("account.subtitle")}
        </p>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-card rounded-3xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {t("account.profileSummary")}
              </p>
              <h3 className="mt-1 text-xl font-semibold text-stone-900">
                {user?.name || t("account.defaultUserName")}
              </h3>
              <p className="mt-1 text-sm text-stone-600">
                {user?.email || t("account.defaultUserEmail")}
              </p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {t("account.statusActive")}
            </span>
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-stone-50 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {t("account.savedRecipes")}
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-stone-900">
                {savedCount}
              </dd>
            </div>
            <div className="rounded-2xl bg-stone-50 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {t("account.plan")}
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-stone-900">
                {t("account.planFree")}
              </dd>
            </div>
          </dl>
        </article>

        <article className="surface-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-stone-900">{t("account.personalInfo")}</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-stone-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {t("account.displayName")}
              </p>
              <p className="mt-1 text-sm font-medium text-stone-800">
                {user?.name || t("account.defaultUserName")}
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {t("account.email")}
              </p>
              <p className="mt-1 text-sm font-medium text-stone-800">
                {user?.email || t("account.defaultUserEmail")}
              </p>
            </div>
          </div>
        </article>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <article className="surface-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-stone-900">{t("account.preferences")}</h3>
          <ul className="mt-4 space-y-2.5">
            <li className="flex items-center justify-between rounded-2xl bg-stone-50 px-3 py-2.5">
              <span className="text-sm font-medium text-stone-700">{t("account.dietaryProfile")}</span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-stone-600 ring-1 ring-stone-200">
                {t("emptyStates.notSet")}
              </span>
            </li>
            <li className="flex items-center justify-between rounded-2xl bg-stone-50 px-3 py-2.5">
              <span className="text-sm font-medium text-stone-700">{t("account.weeklyMealGoals")}</span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-stone-600 ring-1 ring-stone-200">
                {t("emptyStates.comingSoon")}
              </span>
            </li>
            <li className="flex items-center justify-between rounded-2xl bg-stone-50 px-3 py-2.5">
              <span className="text-sm font-medium text-stone-700">{t("account.notifications")}</span>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                {t("account.notificationsEnabled")}
              </span>
            </li>
          </ul>
        </article>

        <article className="surface-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-stone-900">{t("account.savedRecipesOverview")}</h3>
          <p className="mt-2 text-sm text-stone-600">
            {t("account.savedRecipesSummary", { count: savedCount })}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link to="/saved-recipes" className="btn btn-secondary btn-md">
              {t("buttons.openSavedRecipes")}
            </Link>
            <Link to="/" className="btn btn-primary btn-md">
              {t("buttons.generateNewIdeas")}
            </Link>
          </div>
        </article>
      </div>

      <article className="surface-card mt-5 rounded-3xl border-dashed p-6">
        <h3 className="text-lg font-semibold text-stone-900">{t("account.futureSettings")}</h3>
        <p className="mt-2 text-sm text-stone-600">
          {t("account.futureSettingsText")}
        </p>
      </article>
    </section>
  );
}
