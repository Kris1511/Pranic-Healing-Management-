import axiosInstance from './axois.instance';

export const getVisitorLog = async (params?: any) => {
  const response = await axiosInstance.get('/visitors/log', { params });
  return response.data;
};
