import React, { useState } from 'react';
import { Account, api } from '../api';
import { Edit2, Check, X, CreditCard } from 'lucide-react';

import { useToast } from '../context/ToastContext';

interface Props {
  accounts: Account[];
  onRefresh: () => void;
}

const AccountManager: React.FC<Props> = ({ accounts, onRefresh }) => {
  const { showToast } = useToast();
  const [balances, setBalances] = useState<Record<number, string>>(
    accounts.reduce((acc, a) => ({ ...acc, [a.id]: a.balance }), {})
  );

  const handleUpdate = async (id: number) => {
    try {
      await api.put(`/accounts/${id}`, { balance: balances[id] });
      onRefresh();
      showToast('Balance updated!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error updating balance', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Account Balance Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-zinc-900/30 border border-zinc-800 p-5 rounded-2xl shadow-sm hover:border-zinc-700 transition-all group">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${acc.name.includes('Maa') ? 'bg-emerald-500' : 'bg-sky-500'}`}></div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{acc.name}</p>
            </div>
            <p className={`text-2xl font-bold ${acc.name.includes('Maa') ? 'text-emerald-500' : 'text-zinc-100'}`}>
              ₹{parseFloat(acc.balance).toLocaleString()}
            </p>
            <p className="text-[9px] text-zinc-600 mt-1 uppercase font-medium">Current Balance</p>
          </div>
        ))}
      </div>

      {/* Manual Update Form */}
      <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-zinc-800 rounded-xl">
            <CreditCard className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">Adjust balances</h3>
            <p className="text-xs text-zinc-500">Correct any discrepancies manually</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {accounts.map(acc => (
            <div key={acc.id} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_100px] items-center gap-4 group">
              <span className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors">{acc.name}</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
                <input 
                  type="number" 
                  value={balances[acc.id] || ''} 
                  onChange={e => setBalances({ ...balances, [acc.id]: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors font-mono"
                  placeholder="0.00"
                />
              </div>
              <button 
                onClick={() => handleUpdate(acc.id)}
                className="bg-zinc-100 text-zinc-950 py-2.5 rounded-xl text-xs font-bold hover:bg-white transition-all transform active:scale-95 shadow-lg shadow-black/20"
              >
                Update
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountManager;
