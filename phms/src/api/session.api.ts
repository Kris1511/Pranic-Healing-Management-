import axiosInstance from './axois.instance';

export const createSession = async (sessionData: any) => {
  const response = await axiosInstance.post('/sessions', sessionData);
  return response.data;
};

export const getSessions = async (params?: any) => {
  const response = await axiosInstance.get('/sessions', { params });
  return response.data;
};

export const getSessionsSummary = async () => {
  const response = await axiosInstance.get('/sessions/dashboard-summary');
  return response.data;
};

export const getSessionById = async (id: string) => {
  const response = await axiosInstance.get(`/sessions/${id}`);
  return response.data;
};

export const updateSession = async (id: string, sessionData: any) => {
  const response = await axiosInstance.put(`/sessions/${id}`, sessionData);
  return response.data;
};

export const deleteSession = async (id: string) => {
  const response = await axiosInstance.delete(`/sessions/${id}`);
  return response.data;
};
