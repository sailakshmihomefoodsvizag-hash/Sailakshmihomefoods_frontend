// API Service for communicating with backend
import { apiRequest, authenticatedRequest } from './apiConfig.js';

// Auth API calls
export const authAPI = {
  // Google authentication - sends token in BODY
  googleAuth: async (token) => {
    if (!token) {
      throw new Error('No token provided');
    }
    return apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  // Email registration
  register: async (name, email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  // Email login
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Sync user (for Firebase auth) - sends token in HEADER
  syncUser: async (token) => {
    if (!token) {
      throw new Error('No token provided');
    }
    return authenticatedRequest('/auth/sync', token, {
      method: 'POST',
    });
  },
};

// User API calls - all require Authorization header
export const userAPI = {
  // Get user profile
  getProfile: async (token) => {
    return authenticatedRequest('/user/profile', token, {
      method: 'GET',
    });
  },

  // Update user profile
  updateProfile: async (token, data) => {
    return authenticatedRequest('/user/profile', token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Order API calls - all require Authorization header
export const orderAPI = {
  // Get user's orders
  getMyOrders: async (token) => {
    return authenticatedRequest('/orders/my-orders', token, {
      method: 'GET',
    });
  },

  // Get order by ID
  getOrderById: async (token, orderId) => {
    return authenticatedRequest(`/orders/my-orders/${orderId}`, token, {
      method: 'GET',
    });
  },

  // Delete order
  deleteOrder: async (token, orderId) => {
    return authenticatedRequest(`/orders/my-orders/${orderId}`, token, {
      method: 'DELETE',
    });
  },
};

const buildQueryParams = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        searchParams.set(key, value.join(','));
      }
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const productAPI = {
  listProducts: async ({ page = 1, limit = 12, category, inStock, ids } = {}) => {
    const query = buildQueryParams({ page, limit, category, inStock, ids });
    return apiRequest(`/products${query}`, { method: 'GET' });
  },

  getBestSellers: async ({ page = 1, limit = 8 } = {}) => {
    const query = buildQueryParams({ page, limit });
    return apiRequest(`/products/best-sellers${query}`, { method: 'GET' });
  },

  getYouMayAlsoLike: async ({ limit = 4, excludeId, category } = {}) => {
    const query = buildQueryParams({ limit, excludeId, category });
    return apiRequest(`/products/you-may-also-like${query}`, { method: 'GET' });
  },

  getProductById: async (productId) => {
    return apiRequest(`/products/${productId}`, { method: 'GET' });
  },

  search: async (query, limit = 6) => {
    const searchParams = buildQueryParams({ q: query, limit });
    return apiRequest(`/products/search${searchParams}`, { method: 'GET' });
  },
};

export default { authAPI, userAPI, orderAPI, productAPI };
