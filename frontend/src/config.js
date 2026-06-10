export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const BACKEND_BASE_URL = API_URL.replace(/\/api\/?$/, '');
