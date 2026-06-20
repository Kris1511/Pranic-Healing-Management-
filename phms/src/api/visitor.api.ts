import axiosInstance from './axois.instance';

export const getVisitorLog = async (params?: any) => {
  const response = await axiosInstance.get('/visitors/log', { params });
  return response.data;
};

export const checkInVisitor = async (visitorData: any) => {
  const response = await axiosInstance.post('/visitors/check-in', visitorData);
  return response.data;
};

export const getVisitorDetails = async (id: string) => {
  const response = await axiosInstance.get(`/visitors/${id}`);
  return response.data;
};

export const updateVisitor = async (id: string, visitorData: any) => {
  const response = await axiosInstance.put(`/visitors/${id}`, visitorData);
  return response.data;
};
