import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PAGE_KEYS = {
  "/how-it-works": "howItWorks",
  "/faq": "faq",
  "/contact": "contact",
};

export default function SupportPlaceholder() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const pageKey = PAGE_KEYS[pathname] || "howItWorks";

  return (
    <main className="container-page py-10 sm:py-14">
      <section className="surface-card mx-auto max-w-2xl rounded-3xl p-6 text-center sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
          {t("footer.support")}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          {t(`footer.placeholderPages.${pageKey}.title`)}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
          {t("footer.placeholderPages.description")}
        </p>
        <Link to="/" className="btn btn-primary btn-md mt-8 inline-flex">
          {t("footer.placeholderPages.backHome")}
        </Link>
      </section>
    </main>
  );
}
