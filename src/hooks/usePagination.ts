import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setPagination: (page: number, totalPages: number, totalItems: number) => void;
}

export const usePagination = (options: UsePaginationOptions = {}): UsePaginationReturn => {
  const { initialPage = 1, initialLimit = 10 } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const nextPage = useCallback(() => {
    setPage((prev) => (prev < totalPages ? prev + 1 : prev));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const setPagination = useCallback((newPage: number, newTotalPages: number, newTotalItems: number) => {
    setPage(newPage);
    setTotalPages(newTotalPages);
    setTotalItems(newTotalItems);
  }, []);

  return {
    page,
    limit,
    totalPages,
    totalItems,
    nextPage,
    prevPage,
    goToPage,
    setLimit,
    setPagination,
  };
};
