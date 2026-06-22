const PRODUCT_EMOJI_RULES = [
  { emoji: "🥛", pdfLabel: "Ml", keywords: ["milk", "молоко"] },
  { emoji: "🍞", pdfLabel: "Br", keywords: ["bread", "хлеб"] },
  { emoji: "🌾", pdfLabel: "Fl", keywords: ["flour", "мука"] },
  { emoji: "🍬", pdfLabel: "Su", keywords: ["sugar", "сахар"] },
  { emoji: "🧂", pdfLabel: "Sa", keywords: ["salt", "соль"] },
  { emoji: "🧀", pdfLabel: "Ch", keywords: ["cheese", "сыр", "parmesan", "пармезан"] },
  { emoji: "🍅", pdfLabel: "To", keywords: ["tomato", "помидор", "томат"] },
  { emoji: "🧄", pdfLabel: "Ga", keywords: ["garlic", "чеснок"] },
  { emoji: "🧅", pdfLabel: "On", keywords: ["onion", "лук"] },
  { emoji: "🧈", pdfLabel: "Bu", keywords: ["butter", "масло", "сливочн"] },
  { emoji: "🍗", pdfLabel: "Ck", keywords: ["chicken", "куриц", "курин"] },
  { emoji: "🥔", pdfLabel: "Po", keywords: ["potato", "картоф", "картош"] },
  { emoji: "🍚", pdfLabel: "Ri", keywords: ["rice", "рис"] },
  { emoji: "🫑", pdfLabel: "Pe", keywords: ["pepper", "перец", "paprika", "паприк"] },
  { emoji: "🥚", pdfLabel: "Eg", keywords: ["egg", "яйц"] },
  { emoji: "🍌", pdfLabel: "Bn", keywords: ["banana", "банан"] },
  { emoji: "🥑", pdfLabel: "Av", keywords: ["avocado", "авокадо"] },
  { emoji: "🍋", pdfLabel: "Lm", keywords: ["lemon", "лимон"] },
  { emoji: "🍝", pdfLabel: "Pa", keywords: ["pasta", "макарон", "спагетти", "spaghetti"] },
];

const FALLBACK_EMOJI = "🛒";
const FALLBACK_PDF_LABEL = "Go";

function normalizeProductName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/giu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findProductRule(name) {
  const normalized = normalizeProductName(name);
  if (!normalized) return null;

  return (
    PRODUCT_EMOJI_RULES.find((rule) =>
      rule.keywords.some((keyword) => normalized.includes(keyword))
    ) || null
  );
}

export function getProductEmoji(name) {
  return findProductRule(name)?.emoji || FALLBACK_EMOJI;
}

export function getProductPdfLabel(name) {
  return findProductRule(name)?.pdfLabel || FALLBACK_PDF_LABEL;
}
