function cleanLine(line) {
  return line
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+[\.)]\s+/, "")
    .trim();
}

function isStructuredRecipe(recipeData) {
  return (
    recipeData &&
    typeof recipeData === "object" &&
    !Array.isArray(recipeData) &&
    Array.isArray(recipeData.ingredients) &&
    Array.isArray(recipeData.steps)
  );
}

function isIngredientsHeading(line) {
  return /^#{0,6}\s*ingredients\b[:\s-]*$/i.test(line.trim());
}

function isStepsHeading(line) {
  return /^#{0,6}\s*(cooking\s+steps?|steps?|instructions?|method)\b[:\s-]*$/i.test(
    line.trim()
  );
}

function isHeadingLine(line) {
  return /^#{1,6}\s+/.test(line.trim());
}

function toList(lines) {
  return lines
    .map(cleanLine)
    .filter(Boolean);
}

function titleFromMarkdown(lines) {
  const markdownTitle = lines.find((line) => /^#{1,3}\s+/.test(line.trim()));
  if (markdownTitle) {
    return markdownTitle.replace(/^#{1,3}\s+/, "").trim();
  }

  return lines.find((line) => line.trim())?.trim() || "Recipe Recommendation";
}

export function parseRecipeContent(recipeMarkdown) {
  if (isStructuredRecipe(recipeMarkdown)) {
    return {
      title: recipeMarkdown.title?.trim() || "Recipe Recommendation",
      ingredients: recipeMarkdown.ingredients.map((item) => String(item).trim()).filter(Boolean),
      steps: recipeMarkdown.steps.map((item) => String(item).trim()).filter(Boolean),
      introText: recipeMarkdown.summary?.trim() || "",
    };
  }

  const lines = (recipeMarkdown || "").split("\n");
  const title = titleFromMarkdown(lines);

  const ingredientsLines = [];
  const stepsLines = [];
  const introLines = [];

  let currentSection = "intro";

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    if (isIngredientsHeading(line)) {
      currentSection = "ingredients";
      continue;
    }

    if (isStepsHeading(line)) {
      currentSection = "steps";
      continue;
    }

    if (isHeadingLine(line) && cleanLine(line) !== title) {
      currentSection = "intro";
      continue;
    }

    if (currentSection === "ingredients") {
      ingredientsLines.push(line);
      continue;
    }

    if (currentSection === "steps") {
      stepsLines.push(line);
      continue;
    }

    if (line.replace(/^#{1,3}\s+/, "").trim() !== title) {
      introLines.push(line);
    }
  }

  const ingredients = toList(ingredientsLines);
  const steps = toList(stepsLines);

  return {
    title,
    ingredients,
    steps,
    introText: introLines.join(" "),
  };
}
