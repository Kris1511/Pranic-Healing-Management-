import axiosInstance from './axois.instance';

export const createUser = async (userData: any) => {
  const response = await axiosInstance.post('/users', userData);
  return response.data;
};

export const getUsers = async (params?: any) => {
  const response = await axiosInstance.get('/users', { params });
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, userData: any) => {
  const response = await axiosInstance.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};
