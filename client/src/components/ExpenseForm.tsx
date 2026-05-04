import React, { useState } from 'react';
import { Account, api, Budget, Transaction } from '../api';
import { format } from 'date-fns';
import { useToast } from '../context/ToastContext';
import { Trash2, Edit2, X, AlertTriangle } from 'lucide-react';

interface Props {
  accounts: Account[];
  budget: Budget | null;
  transactions: Transaction[];
  upcomingExpenses: any[];
  onRefresh: () => void;
}

const ExpenseForm: React.FC<Props> = ({ accounts, budget, transactions, upcomingExpenses = [], onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'upcoming'>('expenses');
  const [budgetAmountInput, setBudgetAmountInput] = useState(budget?.amount || '');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [editingUpcoming, setEditingUpcoming] = useState<any | null>(null);
  const [deletingUpcoming, setDeletingUpcoming] = useState<any | null>(null);
  const [payingUpcoming, setPayingUpcoming] = useState<any | null>(null);
  
  const currentMonthDate = new Date();
  const currentMonth = format(currentMonthDate, 'yyyy-MM');
  const { showToast } = useToast();

  const handleSetBudget = async () => {
    setLoading(true);
    try {
      await api.post('/budgets', {
        month: currentMonth,
        amount: budgetAmountInput,
        withdrawn_from_account_id: null
      });
      showToast('Monthly budget updated!', 'success');
      setIsEditingBudget(false);
      onRefresh();
    } catch (err) {
      console.error('Error setting budget:', err);
      showToast('Error updating budget', 'error');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Petrol', 'Food', 'Shopping', 'Car Wash', 'Medicine', 'Other'];

  const monthExpenses = transactions.filter(t => {
    if (t.type !== 'expense' || !t.date) return false;
    const tDate = new Date(t.date);
    const now = new Date();
    return tDate.getUTCFullYear() === now.getFullYear() && tDate.getUTCMonth() === now.getMonth();
  });

  const spentTotal = monthExpenses.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const budgetAmount = budget ? parseFloat(budget.amount) : 0;
  const budgetProgress = budget ? (spentTotal / budgetAmount) * 100 : 0;
  const pocketLeft = budget ? budgetAmount - spentTotal : 0;

  const recentExpenses = transactions
    .filter(t => t.type === 'expense')
    .slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, {
          amount: formData.get('amount'),
          type: 'expense',
          category: formData.get('category'),
          source_account_id: formData.get('from') || null,
          note: formData.get('note'),
          date: formData.get('date') ? new Date(formData.get('date') as string) : new Date(),
        });
        showToast('Expense updated!', 'success');
        setEditingTransaction(null);
      } else {
        await api.post('/transactions', {
          amount: formData.get('amount'),
          type: 'expense',
          category: formData.get('category'),
          source_account_id: formData.get('from') || null,
          note: formData.get('note'),
          date: formData.get('date') ? new Date(formData.get('date') as string) : new Date(),
        });
        showToast('Expense added!', 'success');
      }
      onRefresh();
      if (!editingTransaction) (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      showToast('Error saving expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpcoming = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    try {
      const data = {
        amount: formData.get('amount'),
        category: formData.get('category'),
        expected_date: formData.get('date'),
        note: formData.get('note'),
      };

      if (editingUpcoming) {
        await api.put(`/upcoming-expenses/${editingUpcoming.id}`, data);
        showToast('Upcoming expense updated!', 'success');
        setEditingUpcoming(null);
      } else {
        await api.post('/upcoming-expenses', data);
        showToast('Upcoming expense added!', 'success');
      }
      onRefresh();
      if (!editingUpcoming) (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      showToast('Error saving upcoming expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaidConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingUpcoming || loading) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const accountId = formData.get('accountId');

    try {
      await api.post('/transactions', {
        amount: payingUpcoming.amount,
        type: 'expense',
        category: payingUpcoming.category,
        source_account_id: accountId || null,
        note: payingUpcoming.note,
        date: new Date(),
      });
      await api.delete(`/upcoming-expenses/${payingUpcoming.id}`);
      showToast('Expense recorded!', 'success');
      setPayingUpcoming(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      showToast('Error converting to expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTransaction || loading) return;
    setLoading(true);
    try {
      await api.delete(`/transactions/${deletingTransaction.id}`);
      showToast('Expense deleted', 'success');
      setDeletingTransaction(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      showToast('Error deleting expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUpcoming = async () => {
    if (!deletingUpcoming || loading) return;
    setLoading(true);
    try {
      await api.delete(`/upcoming-expenses/${deletingUpcoming.id}`);
      showToast('Upcoming deleted', 'success');
      setDeletingUpcoming(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      showToast('Error deleting upcoming', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'expenses' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Expenses 💸
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'upcoming' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Upcoming ⏳
        </button>
      </div>

      {activeTab === 'expenses' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-zinc-200">Pocket budget</h3>
                  <p className="text-[10px] text-zinc-500 font-medium">₹{spentTotal.toLocaleString()} spent (this month)</p>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center gap-2">
                    {isEditingBudget ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">₹</span>
                          <input 
                            type="number" 
                            value={budgetAmountInput}
                            onChange={(e) => setBudgetAmountInput(e.target.value)}
                            className="bg-zinc-950 border border-zinc-700 rounded-lg pl-7 pr-3 py-2 text-sm w-32 focus:outline-none focus:border-zinc-500 font-mono text-zinc-100"
                            autoFocus
                          />
                        </div>
                        <button onClick={handleSetBudget} disabled={loading} className="p-2 bg-zinc-100 text-zinc-950 rounded-lg hover:bg-white transition-all transform active:scale-95 shadow-lg disabled:opacity-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                        <button onClick={() => setIsEditingBudget(false)} className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="group flex items-center gap-3">
                        <div className="bg-zinc-950/50 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Budget</span>
                          <p className="text-sm font-mono text-zinc-200">₹{budgetAmount.toLocaleString()}</p>
                        </div>
                        <button onClick={() => setIsEditingBudget(true)} className="p-2 hover:bg-zinc-800 rounded-lg text-white transition-all">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className={`text-[10px] font-bold ${pocketLeft < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {budget ? (pocketLeft >= 0 ? `₹${pocketLeft.toLocaleString()} left` : `₹${Math.abs(pocketLeft).toLocaleString()} over`) : 'Not set'}
                  </p>
                </div>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-700 ease-out ${
                    budgetProgress > 100 ? 'bg-gradient-to-r from-rose-600 to-rose-400' : budgetProgress > 80 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-200 mb-6 flex items-center gap-2">
                <span className="p-1.5 bg-rose-500/10 rounded-lg text-rose-500">💸</span>
                Add expense
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Category</label>
                    <select name="category" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 appearance-none transition-colors" required>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
                      <input name="amount" type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" required />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Date</label>
                    <input name="date" type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" defaultValue={format(new Date(), 'yyyy-MM-dd')} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Paid from</label>
                    <select name="from" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 appearance-none transition-colors" required>
                      <option value="">Select Bank</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Note</label>
                  <input name="note" placeholder="Optional" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-rose-500/90 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-rose-500 transition-all transform active:scale-[0.98] shadow-lg shadow-rose-500/10 disabled:opacity-50">
                  {loading ? 'Adding...' : 'Add Expense ↗'}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl min-h-[400px] flex flex-col">
            <h3 className="text-sm font-semibold text-zinc-200 mb-6 flex justify-between items-center">
              Recent expenses
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Records: {recentExpenses.length}</span>
            </h3>
            {recentExpenses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 py-12">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-xs font-medium text-zinc-500">No records found yet</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 scrollbar-hide">
                {recentExpenses.map(t => (
                  <div key={t.id} className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-4 flex items-center justify-between hover:border-zinc-800 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-lg">💸</div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">{t.category}</p>
                        <p className="text-[10px] text-zinc-500 font-medium">
                          {format(new Date(t.date), 'dd MMM yyyy')} • {t.note || 'No note'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-black text-rose-400">₹{parseFloat(t.amount).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1 transition-opacity">
                        <button onClick={() => setEditingTransaction(t)} className="p-1.5 hover:bg-zinc-800 rounded-md text-white transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeletingTransaction(t)} className="p-1.5 hover:bg-red-500/10 rounded-md text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-200 mb-6 flex items-center gap-2">
                <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">⏳</span>
                {editingUpcoming ? 'Edit planned expense' : 'Note for future expense'}
              </h3>
              <form onSubmit={handleSubmitUpcoming} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Category</label>
                    <select name="category" defaultValue={editingUpcoming?.category} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 appearance-none transition-colors" required>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
                      <input name="amount" type="number" defaultValue={editingUpcoming?.amount} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" required />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Expected Date</label>
                  <input name="date" type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" defaultValue={editingUpcoming?.expected_date || format(new Date(), 'yyyy-MM-dd')} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Note</label>
                  <input name="note" defaultValue={editingUpcoming?.note} placeholder="e.g. For next month car service" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="flex-1 bg-amber-500/90 text-zinc-950 py-2.5 rounded-lg text-sm font-bold hover:bg-amber-500 transition-all transform active:scale-[0.98] shadow-lg shadow-amber-500/10 disabled:opacity-50">
                    {loading ? 'Saving...' : (editingUpcoming ? 'Update Plan' : 'Save Plan ⏳')}
                  </button>
                  {editingUpcoming && (
                    <button type="button" onClick={() => setEditingUpcoming(null)} className="px-4 py-2.5 bg-zinc-800 text-zinc-400 rounded-lg text-sm font-bold hover:bg-zinc-700 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl min-h-[400px] flex flex-col">
            <h3 className="text-sm font-semibold text-zinc-200 mb-6 flex justify-between items-center">
              Planned for future
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Planned: {upcomingExpenses.length}</span>
            </h3>
            {upcomingExpenses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 py-12">
                <div className="text-4xl mb-4">🔮</div>
                <p className="text-xs font-medium text-zinc-500">No future plans noted yet</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 scrollbar-hide">
                {upcomingExpenses.map(u => (
                  <div key={u.id} className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-4 flex items-center justify-between hover:border-zinc-800 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-lg">📅</div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">{u.category}</p>
                        <p className="text-[10px] text-zinc-500 font-medium">
                          Target: {format(new Date(u.expected_date), 'dd MMM yyyy')} • {u.note || 'No note'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <p className="text-sm font-black text-amber-500">₹{parseFloat(u.amount).toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => setPayingUpcoming(u)}
                        disabled={loading}
                        className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md hover:bg-emerald-500 hover:text-white transition-all transform active:scale-95 disabled:opacity-50"
                        title="Paid? Move to expenses"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                      </button>
                      <button onClick={() => setEditingUpcoming(u)} className="p-1.5 hover:bg-zinc-800 rounded-md text-white transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeletingUpcoming(u)} className="p-1.5 hover:bg-red-500/10 rounded-md text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Edit Expense</h3>
              <button onClick={() => setEditingTransaction(null)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Category</label>
                  <select name="category" defaultValue={editingTransaction.category} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 appearance-none" required>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
                    <input name="amount" type="number" defaultValue={editingTransaction.amount} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600" required />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Date</label>
                  <input name="date" type="date" defaultValue={format(new Date(editingTransaction.date), 'yyyy-MM-dd')} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Paid from</label>
                  <select name="from" defaultValue={editingTransaction.source_account_id || ''} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 appearance-none" required>
                    <option value="">Select Bank</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Note</label>
                <input name="note" defaultValue={editingTransaction.note} placeholder="Optional" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-rose-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-rose-600 transition-all transform active:scale-[0.98] shadow-lg shadow-rose-500/20 disabled:opacity-50">
                {loading ? 'Updating...' : 'Update Expense'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pay Upcoming Modal */}
      {payingUpcoming && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Mark as Paid</h3>
              <button onClick={() => setPayingUpcoming(null)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-xs text-zinc-400">Recording payment for:</p>
              <p className="text-sm font-bold text-zinc-100 mt-1">{payingUpcoming.category} - ₹{parseFloat(payingUpcoming.amount).toLocaleString()}</p>
            </div>
            <form onSubmit={handleMarkAsPaidConfirm} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Select Account</label>
                <select name="accountId" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 appearance-none" required>
                  <option value="">Choose Bank</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all transform active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                {loading ? 'Processing...' : 'Confirm Payment ✅'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {(deletingTransaction || deletingUpcoming) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Confirm Delete</h3>
                <p className="text-xs text-zinc-400 mt-2">
                  Are you sure you want to delete this {deletingUpcoming ? 'planned' : ''} expense of <span className="text-rose-400 font-bold">₹{parseFloat(deletingTransaction?.amount || deletingUpcoming?.amount || '0').toLocaleString()}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button 
                  onClick={() => { setDeletingTransaction(null); setDeletingUpcoming(null); }}
                  className="flex-1 bg-zinc-800 text-zinc-300 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={deletingUpcoming ? handleDeleteUpcoming : handleDelete}
                  disabled={loading}
                  className="flex-1 bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseForm;
