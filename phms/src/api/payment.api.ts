import axiosInstance from './axois.instance';

export const getPayments = async (params?: any) => {
  const response = await axiosInstance.get('/payments', { params });
  return response.data;
};
