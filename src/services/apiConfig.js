/**
 * Centralized API Configuration
 * 
 * This file manages all API endpoint configurations and provides
 * a consistent way to make API calls across the application.
 */

// Get API base URL from environment variable — strip any trailing slash
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

/**
 * Makes an API request
 * @param {string} endpoint - The API endpoint (e.g., '/user/profile')
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<any>} The response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  // Remove leading slash to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${API_BASE_URL}/${cleanEndpoint}`;

  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.method !== 'GET' && options.body) {
    config.body = options.body;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      return data;
    }

    return data;
  } catch (error) {
    return { success: false, message: 'Network error. Please try again.' };
  }
};

/**
 * Makes an authenticated API request with Authorization header
 * @param {string} endpoint - The API endpoint
 * @param {string} token - The authentication token
 * @param {object} options - Fetch options
 * @returns {Promise<any>} The response data
 */
export const authenticatedRequest = async (endpoint, token, options = {}) => {
  if (!token) {
    throw new Error('Authentication required');
  }

  return apiRequest(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Export the base URL for other uses
export const API_URL = API_BASE_URL;

export default {
  apiRequest,
  authenticatedRequest,
  API_URL,
};
