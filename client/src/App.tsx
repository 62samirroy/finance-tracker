import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CreditCard, 
  History as HistoryIcon,
  Plus,
  ArrowRightLeft,
  Settings,
  Banknote,
  Wallet,
  Car,
  Fuel,
  Utensils,
  ShoppingBag,
  Heart
} from 'lucide-react';
import { api, Account, Transaction, Budget } from './api';
import Dashboard from './components/Dashboard';
import SalaryTransfer from './components/SalaryTransfer';
import ExpenseForm from './components/ExpenseForm';
import AccountManager from './components/AccountManager';
import History from './components/History';
import { format } from 'date-fns';
import { ToastProvider } from './context/ToastContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [upcomingExpenses, setUpcomingExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = format(new Date(), 'yyyy-MM');

  const fetchData = async () => {
    try {
      const [accRes, transRes, budgetRes, upcomingRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/transactions'),
        api.get(`/budgets/${currentMonth}`),
        api.get('/upcoming-expenses')
      ]);
      setAccounts(accRes.data);
      setTransactions(transRes.data);
      setBudget(budgetRes.data);
      setUpcomingExpenses(upcomingRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'salary', label: 'Salary & Transfer' },
    { id: 'expense', label: 'Expenses' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'history', label: 'All Transactions' },
  ];

  return (
    <div className="max-w-5xl mx-auto min-h-screen pb-10 bg-zinc-950 text-zinc-100 font-sans transition-all duration-300">
      {/* Top Tab Navigation */}
      <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-md z-[60] pt-6 px-4 md:px-0 pb-4 border-b border-zinc-900 mb-8">
        <div className="flex flex-wrap items-center gap-2 max-w-5xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl border text-[13px] font-bold transition-all duration-200 transform active:scale-95 ${
                activeTab === tab.id 
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-[0_8px_30px_rgb(255,255,255,0.1)]' 
                  : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 md:px-6 mt-2 max-w-5xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500"></div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {activeTab === 'dashboard' && (
              <Dashboard 
                accounts={accounts} 
                transactions={transactions} 
                budget={budget} 
                onRefresh={fetchData}
              />
            )}
            {activeTab === 'salary' && (
              <SalaryTransfer 
                accounts={accounts} 
                transactions={transactions}
                onRefresh={fetchData}
              />
            )}
            {activeTab === 'expense' && (
              <ExpenseForm 
                accounts={accounts} 
                budget={budget}
                transactions={transactions}
                upcomingExpenses={upcomingExpenses}
                onRefresh={fetchData}
              />
            )}
            {activeTab === 'accounts' && (
              <AccountManager 
                accounts={accounts} 
                onRefresh={fetchData}
              />
            )}
            {activeTab === 'history' && (
              <History 
                transactions={transactions} 
                accounts={accounts}
                onRefresh={fetchData}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
