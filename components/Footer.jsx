import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

const SOCIAL_LINKS = [
  { id: "instagram", href: "https://instagram.com", labelKey: "footer.social.instagram" },
  { id: "facebook", href: "https://facebook.com", labelKey: "footer.social.facebook" },
  { id: "twitter", href: "https://x.com", labelKey: "footer.social.twitter" },
];

function SocialIcon({ id }) {
  if (id === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      </svg>
    );
  }

  if (id === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M14 4h3V1h-3c-2.8 0-5 2.2-5 5v3H6v3h3v9h3v-9h3l1-3h-4V6c0-.6.4-1 1-1z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M18.9 3H22l-6.8 7.8L22.7 21h-6.2l-4.8-6.3L6.4 21H3.3l7.3-8.4L3.3 3h6.3l4.4 5.8L18.9 3zm-1.1 16h1.7L7.1 4.9H5.3L17.8 19z" />
    </svg>
  );
}

function scrollToHomeSection(sectionId, navigate, pathname) {
  if (pathname !== "/") {
    navigate(`/#${sectionId}`);
    return;
  }

  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  navigate(`/#${sectionId}`);
}

export default function Footer() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function goToAuthProtected(path) {
    if (isAuthenticated) {
      navigate(path);
      return;
    }
    navigate("/login", { state: { from: path } });
  }

  function handleRecipeGeneratorClick(event) {
    event.preventDefault();
    scrollToHomeSection("recipe-generator", navigate, pathname);
  }

  function handleKitchenHelpClick(event) {
    event.preventDefault();
    scrollToHomeSection("kitchen-measure-converter", navigate, pathname);
  }

  return (
    <footer className="site-footer mt-12 border-t border-[rgba(164,176,120,0.18)] sm:mt-14">
      <div className="container-page py-8 sm:py-12">
        <div className="footer-grid grid gap-6 lg:grid-cols-4 lg:gap-8">
          <div className="footer-brand max-w-sm">
            <p className="text-lg font-semibold tracking-tight text-stone-900">
              {t("header.brand")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              {t("footer.brandDescription")}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  aria-label={t(social.labelKey)}
                >
                  <SocialIcon id={social.id} />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-link-groups grid grid-cols-2 items-start gap-5 sm:gap-6 lg:contents">
            <nav className="footer-nav-column min-w-0" aria-label={t("footer.navigation")}>
            <h2 className="footer-column-title">{t("footer.navigation")}</h2>
            <ul className="footer-link-list mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
              <li>
                <a href="/#recipe-generator" className="footer-link" onClick={handleRecipeGeneratorClick}>
                  {t("footer.recipeGenerator")}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link text-left"
                  onClick={() => goToAuthProtected("/saved-recipes")}
                >
                  {t("footer.savedRecipes")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link text-left"
                  onClick={() => goToAuthProtected("/saved-recipes")}
                >
                  {t("footer.menuPlanner")}
                </button>
              </li>
              <li>
                <a
                  href="/#kitchen-measure-converter"
                  className="footer-link"
                  onClick={handleKitchenHelpClick}
                >
                  {t("footer.kitchenHelp")}
                </a>
              </li>
            </ul>
          </nav>

          <nav className="footer-nav-column min-w-0" aria-label={t("footer.support")}>
            <h2 className="footer-column-title">{t("footer.support")}</h2>
            <ul className="footer-link-list mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
              <li>
                <Link to="/how-it-works" className="footer-link">
                  {t("footer.howItWorks")}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link">
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  {t("footer.contactUs")}
                </Link>
              </li>
            </ul>
          </nav>
          </div>

          <div className="footer-language min-w-0">
            <h2 className="footer-column-title">{t("footer.language")}</h2>
            <p className="mt-3 text-xs leading-relaxed text-stone-600 sm:mt-4 sm:text-sm">
              {t("footer.languageHint")}
            </p>
            <LanguageSwitcher className="mt-3 sm:mt-4" />
          </div>
        </div>

        <div className="footer-copyright mt-8 border-t border-[rgba(164,176,120,0.14)] pt-5 text-center text-xs text-stone-500 sm:mt-10 sm:pt-6 sm:text-sm">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
