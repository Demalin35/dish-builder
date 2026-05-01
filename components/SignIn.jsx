import React from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
  const { t } = useTranslation();
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/account";

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState({});
  const [formError, setFormError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  function validate() {
    const nextErrors = {};
    if (!formData.email.trim()) nextErrors.email = t("auth.signIn.errors.emailRequired");
    if (!/\S+@\S+\.\S+/.test(formData.email)) nextErrors.email = t("auth.signIn.errors.emailInvalid");
    if (!formData.password) nextErrors.password = t("auth.signIn.errors.passwordRequired");
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      await signIn(formData);
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(error.message || t("auth.signIn.errors.submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container-page py-8 sm:py-12">
      <section className="grid overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-soft-lg)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="auth-panel-gradient p-7 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
            {t("auth.signIn.badge")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("auth.signIn.title")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-700 sm:text-base">
            {t("auth.signIn.subtitle")}
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
            {t("auth.signIn.formTitle")}
          </h2>
          <p className="mt-2 text-sm text-stone-600">{t("auth.signIn.formSubtitle")}</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="signin-email">
                {t("auth.signIn.emailLabel")}
              </label>
              <input
                id="signin-email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, email: event.target.value }))
                }
                className={`field-input ${errors.email ? "border-rose-300 focus-visible:ring-rose-200" : ""}`}
                placeholder={t("auth.signIn.emailPlaceholder")}
              />
              {errors.email && <p className="mt-1 text-xs font-medium text-rose-600">{errors.email}</p>}
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-stone-700"
                htmlFor="signin-password"
              >
                {t("auth.signIn.passwordLabel")}
              </label>
              <input
                id="signin-password"
                type="password"
                value={formData.password}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, password: event.target.value }))
                }
                className={`field-input ${errors.password ? "border-rose-300 focus-visible:ring-rose-200" : ""}`}
                placeholder={t("auth.signIn.passwordPlaceholder")}
              />
              {errors.password && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.password}</p>
              )}
            </div>

            {formError && <p className="text-sm font-medium text-rose-600">{formError}</p>}

            <button
              type="submit"
              className="btn btn-auth-primary btn-lg w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("buttons.signingIn") : t("buttons.signIn")}
            </button>
          </form>

          <p className="mt-5 text-sm text-stone-600">
            {t("auth.signIn.newHere")}{" "}
            <Link to="/signup" className="auth-link">
              {t("auth.signIn.createAccountLink")}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
