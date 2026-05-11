
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, ProductVariant, ProductAddon, MenuItem } from '../types';

export interface HeldOrder {
  id: string;
  cart: CartItem[];
  timestamp: string;
  orderType: 'takeaway' | 'customer';
  customerName?: string;
  customerId?: string;
  label?: string;
}

interface CartState {
  cart: CartItem[];
  heldOrders: HeldOrder[];
  addToCart: (item: MenuItem, variant: ProductVariant | null, addons: ProductAddon[]) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, delta: number) => void;
  updateItemNote: (index: number, note: string) => void;
  clearCart: () => void;
  holdOrder: (meta: { orderType: 'takeaway' | 'customer'; customerName?: string; customerId?: string; label?: string }) => void;
  resumeOrder: (id: string) => HeldOrder | undefined;
  deleteHeldOrder: (id: string) => void;
  updateHeldOrder: (id: string, updates: Partial<HeldOrder>) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      heldOrders: [],

      addToCart: (item, variant, addons) => set((state) => {
        const itemPrice = variant ? variant.price : item.basePrice;
        const addonsPrice = addons.reduce((sum, a) => sum + a.price, 0);
        const finalPrice = itemPrice + addonsPrice;

        const existingIdx = state.cart.findIndex(i =>
          i.id === item.id &&
          i.selectedVariant?.id === variant?.id &&
          JSON.stringify(i.selectedAddons.map(a => a.id).sort()) === JSON.stringify(addons.map(a => a.id).sort())
        );

        if (existingIdx > -1) {
          const newCart = [...state.cart];
          newCart[existingIdx] = { ...newCart[existingIdx], quantity: newCart[existingIdx].quantity + 1 };
          return { cart: newCart };
        }

        const newItem: CartItem = {
          ...item,
          quantity: 1,
          notes: '',
          selectedVariant: variant || undefined,
          selectedAddons: addons,
          totalItemPrice: finalPrice
        };
        return { cart: [...state.cart, newItem] };
      }),

      removeFromCart: (index) => set((state) => ({
        cart: state.cart.filter((_, i) => i !== index)
      })),

      updateQuantity: (index, delta) => set((state) => {
        const newCart = [...state.cart];
        const newQty = newCart[index].quantity + delta;
        if (newQty <= 0) return { cart: state.cart.filter((_, i) => i !== index) };
        newCart[index] = { ...newCart[index], quantity: newQty };
        return { cart: newCart };
      }),

      updateItemNote: (index, note) => set((state) => {
        const newCart = [...state.cart];
        newCart[index] = { ...newCart[index], notes: note };
        return { cart: newCart };
      }),

      clearCart: () => set({ cart: [] }),

      holdOrder: (meta) => set((state) => {
        if (state.cart.length === 0) return state;
        const newHeld: HeldOrder = {
          id: Date.now().toString(),
          cart: [...state.cart],
          timestamp: new Date().toISOString(),
          orderType: meta.orderType,
          customerName: meta.customerName,
          customerId: meta.customerId,
          label: meta.label,
        };
        return { heldOrders: [newHeld, ...state.heldOrders], cart: [] };
      }),

      resumeOrder: (id) => {
        const state = get();
        const order = state.heldOrders.find(o => o.id === id);
        if (!order) return undefined;
        set({ cart: order.cart, heldOrders: state.heldOrders.filter(o => o.id !== id) });
        return order;
      },

      deleteHeldOrder: (id) => set((state) => ({
        heldOrders: state.heldOrders.filter(o => o.id !== id)
      })),

      updateHeldOrder: (id, updates) => set((state) => ({
        heldOrders: state.heldOrders.map(o => o.id === id ? { ...o, ...updates } : o)
      })),
    }),
    { name: 'elmashad-cafe-cart-storage-v3' }
  )
);
