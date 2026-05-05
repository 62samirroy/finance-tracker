import React, { useState, useEffect } from 'react';
import { 
  LogOut,
  User as UserIcon,
  Wallet
} from 'lucide-react';
import { api, Account, Transaction, Budget } from './api';
import Dashboard from './components/Dashboard';
import SalaryTransfer from './components/SalaryTransfer';
import ExpenseForm from './components/ExpenseForm';
import AccountManager from './components/AccountManager';
import History from './components/History';
import LentMoneyManager from './components/LentMoneyManager';
import { format } from 'date-fns';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [upcomingExpenses, setUpcomingExpenses] = useState<any[]>([]);
  const [lentRecords, setLentRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  const currentMonth = format(new Date(), 'yyyy-MM');

  const fetchData = async () => {
    if (!user) return;
    try {
      const [accRes, transRes, budgetRes, upcomingRes, lentRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/transactions'),
        api.get(`/budgets/${currentMonth}`),
        api.get('/upcoming-expenses'),
        api.get('/lent-money')
      ]);
      setAccounts(accRes.data);
      setTransactions(transRes.data);
      setBudget(budgetRes.data);
      setUpcomingExpenses(upcomingRes.data);
      setLentRecords(lentRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'salary', label: 'Salary & Transfer' },
    { id: 'expense', label: 'Expenses' },
    { id: 'lent', label: 'Borrowed/Lent' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'history', label: 'All Transactions' },
  ];

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto min-h-screen pb-10 bg-zinc-950 text-zinc-100 font-sans transition-all duration-300">
      {/* Top Header */}
      <header className="px-4 py-6 flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-zinc-100" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">Finance Tracker</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
              <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <span className="text-xs font-bold text-zinc-300">{user?.name || 'User'}</span>
          </div>
          <button 
            onClick={logout}
            className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform active:scale-95"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Top Tab Navigation */}
      <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-md z-[60] pt-2 px-4 md:px-0 pb-4 border-b border-zinc-900 mb-8">
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
            {activeTab === 'lent' && (
              <LentMoneyManager 
                lentRecords={lentRecords}
                accounts={accounts}
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

// Main App component with routing
const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};



export default App;
