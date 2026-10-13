import React from 'react';
import { Transaction } from '../../types';
import { CategoryIcon } from '../Categories/CategoryIcon';
import { formatCurrency } from '../../lib/utils';
import { Trash2 } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function TransactionItem({ transaction, onDelete, isDeleting }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';

  return (
    <div className="group flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-100 transition-all">
      {/* Category Icon & Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
          style={{
            backgroundColor: `${transaction.categoryColor}15`,
            color: transaction.categoryColor,
          }}
        >
          <CategoryIcon name={transaction.categoryIcon} className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm truncate">
              {transaction.categoryName}
            </span>
          </div>
          {transaction.note && (
            <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
              {transaction.note}
            </p>
          )}
        </div>
      </div>

      {/* Amount & Delete Action */}
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <div className="text-right">
          <span
            className={`font-bold text-sm sm:text-base ${
              isIncome ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(transaction.amount, { showSign: true, type: transaction.type })}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onDelete(transaction.id)}
          disabled={isDeleting}
          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100 disabled:opacity-30"
          title="Удалить операцию"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
