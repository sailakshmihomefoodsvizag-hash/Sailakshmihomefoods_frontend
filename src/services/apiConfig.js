/**
 * Centralized API Configuration
 *
 * VITE_API_URL should be set to the backend base URL, with or without /api:
 *   https://sailakshmi-home-foods-backend.vercel.app        ← works
 *   https://sailakshmi-home-foods-backend.vercel.app/api    ← also works
 *
 * This file normalises both forms so that API_URL always ends with /api
 * and never has a trailing slash.
 *
 * URL resolution order (Vite env file precedence):
 *   .env.local        → local development
 *   .env.production   → production build
 *   .env              → shared fallback
 */

const RAW_URL = import.meta.env.VITE_API_URL;

if (!RAW_URL) {
  console.error(
    '[apiConfig] VITE_API_URL is not set.\n' +
    '  • For local dev: add VITE_API_URL=http://localhost:5000/api to frontend/.env.local\n' +
    '  • For production build: set VITE_API_URL=https://sailakshmi-home-foods-backend.vercel.app/api in Vercel env vars'
  );
}

/**
 * Normalise the base URL:
 * 1. Strip trailing slashes
 * 2. If it does NOT already end with /api, append /api
 *
 * This makes the config resilient to Vercel env vars being set with or
 * without the /api suffix — either form produces the correct API_URL.
 */
const normaliseApiUrl = (url) => {
  if (!url) return 'http://localhost:5000/api';
  const stripped = url.replace(/\/+$/, ''); // remove trailing slashes
  // Avoid double /api/api — only append if the path doesn't already end with /api
  return stripped.endsWith('/api') ? stripped : `${stripped}/api`;
};

export const API_URL = normaliseApiUrl(RAW_URL);

/**
 * Make a plain (unauthenticated) API request.
 */
export const apiRequest = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${API_URL}/${cleanEndpoint}`;

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
    return data;
  } catch (error) {
    console.error(`[apiRequest] ${config.method} ${url} →`, error.message);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

/**
 * Make an authenticated API request (adds Authorization: Bearer <token> header).
 */
export const authenticatedRequest = async (endpoint, token, options = {}) => {
  if (!token) {
    throw new Error('Authentication required — no token provided');
  }

  return apiRequest(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

export default { apiRequest, authenticatedRequest, API_URL };
