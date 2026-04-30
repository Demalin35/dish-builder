import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserSavedRecipes } from "../services/savedRecipesService";

export default function Account() {
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
          Profile & settings
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Account
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
          Manage your cooking profile, preferences, and saved recipe activity.
        </p>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-card rounded-3xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Profile summary
              </p>
              <h3 className="mt-1 text-xl font-semibold text-stone-900">
                {user?.name || "Dish Builder User"}
              </h3>
              <p className="mt-1 text-sm text-stone-600">{user?.email || "account@dishbuilder.app"}</p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              Active
            </span>
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-stone-50 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Saved recipes
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-stone-900">
                {savedCount}
              </dd>
            </div>
            <div className="rounded-2xl bg-stone-50 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Plan
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-stone-900">
                Free
              </dd>
            </div>
          </dl>
        </article>

        <article className="surface-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-stone-900">Personal info</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-stone-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Display name
              </p>
              <p className="mt-1 text-sm font-medium text-stone-800">{user?.name || "Dish Builder User"}</p>
            </div>
            <div className="rounded-2xl border border-stone-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Email
              </p>
              <p className="mt-1 text-sm font-medium text-stone-800">
                {user?.email || "account@dishbuilder.app"}
              </p>
            </div>
          </div>
        </article>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <article className="surface-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-stone-900">Preferences</h3>
          <ul className="mt-4 space-y-2.5">
            <li className="flex items-center justify-between rounded-2xl bg-stone-50 px-3 py-2.5">
              <span className="text-sm font-medium text-stone-700">Dietary profile</span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-stone-600 ring-1 ring-stone-200">
                Not set
              </span>
            </li>
            <li className="flex items-center justify-between rounded-2xl bg-stone-50 px-3 py-2.5">
              <span className="text-sm font-medium text-stone-700">Weekly meal goals</span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-stone-600 ring-1 ring-stone-200">
                Coming soon
              </span>
            </li>
            <li className="flex items-center justify-between rounded-2xl bg-stone-50 px-3 py-2.5">
              <span className="text-sm font-medium text-stone-700">Notifications</span>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                Enabled
              </span>
            </li>
          </ul>
        </article>

        <article className="surface-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-stone-900">Saved recipes overview</h3>
          <p className="mt-2 text-sm text-stone-600">
            You currently have {savedCount} saved {savedCount === 1 ? "recipe" : "recipes"}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link to="/saved-recipes" className="btn btn-secondary btn-md">
              Open saved recipes
            </Link>
            <Link to="/" className="btn btn-primary btn-md">
              Generate new ideas
            </Link>
          </div>
        </article>
      </div>

      <article className="surface-card mt-5 rounded-3xl border-dashed p-6">
        <h3 className="text-lg font-semibold text-stone-900">Future settings</h3>
        <p className="mt-2 text-sm text-stone-600">
          This area is ready for connected features like pantry sync, shopping list
          defaults, and export options.
        </p>
      </article>
    </section>
  );
}
