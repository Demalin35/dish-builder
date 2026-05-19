import React from "react";
import { useTranslation } from "react-i18next";
import { useConvertMeasurementMutation } from "../redux/recipesApi";

const UNITS = ["grams", "milliliters"];

const DISCLAIMER_PATTERNS = [
  /\s*this is an (?:approximate )?estimate[^.?!]*[.?!]?\s*$/i,
  /\s*this is approximate[^.?!]*[.?!]?\s*$/i,
  /\s*(?:because|as|since) spoon size and ingredient density[^.?!]*[.?!]?\s*$/i,
  /\s*это приблизительн(?:ая|ую)?\s+оценк[^.?!]*[.?!]?\s*$/iu,
  /\s*это\s+оценк[^.?!]*(?:ложек|плотност)[^.?!]*[.?!]?\s*$/iu,
  /\s*(?:так как|поскольку)[^.?!]*(?:ложек|плотност)[^.?!]*[.?!]?\s*$/iu,
];

function isDisclaimerSentence(sentence) {
  const text = sentence.trim();
  if (!text) return true;

  return (
    /this is an?( approximate)? estimate/i.test(text) ||
    /this is approximate/i.test(text) ||
    /spoon size and ingredient density/i.test(text) ||
    /это приблизительн/i.test(text) ||
    /(?:размер ложек|плотност(?:ь|и) ингредиент)/iu.test(text)
  );
}

export function stripDisclaimerFromConversion(text) {
  if (!text?.trim()) return "";

  let cleaned = text.trim();
  for (const pattern of DISCLAIMER_PATTERNS) {
    cleaned = cleaned.replace(pattern, "").trim();
  }

  const sentences = cleaned.split(/(?<=[.!?…])\s+/u).filter(Boolean);
  const practical = sentences.filter((sentence) => !isDisclaimerSentence(sentence));

  return (practical.length ? practical.join(" ") : cleaned).trim();
}

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
  const [displayConversion, setDisplayConversion] = React.useState("");
  const [formError, setFormError] = React.useState("");

  const [convertMeasurement, { isLoading }] = useConvertMeasurementMutation();

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm({ ingredient, quantity, unit }, t);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setDisplayConversion("");
      const language = i18n.resolvedLanguage?.startsWith("ru") ? "ru" : "en";
      const data = await convertMeasurement({
        ingredient: ingredient.trim(),
        quantity: Number(quantity),
        unit,
        language,
      }).unwrap();
      setDisplayConversion(stripDisclaimerFromConversion(data.conversion || ""));
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
    <section className="kitchen-measure-converter mx-auto mt-12 w-full max-w-6xl pb-10 sm:mt-14">
      <article className="kitchen-converter-card overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-100/70 via-white to-brand-50/85 p-5 sm:p-7">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
            {t("home.kitchenMeasureConverter.label")}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {t("home.kitchenMeasureConverter.title")}
          </h3>
          <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-base">
            {t("home.kitchenMeasureConverter.description")}
          </p>
        </header>

        <form className="mt-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-1">
              <label
                className="mb-1.5 block text-sm font-medium text-stone-600"
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
                className="kitchen-converter-field"
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
                className="mb-1.5 block text-sm font-medium text-stone-600"
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
                className="kitchen-converter-field"
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
                className="mb-1.5 block text-sm font-medium text-stone-600"
                htmlFor="kitchen-measure-unit"
              >
                {t("home.kitchenMeasureConverter.unitLabel")}
              </label>
              <select
                id="kitchen-measure-unit"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                className="kitchen-converter-field"
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
              className="kitchen-converter-btn w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading
                ? t("home.kitchenMeasureConverter.converting")
                : t("home.kitchenMeasureConverter.convertButton")}
            </button>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm font-medium text-stone-500">
                <span
                  className="loading-spinner h-5 w-5 border-2 border-brand-100 border-t-brand-600"
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

        {displayConversion && (
          <div
            className="kitchen-converter-result mt-6 rounded-2xl p-4 sm:p-5"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              <div className="kitchen-converter-result-icon" aria-hidden="true">
                💡
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                  {t("home.kitchenMeasureConverter.resultTitle")}
                </p>
                <p className="mt-2 text-sm font-normal leading-relaxed text-stone-700 sm:text-base">
                  {displayConversion}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-stone-500 sm:text-sm">
                  {t("home.kitchenMeasureConverter.resultDisclaimer")}
                </p>
              </div>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
