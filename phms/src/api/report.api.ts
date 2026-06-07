import axiosInstance from './axois.instance';

export const getReportsSummary = async (params?: any) => {
  const response = await axiosInstance.get('/reports/summary', { params });
  return response.data;
};

export const getReportsGrowth = async (params?: any) => {
  const response = await axiosInstance.get('/reports/growth', { params });
  return response.data;
};
