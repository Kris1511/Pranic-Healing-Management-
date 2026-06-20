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

/**
 * Fetch the full session-based payment ledger for a single patient.
 * Returns an array of ledger entries (INV-*, sessionDate, totalBilled,
 * paid, outstanding, paymentStatus, paymentMethod).
 */
export const getPatientPaymentLedger = async (patientId: string) => {
  const response = await axiosInstance.get('/payments', { params: { patientId } });
  return response.data;
};

export const deletePayment = async (id: string) => {
  const response = await axiosInstance.delete(`/payments/${id}`);
  return response.data;
};
