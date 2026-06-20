import axiosInstance from './axois.instance';

export const getFinanceTransactions = async (params?: any) => {
  const response = await axiosInstance.get('/finance', { params });
  return response.data;
};

export const getFinanceSummary = async (params?: any) => {
  const response = await axiosInstance.get('/finance/summary', { params });
  return response.data;
};

export const getSuperAdminDailyFinance = async (params?: any) => {
  const response = await axiosInstance.get('/finance/super-admin/daily', { params });
  return response.data;
};

export const addFinanceTransaction = async (data: any) => {
  const response = await axiosInstance.post('/finance', data);
  return response.data;
};

export const updateFinanceTransaction = async (id: number | string, data: any) => {
  const response = await axiosInstance.put(`/finance/${id}`, data);
  return response.data;
};

export const deleteFinanceTransaction = async (id: number | string) => {
  const response = await axiosInstance.delete(`/finance/${id}`);
  return response.data;
};

export const getSuperAdminRevenueFinance = async (params?: any) => {
  const response = await axiosInstance.get('/finance/super-admin/revenue', { params });
  return response.data;
};

export const getBranchDashboardStats = async () => {
  const response = await axiosInstance.get('/finance/dashboard-stats');
  return response.data;
};

export const getSuperAdminDashboardStats = async () => {
  const response = await axiosInstance.get('/finance/super-admin/dashboard-stats');
  return response.data;
};

export const getSuperAdminWeeklyFinance = async (weekOffset: number) => {
  const response = await axiosInstance.get('/super-admin/dashboard/weekly-finance', {
    params: { weekOffset }
  });
  return response.data;
};
