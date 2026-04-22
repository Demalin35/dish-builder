import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-left"></div>

        <Link to="/" className="brand-link">
          <h1 className="brand-title">Dish Builder</h1>
        </Link>

        <nav class="header-actions" aria-label="Primary">
          <a href="/saved" class="saved-link">
            ⭐ <span>Saved recipes</span>
          </a>
          <a href="/account" class="header-action-link">
            Account
          </a>
        </nav>

        {/* <Link to="/saved" className="saved-link">
          ⭐ Saved recipes
        </Link> */}
      </div>
    </header>
  );
}
