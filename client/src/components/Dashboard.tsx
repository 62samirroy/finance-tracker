import React, { useState } from 'react';
import { Account, Transaction, Budget, api } from '../api';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Banknote } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  budget: Budget | null;
  onRefresh: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions = [], budget, onRefresh }) => {
  const currentMonth = format(new Date(), 'yyyy-MM');
  
  // Ensure transactions is always an array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const currentMonthStr = format(new Date(), 'yyyy-MM');
  const monthTransactions = safeTransactions.filter(t => t.date && t.date.substring(0, 7) === currentMonthStr);
  
  const salaryReceived = monthTransactions
    .filter(t => t.type?.toLowerCase().includes('salary') || t.category?.toLowerCase().includes('salary'))
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    
  const emiPaid = monthTransactions
    .filter(t => t.type?.toLowerCase().includes('emi') || t.category?.toLowerCase().includes('emi'))
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    
  const transferredToMaa = monthTransactions
    .filter(t => 
      (t.type?.toLowerCase() === 'transfer' || t.type?.toLowerCase() === 'expense') && 
      (t.destinationAccount?.name?.toLowerCase().includes('maa') || t.category?.toLowerCase().includes('maa'))
    )
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    
  const handExpenses = monthTransactions
    .filter(t => {
      const type = t.type?.toLowerCase();
      const isMaa = t.destinationAccount?.name?.toLowerCase().includes('maa') || t.category?.toLowerCase().includes('maa');
      // Hand expenses are all outgoing transactions that are NOT salary, NOT EMI, NOT self-transfer, and NOT to Maa
      return (type === 'expense') && 
             type !== 'salary' && 
             type !== 'emi' && 
             type !== 'self_transfer' && 
             !isMaa;
    })
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const maaSavingsTotal = accounts.find(a => a.name.toLowerCase().includes('maa'))?.balance || 0;
  
  const budgetAmountNum = budget ? parseFloat(budget.amount) : 0;
  const pocketLeft = budget ? budgetAmountNum - handExpenses : 0;

  return (
    <div className="space-y-6">
      {/* Top Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[10px] text-zinc-500 font-medium uppercase mb-1">This month salary</p>
          <p className="text-xl font-bold text-sky-400">₹{salaryReceived.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[10px] text-zinc-500 font-medium uppercase mb-1">Maa's savings total</p>
          <p className="text-xl font-bold text-emerald-500/90">₹{parseFloat(maaSavingsTotal as string).toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[10px] text-zinc-500 font-medium uppercase mb-1">Pocket left</p>
          <p className="text-xl font-bold text-zinc-200">{budget ? `₹${pocketLeft.toLocaleString()}` : 'Not set'}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[10px] text-zinc-500 font-medium uppercase mb-1">EMI paid</p>
          <p className="text-xl font-bold text-rose-500">₹{emiPaid.toLocaleString()}</p>
        </div>
      </div>

      {/* Account Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl hover:border-zinc-700 transition-colors cursor-default">
            <p className="text-[10px] text-zinc-500 font-medium uppercase mb-1">{acc.name}</p>
            <p className={`text-xl font-bold ${acc.name.toLowerCase().includes('maa') ? 'text-emerald-500/90' : 'text-zinc-200'}`}>
              ₹{parseFloat(acc.balance).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly Summary Section */}
      <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
        <h3 className="text-sm font-semibold text-zinc-200 mb-6">Monthly summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
            <span className="text-sm text-zinc-400">Salary received</span>
            <span className="text-sm font-medium text-emerald-400">₹{salaryReceived.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
            <span className="text-sm text-zinc-400">EMI paid (to friend)</span>
            <span className="text-sm font-medium text-rose-400">-₹{emiPaid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
            <span className="text-sm text-zinc-400">Transferred to Maa</span>
            <span className="text-sm font-medium text-rose-400">-₹{transferredToMaa.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
            <span className="text-sm text-zinc-400">Hand expenses</span>
            <span className="text-sm font-medium text-rose-400">-₹{handExpenses.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-bold text-zinc-200">Balance in hand</span>
            <span className="text-base font-bold text-emerald-400">₹{(salaryReceived - emiPaid - transferredToMaa - handExpenses).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
