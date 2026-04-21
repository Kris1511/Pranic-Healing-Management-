import React from 'react';
import './AppTable.css';

interface AppTableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AppTableProps {
  columns: AppTableColumn[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
}

const AppTable: React.FC<AppTableProps> = ({ columns, data, loading = false, emptyMessage = 'No data found' }) => {
  return (
    <div className="app-table">
      {loading ? (
        <p className="app-table__loading">Loading...</p>
      ) : data.length === 0 ? (
        <p className="app-table__empty">{emptyMessage}</p>
      ) : (
        <table className="app-table__table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="app-table__header">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={`${idx}-${col.key}`} className="app-table__cell">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AppTable;
