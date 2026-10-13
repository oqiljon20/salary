import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { AnalyticsSummary } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface SummaryCardsProps {
  summary?: AnalyticsSummary;
  isLoading?: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const netBalance = summary?.netBalance ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Balance Card */}
      <Card className="border-slate-100/80 bg-white shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Текущий баланс
            </p>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isLoading ? (
                <div className="h-8 w-32 bg-slate-200 animate-pulse rounded-lg" />
              ) : (
                <span className={netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}>
                  {formatCurrency(netBalance)}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Доходы за вычетом расходов</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>

      {/* Income Card */}
      <Card className="border-slate-100/80 bg-white shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Доход за период
            </p>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {isLoading ? (
                <div className="h-8 w-32 bg-slate-200 animate-pulse rounded-lg" />
              ) : (
                formatCurrency(totalIncome)
              )}
            </div>
            <p className="text-xs text-emerald-600/80 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 inline" /> Поступления
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>

      {/* Expense Card */}
      <Card className="border-slate-100/80 bg-white shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-red-500" />
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Расход за период
            </p>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
              {isLoading ? (
                <div className="h-8 w-32 bg-slate-200 animate-pulse rounded-lg" />
              ) : (
                formatCurrency(totalExpense)
              )}
            </div>
            <p className="text-xs text-rose-600/80 font-medium mt-1 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 inline" /> Траты
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
