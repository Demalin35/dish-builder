import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
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
    if (!formData.name.trim()) nextErrors.name = "Name is required.";
    if (!formData.email.trim()) nextErrors.email = "Email is required.";
    if (!/\S+@\S+\.\S+/.test(formData.email)) nextErrors.email = "Enter a valid email.";
    if (formData.password.length < 6) nextErrors.password = "Use at least 6 characters.";
    if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
      setFormError(error.message || "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container-page py-8 sm:py-12">
      <section className="grid overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-soft-lg)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-7 text-white sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
            Start your kitchen profile
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Create your Dish Builder account
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brand-50 sm:text-base">
            Save recipes, track preferences, and build a personal cooking space
            ready for future sync features.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">Sign Up</h2>
          <p className="mt-2 text-sm text-stone-600">Create your account in under a minute.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="signup-name">
                Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, name: event.target.value }))
                }
                className={`field-input ${errors.name ? "border-rose-300 focus-visible:ring-rose-200" : ""}`}
                placeholder="Your name"
              />
              {errors.name && <p className="mt-1 text-xs font-medium text-rose-600">{errors.name}</p>}
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-stone-700"
                htmlFor="signup-email"
              >
                Email
              </label>
              <input
                id="signup-email"
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-stone-700"
                  htmlFor="signup-password"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className={`field-input ${errors.password ? "border-rose-300 focus-visible:ring-rose-200" : ""}`}
                  placeholder="At least 6 characters"
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
                  Confirm password
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
                  placeholder="Repeat password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs font-medium text-rose-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {formError && <p className="text-sm font-medium text-rose-600">{formError}</p>}

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-sm text-stone-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-600">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
