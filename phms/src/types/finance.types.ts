export interface FinanceRecord {
  id: string;
  branchId: string;
  branch_id?: string;
  type: 'income' | 'expense' | 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description?: string;
  remarks?: string;
  paymentMode?: string;
  payment_mode?: string;
  createdBy?: string;
  created_by?: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFinancePayload {
  branch_id: string;
  type: 'INCOME' | 'EXPENSE' | 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  remarks?: string;
  payment_mode?: string;
  created_by?: string;
  date?: string;
}

export interface UpdateFinancePayload extends Partial<CreateFinancePayload> {}
