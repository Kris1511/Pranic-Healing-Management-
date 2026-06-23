import axiosInstance from './axois.instance';

export const createFeedback = async (feedbackData: any) => {
  const response = await axiosInstance.post('/feedbacks', feedbackData);
  return response.data;
};

export const getFeedbacks = async (params?: any) => {
  const response = await axiosInstance.get('/feedbacks', { params });
  return response.data;
};
