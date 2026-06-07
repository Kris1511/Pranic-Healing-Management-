import axiosInstance from './axois.instance';

export const getSessions = async (params?: any) => {
  const response = await axiosInstance.get('/sessions', { params });
  return response.data;
};

export const getSessionById = async (id: string) => {
  const response = await axiosInstance.get(`/sessions/${id}`);
  return response.data;
};
