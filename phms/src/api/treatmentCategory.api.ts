import axiosInstance from './axois.instance';

export const createTreatmentCategory = async (categoryData: any) => {
  const response = await axiosInstance.post('/treatment-categories', categoryData);
  return response.data;
};

export const getTreatmentCategories = async (params?: any) => {
  const response = await axiosInstance.get('/treatment-categories', { params });
  return response.data;
};

export const getTreatmentCategoryById = async (id: string) => {
  const response = await axiosInstance.get(`/treatment-categories/${id}`);
  return response.data;
};

export const updateTreatmentCategory = async (id: string, categoryData: any) => {
  const response = await axiosInstance.put(`/treatment-categories/${id}`, categoryData);
  return response.data;
};

export const deleteTreatmentCategory = async (id: string) => {
  const response = await axiosInstance.delete(`/treatment-categories/${id}`);
  return response.data;
};
