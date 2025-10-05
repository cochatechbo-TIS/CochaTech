import axios from 'axios';

// 1. Crea una instancia de Axios con la configuración base.
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
  },
});

// 2. Configura el "interceptor" para añadir el token a cada petición.
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
