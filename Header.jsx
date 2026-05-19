import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "./context/AuthContext";
import LanguageSwitcher from "./components/LanguageSwitcher";

export default function Header() {
  const { isAuthenticated, signOut, user } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-white/80 backdrop-blur-xl">
      <div className="container-page flex flex-col gap-2 py-2 sm:min-h-16 sm:flex-row sm:items-center sm:justify-between sm:py-3">
        <Link to="/" className="group inline-flex items-center self-start sm:self-auto">
          <h1 className="logo-gradient-current whitespace-nowrap bg-clip-text text-2xl font-semibold tracking-tight text-transparent transition group-hover:opacity-90 sm:text-3xl">
            {t("header.brand")}
          </h1>
        </Link>

        <nav
          className="inline-flex w-full items-center rounded-2xl border border-stone-200 bg-white/90 p-1 shadow-[var(--shadow-soft)] sm:w-auto sm:justify-start sm:gap-2"
          aria-label="Primary"
        >
          <LanguageSwitcher className="shrink-0" />

          {!isAuthenticated && (
            <div className="ml-auto inline-flex items-center gap-1 sm:ml-0 sm:gap-2">
              <Link
                to="/login"
                className="inline-flex min-h-8 items-center whitespace-nowrap rounded-xl border border-transparent px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition duration-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 active:translate-y-px sm:min-h-9 sm:px-3 sm:py-2 sm:text-sm"
              >
                {t("header.signIn")}
              </Link>
              <Link
                to="/signup"
                className="inline-flex min-h-8 items-center whitespace-nowrap rounded-xl border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition duration-200 hover:border-brand-300 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 active:translate-y-px sm:min-h-9 sm:px-3 sm:py-2 sm:text-sm"
              >
                {t("header.signUp")}
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <>
              <Link
                to="/saved-recipes"
                className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-stone-700 transition duration-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 active:translate-y-px"
              >
                <span aria-hidden="true">⭐</span>
                <span className="hidden sm:inline">{t("header.savedRecipesFull")}</span>
                <span className="sm:hidden">{t("header.savedRecipesShort")}</span>
              </Link>
              <Link
                to="/account"
                className="inline-flex min-h-9 items-center rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition duration-200 hover:border-brand-300 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 active:translate-y-px"
              >
                {user?.name
                  ? `${t("header.account")} (${user.name.split(" ")[0]})`
                  : t("header.account")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOut();
                }}
                className="inline-flex min-h-9 items-center rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 active:translate-y-px"
              >
                {t("header.logout")}
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
