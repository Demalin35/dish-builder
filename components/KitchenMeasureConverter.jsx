import React from "react";
import { useTranslation } from "react-i18next";
import { useConvertMeasurementMutation } from "../redux/recipesApi";

const UNITS = ["grams", "milliliters"];

function validateForm({ ingredient, quantity, unit }, t) {
  const errors = {};
  const trimmedIngredient = ingredient.trim();

  if (!trimmedIngredient) {
    errors.ingredient = t("home.kitchenMeasureConverter.errors.ingredientRequired");
  }

  const parsedQuantity = Number(quantity);
  if (quantity === "" || quantity === null || quantity === undefined) {
    errors.quantity = t("home.kitchenMeasureConverter.errors.quantityRequired");
  } else if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    errors.quantity = t("home.kitchenMeasureConverter.errors.quantityInvalid");
  }

  if (!UNITS.includes(unit)) {
    errors.unit = t("home.kitchenMeasureConverter.errors.unitInvalid");
  }

  return errors;
}

export default function KitchenMeasureConverter() {
  const { t, i18n } = useTranslation();
  const [ingredient, setIngredient] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [unit, setUnit] = React.useState("grams");
  const [errors, setErrors] = React.useState({});
  const [conversion, setConversion] = React.useState("");
  const [formError, setFormError] = React.useState("");

  const [convertMeasurement, { isLoading }] = useConvertMeasurementMutation();

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm({ ingredient, quantity, unit }, t);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setConversion("");
      const language = i18n.resolvedLanguage?.startsWith("ru") ? "ru" : "en";
      const data = await convertMeasurement({
        ingredient: ingredient.trim(),
        quantity: Number(quantity),
        unit,
        language,
      }).unwrap();
      setConversion(data.conversion || "");
    } catch (error) {
      setFormError(
        error?.data?.error ||
          error?.error ||
          error?.message ||
          t("home.kitchenMeasureConverter.errors.convertFailed")
      );
    }
  }

  return (
    <section className="mx-auto mt-10 w-full max-w-6xl">
      <article className="surface-card rounded-3xl p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
          {t("home.kitchenMeasureConverter.label")}
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          {t("home.kitchenMeasureConverter.title")}
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-base">
          {t("home.kitchenMeasureConverter.description")}
        </p>

        <form className="mt-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-1">
              <label
                className="mb-1.5 block text-sm font-medium text-stone-700"
                htmlFor="kitchen-measure-ingredient"
              >
                {t("home.kitchenMeasureConverter.ingredientLabel")}
              </label>
              <input
                id="kitchen-measure-ingredient"
                type="text"
                value={ingredient}
                onChange={(event) => setIngredient(event.target.value)}
                placeholder={t("home.kitchenMeasureConverter.ingredientPlaceholder")}
                className="field-input"
                disabled={isLoading}
              />
              {errors.ingredient && (
                <p className="mt-1.5 text-sm text-rose-700" role="alert">
                  {errors.ingredient}
                </p>
              )}
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-stone-700"
                htmlFor="kitchen-measure-quantity"
              >
                {t("home.kitchenMeasureConverter.quantityLabel")}
              </label>
              <input
                id="kitchen-measure-quantity"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder={t("home.kitchenMeasureConverter.quantityPlaceholder")}
                className="field-input"
                disabled={isLoading}
              />
              {errors.quantity && (
                <p className="mt-1.5 text-sm text-rose-700" role="alert">
                  {errors.quantity}
                </p>
              )}
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-stone-700"
                htmlFor="kitchen-measure-unit"
              >
                {t("home.kitchenMeasureConverter.unitLabel")}
              </label>
              <select
                id="kitchen-measure-unit"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                className="field-input"
                disabled={isLoading}
              >
                <option value="grams">{t("home.kitchenMeasureConverter.unitGrams")}</option>
                <option value="milliliters">
                  {t("home.kitchenMeasureConverter.unitMilliliters")}
                </option>
              </select>
              {errors.unit && (
                <p className="mt-1.5 text-sm text-rose-700" role="alert">
                  {errors.unit}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="btn btn-primary btn-md w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading
                ? t("home.kitchenMeasureConverter.converting")
                : t("home.kitchenMeasureConverter.convertButton")}
            </button>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
                <span
                  className="loading-spinner h-5 w-5 border-2"
                  aria-hidden="true"
                />
                <span aria-live="polite">{t("home.kitchenMeasureConverter.loadingHint")}</span>
              </div>
            )}
          </div>

          {formError && (
            <p className="mt-4 text-sm font-medium text-rose-700" role="alert">
              {formError}
            </p>
          )}
        </form>

        {conversion && (
          <div
            className="recipe-section mt-6 border-brand-200 bg-brand-50/60"
            role="status"
            aria-live="polite"
          >
            <p className="recipe-section-title text-brand-700">
              {t("home.kitchenMeasureConverter.resultTitle")}
            </p>
            <p className="text-sm leading-relaxed text-stone-700 sm:text-base">{conversion}</p>
          </div>
        )}
      </article>
    </section>
  );
}
