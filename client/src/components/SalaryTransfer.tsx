import React, { useState } from 'react';
import { Account, api, Transaction } from '../api';
import { format } from 'date-fns';
import { ArrowUpCircle, Heart, ArrowRightLeft, CreditCard, Calendar, Trash2, Edit2, X, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Props {
  accounts: Account[];
  transactions: Transaction[];
  onRefresh: () => void;
}

const SalaryTransfer: React.FC<Props> = ({ accounts, transactions, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('salary');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (type: string, data: any) => {
    setLoading(true);
    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, {
          ...data,
          type,
          date: data.date || new Date(),
        });
        showToast('Transaction updated!', 'success');
        setEditingTransaction(null);
      } else {
        await api.post('/transactions', {
          ...data,
          type,
          date: data.date || new Date(),
        });
        showToast('Transaction successful!', 'success');
      }
      onRefresh();
    } catch (err) {
      console.error(err);
      showToast('Error saving transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    setLoading(true);
    try {
      await api.delete(`/transactions/${deletingTransaction.id}`);
      showToast('Transaction deleted', 'success');
      setDeletingTransaction(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      showToast('Error deleting transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    ['salary', 'self_transfer', 'transfer', 'emi'].includes(t.type)
  ).slice(0, 10);

  const subTabs = [
    { id: 'salary', label: 'Salary', icon: '💰' },
    { id: 'self_transfer', label: 'Self Transfer', icon: '🔄' },
    { id: 'transfer_maa', label: 'To Maa', icon: '👩' },
    { id: 'emi', label: 'EMI', icon: '📋' },
  ];

  return (
    <div className="space-y-8">
      {/* Sub Navigation */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === tab.id 
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-lg' 
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Form Container */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl shadow-sm">
          {activeSubTab === 'salary' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <span className="text-amber-500 text-lg">💰</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">Add salary</h3>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSubmit('salary', {
                  amount: formData.get('amount'),
                  destination_account_id: formData.get('dest'),
                  note: formData.get('note'),
                  category: 'Salary',
                  date: formData.get('date') ? new Date(formData.get('date') as string) : new Date()
                });
                e.currentTarget.reset();
              }} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
                      <input name="amount" type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Date</label>
                    <input name="date" type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" defaultValue={format(new Date(), 'yyyy-MM-dd')} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Credited to bank</label>
                    <select name="dest" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 appearance-none" required>
                    {accounts
                      .filter(a => a.name && !a.name.toLowerCase().includes('maa'))
                      .map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name.toLowerCase().includes('bank') ? acc.name : `${acc.name} Bank`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Note</label>
                    <input name="note" placeholder="Optional" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-zinc-800 border border-zinc-700 py-3 rounded-xl text-sm font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all transform active:scale-[0.98] shadow-lg">
                  Add Salary ↗
                </button>
              </form>
            </div>
          )}

          {activeSubTab === 'self_transfer' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-sky-500/10 rounded-lg">
                  <span className="text-sky-500 text-lg">🔄</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">Self transfer (bank to bank)</h3>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSubmit('self_transfer', {
                  amount: formData.get('amount'),
                  source_account_id: formData.get('from'),
                  destination_account_id: formData.get('to'),
                  note: formData.get('note'),
                  category: 'Self Transfer',
                  date: formData.get('date') ? new Date(formData.get('date') as string) : new Date()
                });
                e.currentTarget.reset();
              }} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
                      <input name="amount" type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Date</label>
                    <input name="date" type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" defaultValue={format(new Date(), 'yyyy-MM-dd')} required />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-full space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">From bank</label>
                    <select name="from" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 appearance-none" required>
                    {accounts
                      .filter(a => a.name && !a.name.toLowerCase().includes('maa'))
                      .map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name.toLowerCase().includes('bank') ? acc.name : `${acc.name} Bank`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-zinc-600 mt-5 hidden md:block">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div className="w-full space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">To bank</label>
                    <select name="to" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 appearance-none" required>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name || `Account #${acc.id}`}
                      </option>
                    ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Note</label>
                  <input name="note" placeholder="Optional" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-zinc-800 border border-zinc-700 py-3 rounded-xl text-sm font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all transform active:scale-[0.98] shadow-lg">
                  Transfer ↗
                </button>
              </form>
            </div>
          )}

          {activeSubTab === 'transfer_maa' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-rose-500/10 rounded-lg">
                  <span className="text-rose-500 text-lg">👩</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">Transfer to Maa</h3>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSubmit('transfer', {
                  amount: formData.get('amount'),
                  source_account_id: formData.get('from'),
                  destination_account_id: formData.get('to'),
                  note: formData.get('note'),
                  category: 'To Maa',
                  date: formData.get('date') ? new Date(formData.get('date') as string) : new Date()
                });
                e.currentTarget.reset();
              }} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
                      <input name="amount" type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Date</label>
                    <input name="date" type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" defaultValue={format(new Date(), 'yyyy-MM-dd')} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">From bank</label>
                    <select name="from" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 appearance-none" required>
                      {accounts
                        .filter(a => a.name && !a.name.toLowerCase().includes('maa'))
                        .map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name.toLowerCase().includes('bank') ? acc.name : `${acc.name} Bank`}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">To Maa Account</label>
                    <select name="to" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 appearance-none" required>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name || `Account #${acc.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Note</label>
                  <input name="note" placeholder="Optional" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-zinc-800 border border-zinc-700 py-3 rounded-xl text-sm font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all transform active:scale-[0.98] shadow-lg">
                  Transfer to Maa ↗
                </button>
              </form>
            </div>
          )}

          {activeSubTab === 'emi' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <span className="text-orange-500 text-lg">📋</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">Pay EMI</h3>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSubmit('emi', {
                  amount: formData.get('amount'),
                  source_account_id: formData.get('from'),
                  note: formData.get('note'),
                  category: 'EMI Payment',
                  date: formData.get('date') ? new Date(formData.get('date') as string) : new Date()
                });
                e.currentTarget.reset();
              }} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
                      <input name="amount" type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Date</label>
                    <input name="date" type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" defaultValue={format(new Date(), 'yyyy-MM-dd')} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">From bank</label>
                  <select name="from" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 appearance-none" required>
                    {accounts
                      .filter(a => a.name && !a.name.toLowerCase().includes('maa'))
                      .map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name.toLowerCase().includes('bank') ? acc.name : `${acc.name} Bank`}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Note</label>
                  <input name="note" placeholder="Optional" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-zinc-800 border border-zinc-700 py-3 rounded-xl text-sm font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all transform active:scale-[0.98] shadow-lg">
                  Pay EMI ↗
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Recent Salary & Transfers List */}
      <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-zinc-800 rounded-lg">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">Recent Salary & Transfers</h3>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="py-10 text-center opacity-30">
            <p className="text-xs font-medium text-zinc-500">No transactions recorded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTransactions.map(t => (
              <div key={t.id} className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-4 flex items-center justify-between hover:border-zinc-800 transition-all group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    t.type === 'salary' ? 'bg-amber-500/10 text-amber-500' :
                    t.type === 'emi' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-sky-500/10 text-sky-500'
                  }`}>
                    {t.type === 'salary' ? '💰' : t.type === 'emi' ? '📄' : '🔄'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-200">{t.category || t.type.replace('_', ' ')}</p>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {format(new Date(t.date), 'dd MMM yyyy')} • {
                        t.type === 'salary' ? `Credited to ${t.destinationAccount?.name}` :
                        t.type === 'transfer' || t.type === 'self_transfer' ? `${t.sourceAccount?.name} ➔ ${t.destinationAccount?.name}` :
                        t.sourceAccount?.name || t.destinationAccount?.name
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-sm font-black ${t.type === 'salary' ? 'text-emerald-400' : 'text-zinc-100'}`}>
                      {t.type === 'salary' ? '+' : '-'}₹{parseFloat(t.amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 transition-opacity">
                    <button 
                      onClick={() => setEditingTransaction(t)}
                      className="p-1.5 hover:bg-zinc-800 rounded-md text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setDeletingTransaction(t)}
                      className="p-1.5 hover:bg-red-500/10 rounded-md text-red-500 transition-colors"
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
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSubmit(editingTransaction.type, {
                amount: formData.get('amount'),
                note: formData.get('note'),
                date: formData.get('date') ? new Date(formData.get('date') as string) : new Date(),
                source_account_id: editingTransaction.source_account_id,
                destination_account_id: editingTransaction.destination_account_id,
                category: editingTransaction.category
              });
            }} className="space-y-5">
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
                Update Transaction
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
                  Are you sure you want to delete this transaction of <span className="text-rose-400 font-bold">₹{parseFloat(deletingTransaction.amount).toLocaleString()}</span>? This action cannot be undone.
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

export default SalaryTransfer;
