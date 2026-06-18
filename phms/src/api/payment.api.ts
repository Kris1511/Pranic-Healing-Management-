import axiosInstance from './axois.instance';

export const getPayments = async (params?: any) => {
  const response = await axiosInstance.get('/payments', { params });
  return response.data;
};

export const processPayment = async (data: any) => {
  const response = await axiosInstance.post('/payments/process', data);
  return response.data;
};

export const getPaymentById = async (id: string) => {
  const response = await axiosInstance.get(`/payments/${id}`);
  return response.data;
};
