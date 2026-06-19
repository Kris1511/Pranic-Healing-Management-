import axiosInstance from './axois.instance';

export const uploadDocument = async (patientId: string, file: File, fileType: string) => {
  const formData = new FormData();
  formData.append('patientId', patientId);
  formData.append('fileType', fileType);
  formData.append('file', file);

  const response = await axiosInstance.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getPatientDocuments = async (patientId: string) => {
  const response = await axiosInstance.get(`/documents/patient/${patientId}`);
  return response.data;
};

export const getAllDocuments = async () => {
  const response = await axiosInstance.get('/documents');
  return response.data;
};

export const getDocumentBlob = async (id: string) => {
  const response = await axiosInstance.get(`/documents/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export const deleteDocument = async (id: string) => {
  const response = await axiosInstance.delete(`/documents/${id}`);
  return response.data;
};
