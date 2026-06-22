import { getProductPdfLabel } from "../utils/shoppingProductEmoji";

const ROBOTO_FONT_URL =
  "https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Me5Q.ttf";
const FONT_FILE = "Roboto-Regular.ttf";
const FONT_FAMILY = "Roboto";

const COLORS = {
  page: [247, 248, 242],
  card: [255, 255, 255],
  border: [207, 225, 185],
  accent: [113, 131, 85],
  title: [41, 37, 36],
  muted: [120, 113, 108],
  rowChecked: [233, 245, 219],
  rowUnchecked: [252, 252, 248],
  checkboxChecked: [181, 201, 154],
  checkboxBorder: [207, 225, 185],
  iconBg: [233, 245, 219],
  iconText: [113, 131, 85],
  text: [68, 64, 60],
  textChecked: [168, 162, 158],
  white: [255, 255, 255],
};

const PAGE = {
  width: 210,
  height: 297,
  margin: 16,
  rowHeight: 11,
  rowGap: 2.5,
};

let cachedFontBase64 = null;
let fontRegistered = false;

function formatExportDate(date, locale) {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function ensurePdfFont(doc) {
  if (!fontRegistered) {
    const response = await fetch(ROBOTO_FONT_URL);
    if (!response.ok) {
      throw new Error("Failed to load PDF font");
    }
    cachedFontBase64 = arrayBufferToBase64(await response.arrayBuffer());
    doc.addFileToVFS(FONT_FILE, cachedFontBase64);
    doc.addFont(FONT_FILE, FONT_FAMILY, "normal");
    fontRegistered = true;
  }

  doc.setFont(FONT_FAMILY, "normal");
}

function setFill(doc, color) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setDraw(doc, color) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function setText(doc, color) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function contentWidth() {
  return PAGE.width - PAGE.margin * 2;
}

function drawPageBackground(doc) {
  setFill(doc, COLORS.page);
  doc.rect(0, 0, PAGE.width, PAGE.height, "F");
}

function drawHeaderCard(doc, y, { title, dateText }) {
  const x = PAGE.margin;
  const width = contentWidth();
  const height = 30;

  setFill(doc, COLORS.card);
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y, width, height, 3, 3, "FD");

  const textX = x + 8;
  let cursorY = y + 9;

  setText(doc, COLORS.accent);
  doc.setFontSize(8);
  doc.text("Dish Builder", textX, cursorY);

  cursorY += 6;
  setText(doc, COLORS.title);
  doc.setFontSize(17);
  doc.text(title, textX, cursorY);

  cursorY += 7;
  setText(doc, COLORS.muted);
  doc.setFontSize(9.5);
  doc.text(dateText, textX, cursorY);

  return y + height + 6;
}

function drawCheckbox(doc, x, y, size, checked) {
  const radius = 1;
  if (checked) {
    setFill(doc, COLORS.checkboxChecked);
    setDraw(doc, COLORS.accent);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, y, size, size, radius, radius, "FD");
    setDraw(doc, COLORS.white);
    doc.setLineWidth(0.45);
    doc.line(x + size * 0.22, y + size * 0.52, x + size * 0.42, y + size * 0.72);
    doc.line(x + size * 0.42, y + size * 0.72, x + size * 0.8, y + size * 0.28);
    return;
  }

  setFill(doc, COLORS.white);
  setDraw(doc, COLORS.checkboxBorder);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y, size, size, radius, radius, "FD");
}

function drawIconBadge(doc, x, y, size, label) {
  setFill(doc, COLORS.iconBg);
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.25);
  doc.circle(x + size / 2, y + size / 2, size / 2, "FD");

  setText(doc, COLORS.iconText);
  doc.setFontSize(7);
  doc.text(label, x + size / 2, y + size / 2 + 0.6, { align: "center" });
}

function estimateRowHeight(doc, item) {
  const rowWidth = contentWidth();
  const textX = PAGE.margin + 2.5 + 4.2 + 3 + 6.2 + 3.5;
  const textMaxWidth = rowWidth - (textX - PAGE.margin) - 2.5;
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(String(item.name), textMaxWidth);
  const extra = Math.max(0, lines.length - 1) * 4.2;
  return PAGE.rowHeight + extra;
}

function drawRow(doc, item, y) {
  const rowWidth = contentWidth();
  const checkboxSize = 4.2;
  const iconSize = 6.2;
  const rowPaddingX = 2.5;
  const checked = Boolean(item.checked);
  const rowHeight = estimateRowHeight(doc, item);

  setFill(doc, checked ? COLORS.rowChecked : COLORS.rowUnchecked);
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(PAGE.margin, y, rowWidth, rowHeight, 2, 2, "FD");

  const centerY = y + rowHeight / 2;
  const checkboxY = centerY - checkboxSize / 2;
  const iconY = centerY - iconSize / 2;
  const checkboxX = PAGE.margin + rowPaddingX;
  const iconX = checkboxX + checkboxSize + 3;
  const textX = iconX + iconSize + 3.5;
  const textMaxWidth = rowWidth - (textX - PAGE.margin) - rowPaddingX;

  drawCheckbox(doc, checkboxX, checkboxY, checkboxSize, checked);
  drawIconBadge(doc, iconX, iconY, iconSize, getProductPdfLabel(item.name));

  setText(doc, checked ? COLORS.textChecked : COLORS.text);
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(String(item.name), textMaxWidth);
  const lineHeight = 4.2;
  const textBlockHeight = lines.length * lineHeight;
  let textY = centerY - textBlockHeight / 2 + lineHeight * 0.72;

  for (const line of lines) {
    doc.text(line, textX, textY);
    if (checked) {
      const lineWidth = doc.getTextWidth(line);
      setDraw(doc, COLORS.textChecked);
      doc.setLineWidth(0.2);
      doc.line(textX, textY - 1.1, textX + lineWidth, textY - 1.1);
    }
    textY += lineHeight;
  }

  return rowHeight;
}

function drawEmptyState(doc, y) {
  const rowWidth = contentWidth();
  setFill(doc, COLORS.rowUnchecked);
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.25);
  doc.roundedRect(PAGE.margin, y, rowWidth, 12, 2, 2, "FD");
  setText(doc, COLORS.muted);
  doc.setFontSize(10);
  doc.text("—", PAGE.margin + rowWidth / 2, y + 7.2, { align: "center" });
}

export async function downloadShoppingListPdf(items, { title, datePrefix, locale = "en" }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  try {
    await ensurePdfFont(doc);
  } catch {
    doc.setFont("helvetica", "normal");
  }

  const dateText = `${datePrefix}: ${formatExportDate(new Date(), locale)}`;
  const bottomLimit = PAGE.height - PAGE.margin;

  drawPageBackground(doc);
  let y = PAGE.margin;
  y = drawHeaderCard(doc, y, { title, dateText });

  if (items.length === 0) {
    drawEmptyState(doc, y);
    doc.save("shopping-list.pdf");
    return;
  }

  for (const item of items) {
    const rowHeight = estimateRowHeight(doc, item);

    if (y + rowHeight > bottomLimit) {
      doc.addPage();
      drawPageBackground(doc);
      y = PAGE.margin;
    }

    drawRow(doc, item, y);
    y += rowHeight + PAGE.rowGap;
  }

  doc.save("shopping-list.pdf");
}
