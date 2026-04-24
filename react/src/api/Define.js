export const API_BASE_URL = "http://localhost:8000/api";

export const ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
  DEPARTMENTS: "/departments",
  EMPLOYEES: "/employees",
  PAYROLL: "/payroll",
  RUN_PAYROLL: "/payroll/run",
  EXPORT_CSV: "/payroll/export-csv",
  PAYROLL_STATS: "/payroll/stats",
  EXPORT_PDF: (id) => `/payroll/${id}/pdf`,
};
