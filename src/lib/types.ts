// Core types for the e-commerce store

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  createdAt: string;
}

export interface ProductVariation {
  id: string;
  productId: string;
  color?: string;
  size?: string;
  sku: string;
  stock: number;
  price?: number;
  image?: string;
  weight?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  price: number;
  comparePrice?: number;
  sku: string;
  barcode?: string;
  weight: number;
  dimensions?: string;
  stock: number;
  minStock: number;
  images: string[];
  video?: string;
  isFeatured: boolean;
  isNew: boolean;
  isPreorder: boolean;
  isBundle: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDesc?: string;
  metaKeywords?: string;
  categories?: { category: Category }[];
  variations?: ProductVariation[];
  reviews?: Review[];
  _count?: { reviews: number; orderItems: number };
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  comparePrice?: number;
  quantity: number;
  color?: string;
  size?: string;
  variationId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: string;
  memberLevel: string;
  points: number;
  isActive: boolean;
  addresses?: Address[];
}

export interface Address {
  id: string;
  userId: string;
  label?: string;
  recipient: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod?: string;
  paymentStatus: string;
  courier?: string;
  courierService?: string;
  trackingNumber?: string;
  shippingAddress?: string;
  notes?: string;
  voucherCode?: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  variation?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  createdAt: string;
  user?: { name: string; avatar?: string };
}

export interface Voucher {
  id: string;
  code: string;
  type: string;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  quota?: number;
  used: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface FlashSaleItem {
  id: string;
  flashSaleId: string;
  productId: string;
  salePrice: number;
  maxQty: number;
  soldQty: number;
  product?: Product;
  flashSale?: { endDate: string };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: string;
  isPublished: boolean;
  createdAt: string;
}

export interface AnalyticsData {
  date: string;
  visitors: number;
  orders: number;
  revenue: number;
  pageViews: number;
}

export interface Promo {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: string; // "percentage" | "fixed" | "shipping"
  value: number;
  scope: string; // "global" | "per_item"
  productIds: string; // JSON array string
  minPurchase?: number;
  maxDiscount?: number;
  quota?: number;
  used: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  bannerText?: string;
  bannerSubtext?: string;
  bannerBg?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  todayRevenue: number;
  analytics: AnalyticsData[];
}

// View types for SPA navigation
export type ViewType =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'login'
  | 'register'
  | 'profile'
  | 'profile-orders'
  | 'profile-wishlist'
  | 'profile-addresses'
  | 'admin'
  | 'admin-products'
  | 'admin-orders'
  | 'admin-vouchers'
  | 'admin-promos'
  | 'admin-blog'
  | 'blog'
  | 'blog-detail'
  | 'about'
  | 'contact'
  | 'faq'
  | 'terms'
  | 'tracking';

export interface ShopFilters {
  category?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// Payment methods
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'qris' | 'va' | 'bank' | 'ewallet' | 'cc' | 'cod';
  icon: string;
}

// Courier
export interface CourierService {
  courier: string;
  service: string;
  price: number;
  eta: string;
}
