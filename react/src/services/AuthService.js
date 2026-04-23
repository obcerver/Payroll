import api from '../api/axios';
import { ENDPOINTS } from '../api/Define';

const AuthService = {
  login: async (credentials) => {
    const response = await api.post(ENDPOINTS.LOGIN, credentials);
    if (response.data.access_token) {
      sessionStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post(ENDPOINTS.REGISTER, userData);
    if (response.data.access_token) {
      sessionStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },
  logout: async () => {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } finally {
      sessionStorage.removeItem('token');
    }
  },
  getCurrentUser: async () => {
    const response = await api.post(ENDPOINTS.ME);
    return response.data;
  },
};

export default AuthService;
