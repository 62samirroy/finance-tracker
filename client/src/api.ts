import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Account {
  id: number;
  name: string;
  balance: string;
}

export interface Transaction {
  id: number;
  amount: string;
  type: 'salary' | 'transfer' | 'expense' | 'emi' | 'budget_withdraw' | 'self_transfer';
  category?: string;
  source_account_id?: number;
  destination_account_id?: number;
  source_name?: string;
  destination_name?: string;
  note?: string;
  date: string;
}

export interface Budget {
  id: number;
  month: string;
  amount: string;
  withdrawn_from_account_id?: number;
}
