/**
 * Centralized API Configuration
 *
 * URL resolution order (Vite env file precedence):
 *   .env.local        → local development  (VITE_API_URL=http://localhost:5000/api)
 *   .env.production   → production build   (VITE_API_URL=https://your-backend.vercel.app/api)
 *   .env              → shared fallback     (no VITE_API_URL — forces explicit config)
 *
 * Never hardcode a URL in this file.
 */

const RAW_URL = import.meta.env.VITE_API_URL;

if (!RAW_URL) {
  console.error(
    '[apiConfig] VITE_API_URL is not set.\n' +
    '  • For local dev: add VITE_API_URL=http://localhost:5000/api to frontend/.env.local\n' +
    '  • For production build: add VITE_API_URL=https://your-backend.vercel.app/api to frontend/.env.production'
  );
}

// Strip any trailing slash so endpoint concatenation is always clean
export const API_URL = (RAW_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

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
