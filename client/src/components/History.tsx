import React, { useState } from 'react';
import { Transaction, Account, api } from '../api';
import { format } from 'date-fns';
import { Trash2, Edit2, ChevronDown, Filter, Calendar, X, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Props {
  transactions: Transaction[];
  accounts: Account[];
  onRefresh: () => void;
}

const History: React.FC<Props> = ({ transactions, accounts, onRefresh }) => {
  const { showToast } = useToast();
  const [filterType, setFilterType] = useState('all');
  const [filterBank, setFilterBank] = useState('all');
  const [filterMonth, setFilterMonth] = useState(''); // Default to all months
  const [loading, setLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This will reset all balances and delete all transactions.')) return;
    try {
      await api.delete('/transactions/clear');
      onRefresh();
      showToast('All data cleared!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error clearing data', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    setLoading(true);
    try {
      await api.delete(`/transactions/${deletingTransaction.id}`);
      showToast('Transaction deleted and balance reverted', 'success');
      setDeletingTransaction(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      showToast('Error deleting transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    try {
      await api.put(`/transactions/${editingTransaction.id}`, {
        amount: formData.get('amount'),
        type: editingTransaction.type,
        category: editingTransaction.category,
        source_account_id: editingTransaction.source_account_id,
        destination_account_id: editingTransaction.destination_account_id,
        note: formData.get('note'),
        date: formData.get('date') ? new Date(formData.get('date') as string) : new Date(),
      });
      showToast('Transaction updated', 'success');
      setEditingTransaction(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      showToast('Error updating transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const typeMatch = filterType === 'all' || t.type === filterType;
    const bankMatch = filterBank === 'all' || 
                     (t.source_account_id?.toString() === filterBank) || 
                     (t.destination_account_id?.toString() === filterBank);
    const monthMatch = !filterMonth || format(new Date(t.date), 'yyyy-MM') === filterMonth;
    return typeMatch && bankMatch && monthMatch;
  });

  return (
    <div className="space-y-6">
      {/* Filters Container */}
      <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-200">Filter Transactions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider ml-1">Type</label>
            <div className="relative">
              <select 
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-200 focus:outline-none focus:border-zinc-600 appearance-none transition-colors"
              >
                <option value="all">All Types</option>
                <option value="salary">Salary</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
                <option value="emi">EMI</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider ml-1">Account</label>
            <div className="relative">
              <select 
                value={filterBank}
                onChange={e => setFilterBank(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-200 focus:outline-none focus:border-zinc-600 appearance-none transition-colors"
              >
                <option value="all">All Banks</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider ml-1">Month</label>
            <div className="relative">
              <input 
                type="month"
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-200 focus:outline-none focus:border-zinc-600 appearance-none transition-colors"
              />
              {filterMonth && (
                <button 
                  onClick={() => setFilterMonth('')}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 min-h-[300px]">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <Calendar className="w-12 h-12 mb-4 text-zinc-500" />
              <p className="text-sm font-medium text-zinc-500">No matching transactions found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map(t => (
                <div key={t.id} className="grid grid-cols-[1fr_auto] items-center p-4 rounded-xl bg-zinc-950/40 border border-zinc-900/50 hover:bg-zinc-900/40 hover:border-zinc-800 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      t.type === 'salary' ? 'bg-emerald-500/10 text-emerald-500' :
                      t.type === 'expense' ? 'bg-rose-500/10 text-rose-500' :
                      t.type === 'emi' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-sky-500/10 text-sky-500'
                    }`}>
                      {t.type === 'salary' ? '💰' : t.type === 'expense' ? '💸' : t.type === 'emi' ? '📄' : '🔄'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-100">{t.category || t.type.replace('_', ' ')}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-tighter">
                          {format(new Date(t.date), 'dd MMMM yyyy')}
                        </p>
                        <span className="text-zinc-800 text-[10px]">•</span>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                          {t.type === 'salary' ? `Credited to ${t.destination_name}` :
                           t.type === 'transfer' || t.type === 'self_transfer' ? `${t.source_name} ➔ ${t.destination_name}` :
                           t.source_name || t.destination_name || 'Cash'}
                        </p>
                      </div>
                      {t.note && <p className="text-[10px] text-zinc-600 mt-1 italic">"{t.note}"</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-base font-black ${t.type === 'salary' ? 'text-emerald-400' : 'text-zinc-100'}`}>
                        {t.type === 'salary' ? '+' : '-'}₹{parseFloat(t.amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingTransaction(t)}
                        className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-zinc-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setDeletingTransaction(t)}
                        className="p-1.5 hover:bg-rose-500/10 rounded-md text-zinc-400 hover:text-rose-500 transition-colors"
                      >
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

      <div className="flex justify-center pt-8">
        <button 
          onClick={handleClearAll}
          className="group flex items-center gap-2 text-zinc-600 hover:text-rose-500 transition-colors py-2 px-4 rounded-lg hover:bg-rose-500/5"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Wipe all financial data</span>
        </button>
      </div>

      {/* Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Edit Transaction</h3>
              <button onClick={() => setEditingTransaction(null)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
                  <input name="amount" type="number" defaultValue={editingTransaction.amount} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Date</label>
                <input name="date" type="date" defaultValue={format(new Date(editingTransaction.date), 'yyyy-MM-dd')} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Note</label>
                <input name="note" defaultValue={editingTransaction.note} placeholder="Optional" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-zinc-100 text-zinc-950 py-3 rounded-xl text-sm font-bold hover:bg-white transition-all transform active:scale-[0.98] shadow-lg shadow-white/5">
                {loading ? 'Updating...' : 'Update Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTransaction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Confirm Delete</h3>
                <p className="text-xs text-zinc-400 mt-2">
                  Are you sure you want to delete this transaction of <span className="text-rose-400 font-bold">₹{parseFloat(deletingTransaction.amount).toLocaleString()}</span>? This action will revert the account balance.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button 
                  onClick={() => setDeletingTransaction(null)}
                  className="flex-1 bg-zinc-800 text-zinc-300 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
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

export default History;
