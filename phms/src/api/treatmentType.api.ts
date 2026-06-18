import axiosInstance from './axois.instance';

export const createTreatmentType = async (typeData: any) => {
  const response = await axiosInstance.post('/treatment-types', typeData);
  return response.data;
};

export const getTreatmentTypes = async (params?: any) => {
  const response = await axiosInstance.get('/treatment-types', { params });
  return response.data;
};

export const getTreatmentTypeById = async (id: string) => {
  const response = await axiosInstance.get(`/treatment-types/${id}`);
  return response.data;
};

export const updateTreatmentType = async (id: string, typeData: any) => {
  const response = await axiosInstance.put(`/treatment-types/${id}`, typeData);
  return response.data;
};

export const deleteTreatmentType = async (id: string) => {
  const response = await axiosInstance.delete(`/treatment-types/${id}`);
  return response.data;
};
