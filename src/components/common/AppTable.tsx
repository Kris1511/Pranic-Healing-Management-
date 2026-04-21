import React from 'react';
import { IonTable, IonTr, IonTd, IonTh } from '@ionic/react';
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
        <IonTable className="app-table__table">
          <thead>
            <IonTr>
              {columns.map((col) => (
                <IonTh key={col.key} className="app-table__header">
                  {col.label}
                </IonTh>
              ))}
            </IonTr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <IonTr key={idx}>
                {columns.map((col) => (
                  <IonTd key={`${idx}-${col.key}`} className="app-table__cell">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </IonTd>
                ))}
              </IonTr>
            ))}
          </tbody>
        </IonTable>
      )}
    </div>
  );
};

export default AppTable;
