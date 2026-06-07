import axiosInstance from './axois.instance';

export const getFinanceTransactions = async (params?: any) => {
  const response = await axiosInstance.get('/finance', { params });
  return response.data;
};

export const getFinanceSummary = async (params?: any) => {
  const response = await axiosInstance.get('/finance/summary', { params });
  return response.data;
};
