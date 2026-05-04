import axios from 'axios';
import { environment } from './environments';

const API_BASE_URL = environment.apiUrl;

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
  type: 'salary' | 'transfer' | 'expense' | 'emi' | 'budget_withdraw' | 'self_transfer' | 'received_money';
  category?: string;
  source_account_id?: number;
  destination_account_id?: number;
  sourceAccount?: { name: string };
  destinationAccount?: { name: string };
  note?: string;
  date: string;
}

export interface Budget {
  id: number;
  month: string;
  amount: string;
  withdrawn_from_account_id?: number;
}

export interface UpcomingExpense {
  id: number;
  amount: string;
  category: string;
  note?: string;
  expected_date: string;
  created_at?: string;
}
