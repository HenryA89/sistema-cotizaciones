import { useState } from "react";

export const useQuoteBuilder = () => {
  const [quoteItems, setQuoteItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  const addItem = (item) => {
    setQuoteItems([...quoteItems, item]);
    setEditingItem(item);
  };

  const updateItem = (index, updatedItem) => {
    const newItems = [...quoteItems];
    newItems[index] = updatedItem;
    setQuoteItems(newItems);
  };

  const removeItem = (id) => {
    setQuoteItems(quoteItems.filter((item) => item.id !== id));
  };

  const clearItems = () => {
    setQuoteItems([]);
    setEditingItem(null);
  };

  return {
    quoteItems,
    editingItem,
    setEditingItem,
    addItem,
    updateItem,
    removeItem,
    clearItems,
  };
};
