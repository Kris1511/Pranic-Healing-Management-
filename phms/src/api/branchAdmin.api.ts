import axiosInstance from './axois.instance';

export const createBranchAdmin = async (formData: FormData) => {
  const response = await axiosInstance.post('/branch-admins', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getBranchAdmins = async (params?: any) => {
  const response = await axiosInstance.get('/branch-admins', { params });
  return response.data;
};

export const deleteBranchAdmin = async (id: string) => {
  const response = await axiosInstance.delete(`/branch-admins/${id}`);
  return response.data;
};

export const getBranchAdminById = async (id: string) => {
  const response = await axiosInstance.get(`/branch-admins/${id}`);
  return response.data;
};

export const updateBranchAdmin = async (id: string, formData: FormData) => {
  const response = await axiosInstance.put(`/branch-admins/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
