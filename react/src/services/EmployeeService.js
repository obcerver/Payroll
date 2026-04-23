import api from '../api/axios';
import { ENDPOINTS } from '../api/Define';

const EmployeeService = {
  getAll: async (params = {}) => {
    const response = await api.get(ENDPOINTS.EMPLOYEES, { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`${ENDPOINTS.EMPLOYEES}/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post(ENDPOINTS.EMPLOYEES, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`${ENDPOINTS.EMPLOYEES}/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`${ENDPOINTS.EMPLOYEES}/${id}`);
    return response.data;
  },
};

export default EmployeeService;
