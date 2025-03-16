import { getCartApi } from "@/api/cart";
import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  cart: [],
  loading: true,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try { 
      const res = await getCartApi();
      set({
        cart: res.data.cart,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({ cart: [], loading: false, error });
    }
  },

  cartCount: () => {
    const cart = get().cart.carts;
    return (
      cart?.reduce((total, cartItem) => {
        return (
          total + cartItem.books.reduce((sum, book) => sum + book.quantity, 0)
        );
      }, 0) || 0
    );
  },

  incCart: (cc) => set((state) => ({ cartCount: cc + 1 })),
  decCart: (cc) => set((state) => ({ cartCount: Math.max(cc - 1, 0) })),
  clearCart: () => set({ cart: [], cartCount: 0 }),
}));
