import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const { t } = useTranslation();
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = React.useState({});
  const [formError, setFormError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  function validate() {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = t("auth.signUp.errors.nameRequired");
    if (!formData.email.trim()) nextErrors.email = t("auth.signUp.errors.emailRequired");
    if (!/\S+@\S+\.\S+/.test(formData.email)) nextErrors.email = t("auth.signUp.errors.emailInvalid");
    if (formData.password.length < 6) nextErrors.password = t("auth.signUp.errors.passwordMinLength");
    if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = t("auth.signUp.errors.passwordMismatch");
    }
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
      await signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/account", { replace: true });
    } catch (error) {
      setFormError(error.message || t("auth.signUp.errors.submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container-page py-8 sm:py-12">
      <section className="grid overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-soft-lg)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="auth-panel-gradient p-7 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
            {t("auth.signUp.badge")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("auth.signUp.title")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-700 sm:text-base">
            {t("auth.signUp.subtitle")}
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
            {t("auth.signUp.formTitle")}
          </h2>
          <p className="mt-2 text-sm text-stone-600">{t("auth.signUp.formSubtitle")}</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="signup-name">
                {t("auth.signUp.nameLabel")}
              </label>
              <input
                id="signup-name"
                type="text"
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, name: event.target.value }))
                }
                className={`field-input ${errors.name ? "border-rose-300 focus-visible:ring-rose-200" : ""}`}
                placeholder={t("auth.signUp.namePlaceholder")}
              />
              {errors.name && <p className="mt-1 text-xs font-medium text-rose-600">{errors.name}</p>}
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-stone-700"
                htmlFor="signup-email"
              >
                {t("auth.signUp.emailLabel")}
              </label>
              <input
                id="signup-email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, email: event.target.value }))
                }
                className={`field-input ${errors.email ? "border-rose-300 focus-visible:ring-rose-200" : ""}`}
                placeholder={t("auth.signUp.emailPlaceholder")}
              />
              {errors.email && <p className="mt-1 text-xs font-medium text-rose-600">{errors.email}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-stone-700"
                  htmlFor="signup-password"
                >
                  {t("auth.signUp.passwordLabel")}
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className={`field-input ${errors.password ? "border-rose-300 focus-visible:ring-rose-200" : ""}`}
                  placeholder={t("auth.signUp.passwordPlaceholder")}
                />
                {errors.password && (
                  <p className="mt-1 text-xs font-medium text-rose-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-stone-700"
                  htmlFor="signup-confirm-password"
                >
                  {t("auth.signUp.confirmPasswordLabel")}
                </label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                  className={`field-input ${errors.confirmPassword ? "border-rose-300 focus-visible:ring-rose-200" : ""}`}
                  placeholder={t("auth.signUp.confirmPasswordPlaceholder")}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs font-medium text-rose-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {formError && <p className="text-sm font-medium text-rose-600">{formError}</p>}

            <button
              type="submit"
              className="btn btn-auth-primary btn-lg w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("buttons.creatingAccount") : t("buttons.createAccount")}
            </button>
          </form>

          <p className="mt-5 text-sm text-stone-600">
            {t("auth.signUp.alreadyHaveAccount")}{" "}
            <Link to="/login" className="auth-link">
              {t("auth.signUp.signInLink")}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
