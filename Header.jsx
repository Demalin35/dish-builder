import { Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function Header() {
  const { isAuthenticated, signOut, user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-white/80 backdrop-blur-xl">
      <div className="container-page flex min-h-16 items-center justify-between py-3">
        <Link to="/" className="group inline-flex items-center">
          <h1 className="logo-gradient-current bg-clip-text text-2xl font-semibold tracking-tight text-transparent transition group-hover:opacity-90 sm:text-3xl">
            Dish Builder
          </h1>
        </Link>

        <nav
          className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white/90 p-1 shadow-[var(--shadow-soft)]"
          aria-label="Primary"
        >
          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className="inline-flex min-h-9 items-center rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-stone-700 transition duration-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 active:translate-y-px"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="inline-flex min-h-9 items-center rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition duration-200 hover:border-brand-300 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 active:translate-y-px"
              >
                Sign up
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <Link
                to="/saved-recipes"
                className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-stone-700 transition duration-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 active:translate-y-px"
              >
                <span aria-hidden="true">⭐</span>
                <span className="hidden sm:inline">Saved recipes</span>
                <span className="sm:hidden">Saved</span>
              </Link>
              <Link
                to="/account"
                className="inline-flex min-h-9 items-center rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition duration-200 hover:border-brand-300 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 active:translate-y-px"
              >
                {user?.name ? `Account (${user.name.split(" ")[0]})` : "Account"}
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOut();
                }}
                className="inline-flex min-h-9 items-center rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 active:translate-y-px"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
