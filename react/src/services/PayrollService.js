import api from '../api/axios';
import { ENDPOINTS, API_BASE_URL } from '../api/Define';

const PayrollService = {
  getHistory: async (params = {}) => {
    const response = await api.get(ENDPOINTS.PAYROLL, { params });
    return response.data;
  },
  runPayroll: async (month, year) => {
    const response = await api.post(ENDPOINTS.RUN_PAYROLL, { month, year });
    return response.data;
  },
  exportCsv: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const token = sessionStorage.getItem('token');
    // For direct downloads via window.open, we might need to pass the token as a query param 
    // if the backend doesn't support session cookies for these routes.
    // However, usually it's better to fetch as blob if auth is needed.
    window.open(`${API_BASE_URL}${ENDPOINTS.EXPORT_CSV}?${query}&token=${token}`, '_blank');
  },
  exportPdf: (id) => {
    const token = sessionStorage.getItem('token');
    window.open(`${API_BASE_URL}${ENDPOINTS.EXPORT_PDF(id)}?token=${token}`, '_blank');
  },
};

export default PayrollService;
