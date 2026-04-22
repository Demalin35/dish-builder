import React from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
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
    if (!formData.email.trim()) nextErrors.email = "Email is required.";
    if (!/\S+@\S+\.\S+/.test(formData.email)) nextErrors.email = "Enter a valid email.";
    if (!formData.password) nextErrors.password = "Password is required.";
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
      setFormError(error.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container-page py-8 sm:py-12">
      <section className="grid overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-soft-lg)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-gradient-to-br from-brand-600 to-brand-500 p-7 text-white sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-100">
            Welcome back
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Sign in to your Dish Builder account
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-orange-50/95 sm:text-base">
            Access your saved recipes and keep your personal cooking preferences
            in sync.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">Sign In</h2>
          <p className="mt-2 text-sm text-stone-600">Use your email and password to continue.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="signin-email">
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, email: event.target.value }))
                }
                className={`field-input ${errors.email ? "border-rose-300 focus-visible:ring-rose-200" : ""}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs font-medium text-rose-600">{errors.email}</p>}
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-stone-700"
                htmlFor="signin-password"
              >
                Password
              </label>
              <input
                id="signin-password"
                type="password"
                value={formData.password}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, password: event.target.value }))
                }
                className={`field-input ${errors.password ? "border-rose-300 focus-visible:ring-rose-200" : ""}`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.password}</p>
              )}
            </div>

            {formError && <p className="text-sm font-medium text-rose-600">{formError}</p>}

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-sm text-stone-600">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-brand-700 hover:text-brand-600">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
