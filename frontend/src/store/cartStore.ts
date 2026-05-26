import { create } from "zustand";

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  itemCount: 0,
  total: 0,
  setItems: (items) =>
    set({
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
  addItem: (item) => {
    const items = get().items;
    const existing = items.find((i) => i.product_id === item.product_id);
    if (existing) {
      const updated = items.map((i) =>
        i.product_id === item.product_id
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
      set({
        items: updated,
        itemCount: updated.reduce((sum, i) => sum + i.quantity, 0),
        total: updated.reduce((sum, i) => sum + i.price * i.quantity, 0),
      });
    } else {
      const updated = [...items, item];
      set({
        items: updated,
        itemCount: updated.reduce((sum, i) => sum + i.quantity, 0),
        total: updated.reduce((sum, i) => sum + i.price * i.quantity, 0),
      });
    }
  },
  removeItem: (id) => {
    const updated = get().items.filter((i) => i.id !== id);
    set({
      items: updated,
      itemCount: updated.reduce((sum, i) => sum + i.quantity, 0),
      total: updated.reduce((sum, i) => sum + i.price * i.quantity, 0),
    });
  },
  updateQuantity: (id, quantity) => {
    const updated = get().items.map((i) =>
      i.id === id ? { ...i, quantity } : i
    );
    set({
      items: updated,
      itemCount: updated.reduce((sum, i) => sum + i.quantity, 0),
      total: updated.reduce((sum, i) => sum + i.price * i.quantity, 0),
    });
  },
  clearCart: () => set({ items: [], itemCount: 0, total: 0 }),
}));
