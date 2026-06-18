import axiosInstance from './axois.instance';

export const getVisitorLog = async (params?: any) => {
  const response = await axiosInstance.get('/visitors/log', { params });
  return response.data;
};

export const checkInVisitor = async (visitorData: any) => {
  const response = await axiosInstance.post('/visitors/check-in', visitorData);
  return response.data;
};
