import axiosInstance from './axois.instance';

export const getAttendanceHistory = async (userId?: string, params?: any) => {
  const url = userId ? `/attendance/history/${userId}` : '/attendance/history';
  const response = await axiosInstance.get(url, { params });
  return response.data;
};

export const saveAttendanceRecord = async (data: any) => {
  const response = await axiosInstance.post('/attendance/save', data);
  return response.data;
};
