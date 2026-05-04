import React, { useState } from 'react';
import { api, LentMoney, Account } from '../api';
import { format } from 'date-fns';
import { useToast } from '../context/ToastContext';
import { Trash2, Edit2, X, AlertTriangle, User, Calendar, DollarSign, CheckCircle2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface Props {
  lentRecords: LentMoney[];
  accounts: Account[];
  onRefresh: () => void;
}

const LentMoneyManager: React.FC<Props> = ({ lentRecords, accounts, onRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState<'lent' | 'borrowed'>('lent');
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LentMoney | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<LentMoney | null>(null);
  const [settlingRecord, setSettlingRecord] = useState<LentMoney | null>(null);
  const { showToast } = useToast();

  const filteredRecords = lentRecords.filter(r => r.type === activeSubTab);
  const pendingRecords = filteredRecords.filter(r => r.status === 'pending');
  const totalPending = pendingRecords.reduce((acc, r) => acc + parseFloat(r.amount), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      person_name: formData.get('person_name'),
      amount: formData.get('amount'),
      type: formData.get('type'),
      date: formData.get('date'),
      note: formData.get('note'),
      status: 'pending'
    };

    try {
      if (editingRecord) {
        await api.put(`/lent-money/${editingRecord.id}`, data);
        showToast('Record updated!', 'success');
        setEditingRecord(null);
      } else {
        await api.post('/lent-money', data);
        showToast(`${data.type === 'lent' ? 'Loan' : 'Debt'} record saved!`, 'success');
      }
      onRefresh();
      if (!editingRecord) (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      showToast('Error saving record', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSettleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingRecord || loading) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const accountId = formData.get('accountId');

    try {
      if (settlingRecord.type === 'lent') {
        // I lent money -> now I receive it back (Income)
        await api.post('/transactions', {
          amount: settlingRecord.amount,
          type: 'received_money',
          category: 'Loan Return',
          destination_account_id: accountId || null,
          note: `Received back from ${settlingRecord.person_name}`,
          date: new Date(),
        });
      } else {
        // I borrowed money -> now I pay it back (Expense)
        await api.post('/transactions', {
          amount: settlingRecord.amount,
          type: 'expense',
          category: 'Debt Payment',
          source_account_id: accountId || null,
          note: `Paid back to ${settlingRecord.person_name}`,
          date: new Date(),
        });
      }

      // Update status to repaid
      await api.put(`/lent-money/${settlingRecord.id}`, {
        status: 'repaid',
        repaid_date: format(new Date(), 'yyyy-MM-dd')
      });

      showToast(`Record marked as settled!`, 'success');
      setSettlingRecord(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      showToast('Error settling record', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRecord || loading) return;
    setLoading(true);
    try {
      await api.delete(`/lent-money/${deletingRecord.id}`);
      showToast('Record deleted', 'success');
      setDeletingRecord(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      showToast('Error deleting record', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs Switcher */}
      <div className="flex gap-2 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveSubTab('lent')}
          className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'lent' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          Money I Lent
        </button>
        <button
          onClick={() => setActiveSubTab('borrowed')}
          className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'borrowed' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          Money I Borrowed
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`bg-zinc-900/30 border p-6 rounded-2xl shadow-sm md:col-span-1 ${activeSubTab === 'lent' ? 'border-amber-500/20' : 'border-rose-500/20'}`}>
          <div className="flex flex-col space-y-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              {activeSubTab === 'lent' ? 'Total to Collect' : 'Total to Pay back'}
            </span>
            <span className={`text-3xl font-black ${activeSubTab === 'lent' ? 'text-amber-500' : 'text-rose-500'}`}>
              ₹{totalPending.toLocaleString()}
            </span>
            <p className="text-[10px] text-zinc-600">Across {pendingRecords.length} records</p>
          </div>
        </div>
        <div className="md:col-span-2 bg-zinc-900/10 border border-zinc-800/50 p-6 rounded-2xl flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeSubTab === 'lent' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
            {activeSubTab === 'lent' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-200">
              {activeSubTab === 'lent' ? 'Money given to others' : 'Money taken from others'}
            </h4>
            <p className="text-xs text-zinc-500 mt-1">
              {activeSubTab === 'lent' 
                ? 'Keep track of people who owe you money. Mark as repaid when they return it.' 
                : 'Keep track of money you need to return to others. Mark as paid when you return it.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Form */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-200 mb-6 flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${activeSubTab === 'lent' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {activeSubTab === 'lent' ? '📤' : '📥'}
            </span>
            {editingRecord ? 'Edit record' : (activeSubTab === 'lent' ? 'Lend money' : 'Record a debt')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="type" value={activeSubTab} />
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Person Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input name="person_name" defaultValue={editingRecord?.person_name} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" placeholder={activeSubTab === 'lent' ? 'Who borrowed?' : 'Who did you borrow from?'} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
                  <input name="amount" type="number" defaultValue={editingRecord?.amount} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Date</label>
                <input name="date" type="date" defaultValue={editingRecord?.date || format(new Date(), 'yyyy-MM-dd')} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Note</label>
              <input name="note" defaultValue={editingRecord?.note} placeholder="Optional reason or detail" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors" />
            </div>
            <div className="flex gap-3">
              <button 
                type="submit" 
                disabled={loading} 
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all transform active:scale-[0.98] shadow-lg disabled:opacity-50 ${
                  activeSubTab === 'lent' ? 'bg-amber-500/90 text-zinc-950 hover:bg-amber-500' : 'bg-rose-500/90 text-white hover:bg-rose-500'
                }`}
              >
                {loading ? 'Saving...' : (editingRecord ? 'Update Record' : (activeSubTab === 'lent' ? 'Save Loan ↗' : 'Save Debt ↙'))}
              </button>
              {editingRecord && (
                <button type="button" onClick={() => setEditingRecord(null)} className="px-4 py-2.5 bg-zinc-800 text-zinc-400 rounded-lg text-sm font-bold hover:bg-zinc-700 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl min-h-[400px] flex flex-col">
          <h3 className="text-sm font-semibold text-zinc-200 mb-6 flex justify-between items-center">
            {activeSubTab === 'lent' ? 'Loan records' : 'Debt records'}
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Records: {filteredRecords.length}</span>
          </h3>
          {filteredRecords.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30 py-12">
              <div className="text-4xl mb-4">{activeSubTab === 'lent' ? '💸' : '🧾'}</div>
              <p className="text-xs font-medium text-zinc-500">No records found for this category</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 scrollbar-hide">
              {filteredRecords.map(r => (
                <div key={r.id} className={`bg-zinc-950/50 border border-zinc-900 rounded-xl p-4 flex items-center justify-between hover:border-zinc-800 transition-all group ${r.status === 'repaid' ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${r.status === 'repaid' ? 'bg-emerald-500/10 text-emerald-500' : (r.type === 'lent' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500')}`}>
                      {r.status === 'repaid' ? <CheckCircle2 className="w-5 h-5" /> : (r.type === 'lent' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                        {r.person_name}
                        {r.status === 'repaid' && <span className="text-[8px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">Settled</span>}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-medium">
                        {format(new Date(r.date), 'dd MMM yyyy')} • {r.note || 'No note'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-sm font-black ${r.status === 'repaid' ? 'text-emerald-500' : (r.type === 'lent' ? 'text-amber-500' : 'text-rose-500')}`}>
                        ₹{parseFloat(r.amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {r.status === 'pending' && (
                        <button 
                          onClick={() => setSettlingRecord(r)}
                          className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md hover:bg-emerald-500 hover:text-white transition-all transform active:scale-95 disabled:opacity-50"
                          title="Settle this record"
                          disabled={loading}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => setEditingRecord(r)} disabled={loading} className="p-1.5 hover:bg-zinc-800 rounded-md text-white transition-colors disabled:opacity-50">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeletingRecord(r)} disabled={loading} className="p-1.5 hover:bg-red-500/10 rounded-md text-red-500 transition-colors disabled:opacity-50">
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

      {/* Settle Modal */}
      {settlingRecord && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Settle Record</h3>
              <button onClick={() => setSettlingRecord(null)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-xs text-zinc-400">
                {settlingRecord.type === 'lent' ? 'Received back from:' : 'Paid back to:'}
              </p>
              <p className="text-sm font-bold text-zinc-100 mt-1">{settlingRecord.person_name} - ₹{parseFloat(settlingRecord.amount).toLocaleString()}</p>
            </div>
            <form onSubmit={handleSettleConfirm} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  {settlingRecord.type === 'lent' ? 'Deposit to' : 'Paid from'}
                </label>
                <select name="accountId" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 appearance-none" required>
                  <option value="">Choose Bank</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all transform active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                {loading ? 'Processing...' : 'Confirm Settlement ✅'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRecord && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Confirm Delete</h3>
                <p className="text-xs text-zinc-400 mt-2">
                  Are you sure you want to delete this {settlingRecord?.type} record? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button 
                  onClick={() => setDeletingRecord(null)}
                  className="flex-1 bg-zinc-800 text-zinc-300 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
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

export default LentMoneyManager;
