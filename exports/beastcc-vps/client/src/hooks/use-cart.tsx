import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  variantId: number;
  productId: number;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
  minQuantity?: number;
}

export interface BulkCardItem {
  id: number;
  bin: string;
  brand: string;
  type: string;
  baseName: string;
  price: number;
}

export interface BulkCardBundle {
  cardIds: number[];
  cards: BulkCardItem[];
  originalTotal: number;
  discountedTotal: number;
}

interface CartStore {
  items: CartItem[];
  cardItems: BulkCardItem[];
  bulkBundle: BulkCardBundle | null;
  userId: number | null;
  addItem: (item: CartItem) => void;
  addCard: (card: BulkCardItem) => void;
  removeCard: (cardId: number) => void;
  removeItem: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  setBulkBundle: (bundle: BulkCardBundle) => void;
  clearBulkBundle: () => void;
  clearCart: () => void;
  setUserId: (id: number | null) => void;
  total: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cardItems: [],
      bulkBundle: null,
      userId: null,
      addItem: (newItem) => set((state) => {
        const existing = state.items.find((i) => i.variantId === newItem.variantId);
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            ),
          };
        }
        return { items: [...state.items, newItem] };
      }),
      addCard: (card) => set((state) => (
        state.cardItems.some((item) => item.id === card.id)
          ? state
          : { cardItems: [...state.cardItems, card] }
      )),
      removeCard: (cardId) => set((state) => ({
        cardItems: state.cardItems.filter((card) => card.id !== cardId),
      })),
      removeItem: (variantId) => set((state) => ({
        items: state.items.filter((i) => i.variantId !== variantId),
      })),
      updateQuantity: (variantId, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.variantId === variantId ? { ...i, quantity } : i
        ),
      })),
      setBulkBundle: (bundle) => set({ items: [], cardItems: [], bulkBundle: bundle }),
      clearBulkBundle: () => set({ bulkBundle: null }),
      clearCart: () => set({ items: [], cardItems: [], bulkBundle: null }),
      setUserId: (id) => {
        const current = get();
        if (current.userId !== id) {
          set({ items: [], cardItems: [], bulkBundle: null, userId: id });
        }
      },
      total: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    }),
    {
      name: 'cashplug-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
