import axiosInstance from './axois.instance';

export const createPatient = async (patientData: any) => {
  const response = await axiosInstance.post('/patients', patientData);
  return response.data;
};

export const getPatients = async (params?: any) => {
  const response = await axiosInstance.get('/patients', { params });
  return response.data;
};

export const getPatientById = async (id: string) => {
  const response = await axiosInstance.get(`/patients/${id}`);
  return response.data;
};

export const updatePatient = async (id: string, patientData: any) => {
  const response = await axiosInstance.put(`/patients/${id}`, patientData);
  return response.data;
};

export const deletePatient = async (id: string) => {
  const response = await axiosInstance.delete(`/patients/${id}`);
  return response.data;
};
