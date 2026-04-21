import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import axiosInstance from '../api/axois.instance';

interface UseFetchOptions<TData = any> extends Omit<UseQueryOptions<TData, AxiosError>, 'queryFn'> {
  url: string;
  enabled?: boolean;
  headers?: Record<string, string>;
}

/**
 * Custom hook for fetching data using Axios and React Query
 * Provides a simplified interface for common fetch operations
 */
export const useFetch = <TData = any>({
  url,
  enabled = true,
  headers,
  ...queryOptions
}: UseFetchOptions<TData>) => {
  return useQuery<TData, AxiosError>({
    queryKey: [url],
    queryFn: async () => {
      const response = await axiosInstance.get<TData>(url, { headers });
      return response.data;
    },
    enabled,
    ...queryOptions,
  });
};

/**
 * Helper hook for paginated fetch requests
 */
export const useFetchPaginated = <TData = any>(
  url: string,
  page: number = 1,
  limit: number = 10,
  queryOptions?: Omit<UseFetchOptions<TData>, 'url'>
) => {
  const paginatedUrl = `${url}?page=${page}&limit=${limit}`;

  return useFetch<TData>({
    url: paginatedUrl,
    ...queryOptions,
  });
};
