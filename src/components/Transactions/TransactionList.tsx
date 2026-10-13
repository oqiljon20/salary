import React from 'react';
import { Transaction } from '../../types';
import { TransactionItem } from './TransactionItem';
import { formatGroupDate, formatCurrency } from '../../lib/utils';
import { Receipt, Inbox } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
  deletingId?: string | null;
}

export function TransactionList({
  transactions,
  onDelete,
  isLoading,
  deletingId,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="h-5 w-20 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <Inbox className="w-7 h-7" />
        </div>
        <h4 className="text-base font-semibold text-slate-800">Операций пока нет</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Добавьте первую операцию кнопкой «+ Новая операция»
        </p>
      </div>
    );
  }

  // Group transactions by date
  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    if (!acc[tx.date]) {
      acc[tx.date] = [];
    }
    acc[tx.date].push(tx);
    return acc;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => {
        const txList = grouped[date];
        const dayTotal = txList.reduce((acc, tx) => {
          return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
        }, 0);

        return (
          <div key={date} className="space-y-2.5">
            {/* Date Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {formatGroupDate(date)}
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">({date})</span>
              </div>
              <span
                className={`text-xs font-semibold ${
                  dayTotal >= 0 ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {dayTotal > 0 ? `+${formatCurrency(dayTotal)}` : formatCurrency(dayTotal)}
              </span>
            </div>

            {/* Transaction Items */}
            <div className="space-y-2">
              {txList.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onDelete={onDelete}
                  isDeleting={deletingId === tx.id}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
