export const STORAGE_KEY = "dishBuilder.shoppingList.v1";
export const SHOPPING_LIST_CHANGED_EVENT = "dishbuilder:shopping-list-changed";

function isValidItem(item) {
  return (
    item &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.checked === "boolean"
  );
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createShoppingItem(name) {
  return {
    id: createId(),
    name: name.trim(),
    checked: false,
    createdAt: new Date().toISOString(),
  };
}

export function loadShoppingList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidItem).map((item) => ({
      id: item.id,
      name: item.name.trim(),
      checked: Boolean(item.checked),
      createdAt: item.createdAt || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export function notifyShoppingListChanged(items) {
  window.dispatchEvent(
    new CustomEvent(SHOPPING_LIST_CHANGED_EVENT, {
      detail: items,
    })
  );
}

export function persistShoppingList(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  notifyShoppingListChanged(items);
}

export function addItemToList(items, name) {
  const trimmed = name.trim();
  if (!trimmed) return items;

  const exists = items.some(
    (item) => item.name.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) return items;

  return [...items, createShoppingItem(trimmed)];
}

export function addItemsFromNames(items, names) {
  let next = items;
  for (const name of names) {
    if (typeof name !== "string") continue;
    next = addItemToList(next, name);
  }
  return next;
}

export function toggleItemInList(items, id) {
  return items.map((item) =>
    item.id === id ? { ...item, checked: !item.checked } : item
  );
}

export function removeItemFromList(items, id) {
  return items.filter((item) => item.id !== id);
}

export function clearShoppingListItems() {
  return [];
}
