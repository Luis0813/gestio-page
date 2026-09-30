import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // La instancia free de Render se suspende por inactividad y puede tardar
  // 50s+ en volver a arrancar. Sin timeout el fetch queda colgado y el
  // navegador termina reportando "Network error".
  timeout: 120_000,
});

// Reintenta una sola vez cuando NO hubo respuesta del servidor (servidor
// suspendido o CORS). Nunca se reintenta si la respuesta llegó (4xx/5xx),
// porque ahí el error es real y reintentar sólo lo repetiría.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response && error.config && !error.config.__retried) {
      error.config.__retried = true;
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);

// Add Authorization header dynamically if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gestio_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
