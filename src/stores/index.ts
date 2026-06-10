import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ViewType, CartItem, User, Product, ShopFilters } from '@/lib/types';

// Navigation Store
interface NavigationStore {
  currentView: ViewType;
  selectedProductId: string | null;
  selectedBlogSlug: string | null;
  navigate: (view: ViewType, productId?: string, blogSlug?: string) => void;
  previousView: ViewType | null;
  filters: ShopFilters;
  setFilters: (filters: ShopFilters) => void;
  clearFilters: () => void;
}

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set) => ({
      currentView: 'home',
      selectedProductId: null,
      selectedBlogSlug: null,
      previousView: null,
      filters: {},
      navigate: (view, productId, blogSlug) =>
        set((state) => ({
          previousView: state.currentView,
          currentView: view,
          selectedProductId: productId || null,
          selectedBlogSlug: blogSlug || null,
        })),
      setFilters: (filters) => set({ filters }),
      clearFilters: () => set({ filters: {} }),
    }),
    {
      name: 'luxe-navigation',
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);

// Cart Store
interface CartStore {
  items: CartItem[];
  voucherCode: string | null;
  voucherDiscount: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  applyVoucher: (code: string, discount: number) => void;
  removeVoucher: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      voucherCode: null,
      voucherDiscount: 0,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === item.productId &&
              i.color === item.color &&
              i.size === item.size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId &&
                i.color === item.color &&
                i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId, color, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.color === color &&
                i.size === size
              )
          ),
        })),

      updateQuantity: (productId, quantity, color, size) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) =>
                    !(
                      i.productId === productId &&
                      i.color === color &&
                      i.size === size
                    )
                )
              : state.items.map((i) =>
                  i.productId === productId &&
                  i.color === color &&
                  i.size === size
                    ? { ...i, quantity }
                    : i
                ),
        })),

      clearCart: () => set({ items: [], voucherCode: null, voucherDiscount: 0 }),
      applyVoucher: (code, discount) => set({ voucherCode: code, voucherDiscount: discount }),
      removeVoucher: () => set({ voucherCode: null, voucherDiscount: 0 }),

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getTotal: () => {
        const subtotal = get().getSubtotal();
        return Math.max(0, subtotal - get().voucherDiscount);
      },
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'luxe-cart' }
  )
);

// Auth Store
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  addPoints: (points: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      addPoints: (points) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, points: state.user.points + points }
            : null,
        })),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: 'luxe-auth' }
  )
);

// Admin Store
interface AdminStore {
  sidebarOpen: boolean;
  activeTab: string;
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
}

export const useAdminStore = create<AdminStore>()((set) => ({
  sidebarOpen: false,
  activeTab: 'overview',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

// Wishlist Store
interface WishlistStore {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) =>
        set((state) => ({
          items: state.items.includes(productId)
            ? state.items
            : [...state.items, productId],
        })),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        })),
      toggleItem: (productId) => {
        const has = get().items.includes(productId);
        if (has) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },
      hasItem: (productId) => get().items.includes(productId),
    }),
    { name: 'luxe-wishlist' }
  )
);
