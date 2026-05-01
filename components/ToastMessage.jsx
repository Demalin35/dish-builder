import React from "react";

export default function ToastMessage({ tone = "success", message }) {
  if (!message) return null;

  const toneClass =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-brand-200 bg-brand-50 text-brand-700";

  return (
    <div className={`toast-message ${toneClass}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
