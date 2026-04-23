import api from '../api/axios';
import { ENDPOINTS } from '../api/Define';

const DepartmentService = {
  getAll: async () => {
    const response = await api.get(ENDPOINTS.DEPARTMENTS);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`${ENDPOINTS.DEPARTMENTS}/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post(ENDPOINTS.DEPARTMENTS, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`${ENDPOINTS.DEPARTMENTS}/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`${ENDPOINTS.DEPARTMENTS}/${id}`);
    return response.data;
  },
};

export default DepartmentService;
