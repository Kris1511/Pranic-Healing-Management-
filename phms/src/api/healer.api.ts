import axiosInstance from './axois.instance';

export const createHealer = async (healerData: any) => {
  try {
    console.log("Healer Data:", healerData);

    const config = healerData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined;

    const response = await axiosInstance.post('/healers', healerData, config);

    console.log("Success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Status:", error.response?.status);
    console.error("Response Data:", error.response?.data);
    console.error("Message:", error.message);

    throw error;
  }
};

export const getHealers = async (params?: any) => {
  const response = await axiosInstance.get('/healers', { params });
  return response.data;
};

export const getHealerById = async (id: string) => {
  const response = await axiosInstance.get(`/healers/${id}`);
  return response.data;
};

export const updateHealer = async (id: string, healerData: any) => {
  const config = healerData instanceof FormData 
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : undefined;
  const response = await axiosInstance.put(`/healers/${id}`, healerData, config);
  return response.data;
};

export const deleteHealer = async (id: string) => {
  const response = await axiosInstance.delete(`/healers/${id}`);
  return response.data;
};

