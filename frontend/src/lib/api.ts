import api from "./axios";

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
  getMe: () => api.get("/auth/me"),
};

export const productAPI = {
  getAll: (params?: Record<string, string>) =>
    api.get("/products", { params }),
  getFeatured: () => api.get("/products/featured"),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post("/products", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/products/${id}`, data),
  remove: (id: string) => api.delete(`/products/${id}`),
};

export const cartAPI = {
  getCart: () => api.get("/cart"),
  addItem: (data: { product_id: number; quantity: number }) =>
    api.post("/cart/items", data),
  updateItem: (id: number, data: { quantity: number }) =>
    api.put(`/cart/items/${id}`, data),
  removeItem: (id: number) => api.delete(`/cart/items/${id}`),
  clearCart: () => api.delete("/cart"),
};

export const checkoutAPI = {
  checkout: (data: Record<string, unknown>) =>
    api.post("/checkout", data),
  processPayment: (data: Record<string, unknown>) =>
    api.post("/checkout/payment", data),
  applyCoupon: (data: { code: string; subtotal: number }) =>
    api.post("/checkout/apply-coupon", data),
};

export const orderAPI = {
  create: (data: Record<string, unknown>) =>
    api.post("/orders", data),
  getAll: (params?: Record<string, string>) =>
    api.get("/orders", { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string, reason?: string) =>
    api.put(`/orders/${id}/cancel`, { reason }),
};

export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: Record<string, unknown>) =>
    api.put("/users/profile", data),
  getAddresses: () => api.get("/users/addresses"),
  addAddress: (data: Record<string, unknown>) =>
    api.post("/users/addresses", data),
  getWishlist: () => api.get("/users/wishlist"),
  addToWishlist: (productId: number) =>
    api.post("/users/wishlist", { product_id: productId }),
  removeFromWishlist: (productId: number) =>
    api.delete(`/users/wishlist/${productId}`),
};

export const categoryAPI = {
  getAll: () => api.get("/categories"),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: Record<string, unknown>) => api.post("/admin/categories", data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/admin/categories/${id}`, data),
  remove: (id: number) => api.delete(`/admin/categories/${id}`),
};

export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getProducts: (params?: Record<string, string>) =>
    api.get("/admin/products", { params }),
  getUsers: (params?: Record<string, string>) =>
    api.get("/admin/users", { params }),
  updateUserRole: (id: number, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),
  updateUser: (id: number, data: Record<string, unknown>) =>
    api.put(`/admin/users/${id}`, data),
  getOrders: (params?: Record<string, string>) =>
    api.get("/admin/orders", { params }),
  updateOrderStatus: (id: string, status: string, extra?: Record<string, string>) =>
    api.put(`/admin/orders/${id}/status`, { status, ...extra }),
  getSalesReport: (params?: Record<string, string>) =>
    api.get("/admin/reports/sales", { params }),
  getCoupons: () => api.get("/admin/coupons"),
  createCoupon: (data: Record<string, unknown>) =>
    api.post("/admin/coupons", data),
  updateCoupon: (id: number, data: Record<string, unknown>) =>
    api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: number) => api.delete(`/admin/coupons/${id}`),
};
