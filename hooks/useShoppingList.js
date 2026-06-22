import React from "react";
import {
  addItemToList,
  addItemsFromNames,
  clearShoppingListItems,
  loadShoppingList,
  persistShoppingList,
  removeItemFromList,
  SHOPPING_LIST_CHANGED_EVENT,
  STORAGE_KEY,
  toggleItemInList,
} from "../services/shoppingListService";

export function useShoppingList() {
  const [items, setItems] = React.useState(() => loadShoppingList());

  React.useEffect(() => {
    function syncFromEvent(event) {
      setItems(Array.isArray(event.detail) ? event.detail : loadShoppingList());
    }

    function syncFromStorage(event) {
      if (event.key === STORAGE_KEY) {
        setItems(loadShoppingList());
      }
    }

    window.addEventListener(SHOPPING_LIST_CHANGED_EVENT, syncFromEvent);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.removeEventListener(SHOPPING_LIST_CHANGED_EVENT, syncFromEvent);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const updateItems = React.useCallback((nextItems) => {
    persistShoppingList(nextItems);
    setItems(nextItems);
  }, []);

  const addItem = React.useCallback(
    (name) => {
      const nextItems = addItemToList(items, name);
      if (nextItems === items) return false;
      updateItems(nextItems);
      return true;
    },
    [items, updateItems]
  );

  const addItems = React.useCallback(
    (names) => {
      const nextItems = addItemsFromNames(items, names);
      if (nextItems.length === items.length) return false;
      updateItems(nextItems);
      return true;
    },
    [items, updateItems]
  );

  const toggleItem = React.useCallback(
    (id) => {
      updateItems(toggleItemInList(items, id));
    },
    [items, updateItems]
  );

  const removeItem = React.useCallback(
    (id) => {
      updateItems(removeItemFromList(items, id));
    },
    [items, updateItems]
  );

  const clearAll = React.useCallback(() => {
    updateItems(clearShoppingListItems());
  }, [updateItems]);

  return {
    items,
    addItem,
    addItems,
    toggleItem,
    removeItem,
    clearAll,
  };
}
