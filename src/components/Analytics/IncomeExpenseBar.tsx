import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';

interface IncomeExpenseBarProps {
  income: number;
  expense: number;
}

export function IncomeExpenseBar({ income, expense }: IncomeExpenseBarProps) {
  const total = income + expense;
  const incomePercent = total > 0 ? (income / total) * 100 : 50;
  const expensePercent = total > 0 ? (expense / total) * 100 : 50;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-800">
          Соотношение доходов и расходов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-emerald-600">
            Доходы: {formatCurrency(income)} ({total > 0 ? incomePercent.toFixed(1) : 0}%)
          </span>
          <span className="text-rose-600">
            Расходы: {formatCurrency(expense)} ({total > 0 ? expensePercent.toFixed(1) : 0}%)
          </span>
        </div>

        {/* Dual progress bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${total > 0 ? incomePercent : 0}%` }}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-500"
            style={{ width: `${total > 0 ? expensePercent : 0}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400">
          <span>{total > 0 ? 'Баланс распределения' : 'Нет операций'}</span>
          <span>Всего оборот: {formatCurrency(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
