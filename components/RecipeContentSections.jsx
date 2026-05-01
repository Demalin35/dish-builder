import React from "react";
import { useTranslation } from "react-i18next";
import { parseRecipeContent } from "../services/recipeContentService";

function tryParseStructuredRecipe(recipeContent) {
  if (typeof recipeContent !== "string") return recipeContent;

  const trimmed = recipeContent.trim();
  if (!trimmed.startsWith("{")) return recipeContent;

  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === "object" ? parsed : recipeContent;
  } catch {
    return recipeContent;
  }
}

export default function RecipeContentSections({ recipeContent }) {
  const { t } = useTranslation();

  const normalizedContent = React.useMemo(
    () => tryParseStructuredRecipe(recipeContent),
    [recipeContent]
  );
  const parsedRecipe = React.useMemo(
    () => parseRecipeContent(normalizedContent),
    [normalizedContent]
  );
  const imageMeta =
    normalizedContent && typeof normalizedContent === "object"
      ? {
          imageUrl: normalizedContent.imageUrl || normalizedContent.image_url || "",
          alt: normalizedContent.alt || normalizedContent.imageAlt || parsedRecipe.title,
        }
      : null;

  const rawText = typeof recipeContent === "string" ? recipeContent.trim() : "";
  const hasStructuredSections =
    parsedRecipe.ingredients.length > 0 || parsedRecipe.steps.length > 0;

  return (
    <div className="grid gap-5">
      {imageMeta?.imageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-brand-50/50">
          <img
            src={imageMeta.imageUrl}
            alt={imageMeta.alt || parsedRecipe.title}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      {parsedRecipe.introText && (
        <section className="recipe-section">
          <h4 className="recipe-section-title">📝 {t("recipeResult.summary")}</h4>
          <p className="text-sm leading-7 text-stone-700 sm:text-base">{parsedRecipe.introText}</p>
        </section>
      )}

      {hasStructuredSections ? (
        <>
          <section className="recipe-section">
            <h4 className="recipe-section-title">🧂 {t("recipeResult.ingredients")}</h4>
            {parsedRecipe.ingredients.length ? (
              <ul className="recipe-list">
                {parsedRecipe.ingredients.map((ingredient, index) => (
                  <li key={`${ingredient}-${index}`}>{ingredient}</li>
                ))}
              </ul>
            ) : (
              <p className="recipe-empty">{t("recipeResult.noIngredientsListed")}</p>
            )}
          </section>

          <section className="recipe-section">
            <h4 className="recipe-section-title">👨‍🍳 {t("recipeResult.cookingSteps")}</h4>
            {parsedRecipe.steps.length ? (
              <ol className="recipe-list recipe-list-numbered">
                {parsedRecipe.steps.map((step, index) => (
                  <li key={`${step}-${index}`}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="recipe-empty">{t("recipeResult.noStepsListed")}</p>
            )}
          </section>
        </>
      ) : (
        rawText && (
          <section className="recipe-section">
            <h4 className="recipe-section-title">📝 {t("recipeResult.unstructuredContent")}</h4>
            <p className="whitespace-pre-line text-sm leading-7 text-stone-700 sm:text-base">
              {rawText}
            </p>
          </section>
        )
      )}
    </div>
  );
}
