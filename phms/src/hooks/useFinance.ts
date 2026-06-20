import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFinanceTransactions,
  getFinanceSummary,
  addFinanceTransaction,
  updateFinanceTransaction,
  deleteFinanceTransaction
} from '../api/finance.api';
import { CreateFinancePayload, UpdateFinancePayload } from '../types/finance.types';

export const useFinanceTransactions = (filters?: any) => {
  return useQuery({
    queryKey: ['finance-transactions', filters],
    queryFn: () => getFinanceTransactions(filters),
    staleTime: 5000,
  });
};

export const useFinanceSummary = (filters?: any) => {
  return useQuery({
    queryKey: ['finance-summary', filters],
    queryFn: () => getFinanceSummary(filters),
    staleTime: 5000,
  });
};

export const useCreateFinanceTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFinancePayload) => addFinanceTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['branch-finance-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
    },
  });
};

export const useUpdateFinanceTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateFinancePayload }) =>
      updateFinanceTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['branch-finance-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
    },
  });
};

export const useDeleteFinanceTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteFinanceTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['branch-finance-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
    },
  });
};
