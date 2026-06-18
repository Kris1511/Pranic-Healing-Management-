import axiosInstance from './axois.instance';

export const createBranch = async (branchData: any) => {
  const response = await axiosInstance.post('/branches', branchData);
  return response.data;
};

export const getBranches = async (params?: any) => {
  const response = await axiosInstance.get('/branches', { params });
  return response.data;
};

export const getBranchById = async (id: string) => {
  const response = await axiosInstance.get(`/branches/${id}`);
  return response.data;
};

export const updateBranch = async (id: string, branchData: any) => {
  const response = await axiosInstance.put(`/branches/${id}`, branchData);
  return response.data;
};

export const deleteBranch = async (id: string) => {
  const response = await axiosInstance.delete(`/branches/${id}`);
  return response.data;
};
