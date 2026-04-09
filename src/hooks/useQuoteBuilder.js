import { useState } from "react";

export const useQuoteBuilder = () => {
  const [quoteItems, setQuoteItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  const addItem = (item) => {
    setQuoteItems((currentItems) => [...currentItems, item]);
    setEditingItem(item);
  };

  const updateItem = (index, updatedItem) => {
    setQuoteItems((currentItems) => {
      const nextItems = [...currentItems];
      nextItems[index] = updatedItem;
      return nextItems;
    });
  };

  const removeItem = (id) => {
    setQuoteItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const clearItems = () => {
    setQuoteItems([]);
    setEditingItem(null);
  };

  const replaceItems = (items) => {
    setQuoteItems(items);

    if (!editingItem) return;

    const freshEditingItem = items.find((item) => item.id === editingItem.id);
    setEditingItem(freshEditingItem || null);
  };

  return {
    quoteItems,
    editingItem,
    setEditingItem,
    addItem,
    updateItem,
    removeItem,
    clearItems,
    replaceItems,
  };
};
