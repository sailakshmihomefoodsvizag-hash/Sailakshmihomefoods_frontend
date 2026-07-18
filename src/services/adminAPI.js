import { API_URL, apiRequest, authenticatedRequest } from './apiConfig.js';

// Helper function for admin API calls with token from localStorage
const adminApiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    return { success: false, message: 'Admin authentication required. Please log in.' };
  }
  
  return authenticatedRequest(endpoint, token, options);
};

// Valid order statuses
const VALID_ORDER_STATUS = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];

// Admin Auth API
export const adminAPI = {
  // Login
  login: async (mobile, password) => {
    const data = await apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ mobile, password })
    });
    
    if (data.success && data.token) {
      localStorage.setItem('adminToken', data.token);
    }
    
    return data;
  },
  
  // Verify session
  verify: async () => {
    return adminApiCall('/admin/verify');
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('adminToken');
  },
  
  // Check if logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('adminToken');
  },
  
  // Dashboard
  getDashboard: async () => {
    return adminApiCall('/admin/dashboard');
  },
  
  // Orders
  getOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return adminApiCall(`/admin/orders${query ? `?${query}` : ''}`);
  },
  
  getOrder: async (orderId) => {
    return adminApiCall(`/admin/orders/${orderId}`);
  },
  
  updateOrderStatus: async (orderId, status, note = '') => {
    // Validate status
    if (status === undefined || status === null || typeof status !== 'string') {
      return { success: false, message: 'Valid status is required' };
    }
    
    const normalizedStatus = status.trim().toLowerCase();
    
    if (!normalizedStatus || normalizedStatus === 'undefined' || normalizedStatus === 'null') {
      return { success: false, message: 'Status cannot be empty' };
    }
    
    if (!VALID_ORDER_STATUS.includes(normalizedStatus)) {
      return { success: false, message: `Invalid status. Must be one of: ${VALID_ORDER_STATUS.join(', ')}` };
    }
    
    return adminApiCall(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: normalizedStatus, note: note || '' })
    });
  },
  
  // Products
  getProducts: async () => {
    return adminApiCall('/admin/products');
  },

  /**
   * Create a new product. Accepts optional imageFile (File object).
   */
  createProduct: async (data, imageFile = null) => {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();

    // Append all fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (imageFile) formData.append('image', imageFile);

    const response = await fetch(`${API_URL}/admin/products`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    return response.json();
  },

  updateProduct: async (productId, data, imageFile = null) => {
    if (!productId) return { success: false, message: 'Product ID is required' };

    const numericProductId = Number(productId);
    if (isNaN(numericProductId) || numericProductId <= 0) {
      return { success: false, message: 'Product ID must be a positive number' };
    }

    const token = localStorage.getItem('adminToken');

    // If there's an image, use FormData (multipart)
    if (imageFile) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, String(value));
      });
      formData.append('image', imageFile);

      const response = await fetch(`${API_URL}/admin/products/${numericProductId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      return response.json();
    }

    // No image — JSON body
    const cleanedData = {};
    if (data.pricePerKg !== undefined) {
      const p = Number(data.pricePerKg);
      if (!isNaN(p) && p > 0) cleanedData.pricePerKg = p;
    }
    if ('inStock'       in data) cleanedData.inStock       = data.inStock === true || data.inStock === 'true';
    if ('isActive'      in data) cleanedData.isActive      = data.isActive === true || data.isActive === 'true';
    if ('stockQuantity' in data) cleanedData.stockQuantity = data.stockQuantity === null ? null : Number(data.stockQuantity);
    if (data.name     && String(data.name).trim())     cleanedData.name     = String(data.name).trim();
    if (data.category && String(data.category).trim()) cleanedData.category = String(data.category).trim();
    if (data.description  !== undefined) cleanedData.description  = data.description;
    if (data.featured     !== undefined) cleanedData.featured     = data.featured === true || data.featured === 'true';

    if (Object.keys(cleanedData).length === 0) {
      return { success: false, message: 'No valid fields provided for update' };
    }

    return adminApiCall(`/admin/products/${numericProductId}`, {
      method: 'PUT',
      body: JSON.stringify(cleanedData),
    });
  },

  deleteProduct: async (productId) => {
    return adminApiCall(`/admin/products/${productId}`, { method: 'DELETE' });
  },

  uploadProductImage: async (productId, imageFile) => {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_URL}/admin/products/${productId}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },

  deleteProductImage: async (productId) => {
    return adminApiCall(`/admin/products/${productId}/image`, { method: 'DELETE' });
  },

  resetProduct: async (productId) => {
    return adminApiCall(`/admin/products/${productId}/override`, { method: 'DELETE' });
  },
  
  // Coupons
  getCoupons: async () => {
    return adminApiCall('/admin/coupons');
  },
  
  createCoupon: async (couponData) => {
    return adminApiCall('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData)
    });
  },
  
  updateCoupon: async (id, couponData) => {
    return adminApiCall(`/admin/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(couponData)
    });
  },
  
  deleteCoupon: async (id) => {
    return adminApiCall(`/admin/coupons/${id}`, {
      method: 'DELETE'
    });
  },
  
  toggleCoupon: async (id) => {
    return adminApiCall(`/admin/coupons/${id}/toggle`, {
      method: 'PATCH'
    });
  }
};

// Orders API (User-facing)
export const ordersAPI = {
  validateCoupon: async (token, code, orderAmount, productIds) => {
    return authenticatedRequest('/orders/coupon/validate', token, {
      method: 'POST',
      body: JSON.stringify({ code, orderAmount, productIds })
    });
  },
  
  createOrder: async (token, items, couponCode, address) => {
    return authenticatedRequest('/orders/create-order', token, {
      method: 'POST',
      body: JSON.stringify({ items, couponCode, address })
    });
  },
  
  verifyPayment: async (token, paymentData) => {
    return authenticatedRequest('/orders/verify-payment', token, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },
  
  getMyOrders: async (token) => {
    return authenticatedRequest('/orders/my-orders', token, {
      method: 'GET'
    });
  },
  
  getOrder: async (token, orderId) => {
    return authenticatedRequest(`/orders/my-orders/${orderId}`, token, {
      method: 'GET'
    });
  }
};

export default adminAPI;
