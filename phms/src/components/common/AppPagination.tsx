import React from 'react';
import './AppPagination.css';

interface AppPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

const AppPagination: React.FC<AppPaginationProps> = ({ currentPage, totalPages, onPageChange, disabled = false }) => {
  return (
    <div className="app-pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || disabled}
        className="app-pagination__button"
      >
        Previous
      </button>
      <span className="app-pagination__info">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || disabled}
        className="app-pagination__button"
      >
        Next
      </button>
    </div>
  );
};

export default AppPagination;
