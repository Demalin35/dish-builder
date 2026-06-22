import React from "react";
import { useTranslation } from "react-i18next";
import { useShoppingList } from "../hooks/useShoppingList";
import { downloadShoppingListPdf } from "../services/shoppingListPdf";
import { getProductEmoji } from "../utils/shoppingProductEmoji";

function ShoppingBagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M7 9V8a5 5 0 0 1 10 0v1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 9h12l-1.1 11H7.1L6 9z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ShoppingModeWidget() {
  const { t, i18n } = useTranslation();
  const { items, addItem, toggleItem, removeItem, clearAll } = useShoppingList();
  const [isOpen, setIsOpen] = React.useState(false);
  const [productName, setProductName] = React.useState("");
  const panelRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const fabRef = React.useRef(null);

  const uncheckedCount = items.filter((item) => !item.checked).length;

  const closePanel = React.useCallback(() => {
    setIsOpen(false);
    fabRef.current?.focus();
  }, []);

  function togglePanel() {
    setIsOpen((prev) => !prev);
  }

  function handleAddProduct(event) {
    event.preventDefault();
    const didAdd = addItem(productName);
    if (didAdd) {
      setProductName("");
    }
  }

  async function handleDownloadPdf() {
    const locale = i18n.resolvedLanguage?.startsWith("ru") ? "ru-RU" : "en-US";
    await downloadShoppingListPdf(items, {
      title: t("shoppingMode.title"),
      datePrefix: t("shoppingMode.exportDate"),
      locale,
    });
  }

  function handleClearAll() {
    if (!items.length) return;
    const confirmed = window.confirm(t("shoppingMode.clearConfirm"));
    if (confirmed) {
      clearAll();
    }
  }

  React.useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closePanel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      const target = event.target;
      if (
        panelRef.current?.contains(target) ||
        fabRef.current?.contains(target)
      ) {
        return;
      }
      closePanel();
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen, closePanel]);

  return (
    <>
      {isOpen && (
        <div className="shopping-mode-backdrop fixed inset-0 z-40" aria-hidden="true" />
      )}

      <div className="shopping-mode-widget fixed bottom-20 right-4 z-50 sm:bottom-8 sm:right-6">
        {isOpen && (
          <div
            ref={panelRef}
            id="shopping-mode-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shopping-mode-title"
            className="shopping-mode-panel mb-3 w-[min(calc(100vw-2rem),20rem)] rounded-2xl border border-brand-200/80 bg-white/95 p-4 shadow-[var(--shadow-soft-lg)] backdrop-blur-sm sm:w-80"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="shopping-mode-title"
                  className="text-base font-semibold tracking-tight text-stone-900"
                >
                  {t("shoppingMode.title")}
                </h2>
                {items.length > 0 && (
                  <p className="mt-0.5 text-xs text-stone-500">
                    {t("shoppingMode.itemCount", { count: items.length })}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm px-2 py-1 text-stone-500"
                onClick={closePanel}
                aria-label={t("shoppingMode.close")}
              >
                ✕
              </button>
            </div>

            <form className="flex gap-2" onSubmit={handleAddProduct}>
              <input
                ref={inputRef}
                type="text"
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                placeholder={t("shoppingMode.productName")}
                aria-label={t("shoppingMode.productName")}
                className="field-input h-10 flex-1 rounded-xl text-sm"
              />
              <button type="submit" className="btn btn-primary btn-sm shrink-0 px-3">
                {t("shoppingMode.addProduct")}
              </button>
            </form>

            <div className="shopping-mode-list mt-3 max-h-52 overflow-y-auto pr-1 sm:max-h-60">
              {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50/80 px-3 py-4 text-center text-sm text-stone-500">
                  {t("shoppingMode.empty")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 ${
                        item.checked
                          ? "border-brand-200/70 bg-brand-50/60"
                          : "border-stone-200 bg-stone-50/70"
                      }`}
                    >
                      <input
                        id={`shopping-item-${item.id}`}
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleItem(item.id)}
                        className="shopping-mode-checkbox"
                        aria-label={
                          item.checked
                            ? t("shoppingMode.markAsNeeded")
                            : t("shoppingMode.markAsBought")
                        }
                      />
                      <label
                        htmlFor={`shopping-item-${item.id}`}
                        className={`shopping-mode-item-label min-w-0 flex-1 cursor-pointer text-sm leading-snug ${
                          item.checked ? "is-checked" : ""
                        }`}
                      >
                        <span className="shopping-mode-item-emoji" aria-hidden="true">
                          {getProductEmoji(item.name)}
                        </span>
                        <span className="shopping-mode-item-name">{item.name}</span>
                      </label>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm shrink-0 px-2 py-1 text-xs text-stone-500 hover:text-rose-700"
                        onClick={() => removeItem(item.id)}
                        aria-label={`${t("shoppingMode.remove")}: ${item.name}`}
                      >
                        {t("shoppingMode.remove")}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleDownloadPdf}
                disabled={items.length === 0}
              >
                {t("shoppingMode.downloadPdf")}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleClearAll}
                disabled={items.length === 0}
              >
                {t("shoppingMode.clearList")}
              </button>
            </div>
          </div>
        )}

        <button
          ref={fabRef}
          type="button"
          className="shopping-mode-fab"
          onClick={togglePanel}
          aria-expanded={isOpen}
          aria-controls="shopping-mode-panel"
          aria-label={t("shoppingMode.open")}
        >
          <ShoppingBagIcon />
          {uncheckedCount > 0 && (
            <span className="shopping-mode-fab-badge" aria-hidden="true">
              {uncheckedCount > 9 ? "9+" : uncheckedCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
