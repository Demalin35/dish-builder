import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher({ className = "" }) {
  const { t, i18n } = useTranslation();

  function switchLanguage(language) {
    if (i18n.language === language) return;
    i18n.changeLanguage(language);
  }

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white/90 px-1 py-1 shadow-[var(--shadow-soft)] ${className}`}
      role="group"
      aria-label={t("footer.language")}
    >
      <button
        type="button"
        onClick={() => switchLanguage("en")}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${
          i18n.language.startsWith("en")
            ? "bg-brand-100 text-brand-700"
            : "text-stone-600 hover:bg-stone-100"
        }`}
      >
        {t("header.languageEn")}
      </button>
      <button
        type="button"
        onClick={() => switchLanguage("ru")}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${
          i18n.language.startsWith("ru")
            ? "bg-brand-100 text-brand-700"
            : "text-stone-600 hover:bg-stone-100"
        }`}
      >
        {t("header.languageRu")}
      </button>
    </div>
  );
}
