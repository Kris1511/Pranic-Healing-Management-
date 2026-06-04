import axiosInstance from './axois.instance';

export const createHealer = async (healerData: any) => {
  const response = await axiosInstance.post('/healers', healerData);
  return response.data;
};

export const getHealers = async (params?: any) => {
  const response = await axiosInstance.get('/healers', { params });
  return response.data;
};

export const getHealerById = async (id: string) => {
  const response = await axiosInstance.get(`/healers/${id}`);
  return response.data;
};

export const updateHealer = async (id: string, healerData: any) => {
  const response = await axiosInstance.put(`/healers/${id}`, healerData);
  return response.data;
};

export const deleteHealer = async (id: string) => {
  const response = await axiosInstance.delete(`/healers/${id}`);
  return response.data;
};
