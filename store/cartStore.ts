"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  incrementItem: (productId: string, size: string, color: string) => void;
  decrementItem: (productId: string, size: string, color: string) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.size === item.size &&
              cartItem.color === item.color,
          );

          if (!existing) {
            return { items: [...state.items, item] };
          }

          return {
            items: state.items.map((cartItem) =>
              cartItem === existing
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem,
            ),
          };
        }),
      removeItem: (productId, size, color) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.productId !== productId || item.size !== size || item.color !== color,
          ),
        })),
      incrementItem: (productId, size, color) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.size === size && item.color === color
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        })),
      decrementItem: (productId, size, color) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.productId === productId && item.size === size && item.color === color
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "nas-xanim-cart",
    },
  ),
);
