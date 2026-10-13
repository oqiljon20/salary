import React, { useState } from 'react';
import { PeriodKey, PeriodOption, CreateTransactionInput } from './types';
import { getCurrentMonthRange, getPreviousMonthRange } from './lib/utils';
import {
  useCategories,
  useTransactions,
  useSummary,
  useExpensesByCategory,
  useCreateTransaction,
  useDeleteTransaction,
} from './hooks/useFinanceData';

import { SummaryCards } from './components/Analytics/SummaryCards';
import { ExpenseDonutChart } from './components/Analytics/ExpenseDonutChart';
import { IncomeExpenseBar } from './components/Analytics/IncomeExpenseBar';
import { TransactionList } from './components/Transactions/TransactionList';
import { TransactionForm } from './components/Transactions/TransactionForm';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';

import {
  Plus,
  Calendar,
  Layers,
  PieChart as ChartIcon,
  CreditCard,
  Filter,
} from 'lucide-react';

export default function App() {
  const [period, setPeriod] = useState<PeriodKey>('current_month');
  const [activeTab, setActiveTab] = useState<'transactions' | 'analytics'>('transactions');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Period ranges
  const periodRanges: Record<PeriodKey, { from?: string; to?: string }> = {
    current_month: getCurrentMonthRange(),
    prev_month: getPreviousMonthRange(),
    all: { from: undefined, to: undefined },
  };

  const currentRange = periodRanges[period];

  // Queries
  const { data: categories = [] } = useCategories();
  const {
    data: transactions = [],
    isLoading: isTxLoading,
  } = useTransactions({
    from: currentRange.from,
    to: currentRange.to,
    type: typeFilter === 'all' ? undefined : typeFilter,
    categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
  });

  const { data: summary, isLoading: isSummaryLoading } = useSummary(
    currentRange.from,
    currentRange.to
  );

  const { data: expensesByCategory = [], isLoading: isExpensesLoading } = useExpensesByCategory(
    currentRange.from,
    currentRange.to,
    'expense'
  );

  // Mutations
  const createTxMutation = useCreateTransaction();
  const deleteTxMutation = useDeleteTransaction();

  const handleCreateTransaction = async (data: CreateTransactionInput) => {
    try {
      await createTxMutation.mutateAsync(data);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to create transaction', err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту операцию?')) {
      try {
        setDeletingId(id);
        await deleteTxMutation.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete transaction', err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const periodOptions: PeriodOption[] = [
    { key: 'current_month', label: 'Текущий месяц' },
    { key: 'prev_month', label: 'Прошлый месяц' },
    { key: 'all', label: 'Все время' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Finance Tracker
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Учет личных финансов и расходов
              </p>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl">
            {periodOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setPeriod(opt.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  period === opt.key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* 1. Summary Cards */}
        <section>
          <SummaryCards summary={summary} isLoading={isSummaryLoading} />
        </section>

        {/* 2. Action Bar & Navigation */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-xs">
          {/* Tabs */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'transactions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Операции</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold ml-1">
                {transactions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ChartIcon className="w-4 h-4" />
              <span>Аналитика</span>
            </button>
          </div>

          {/* Quick Add Button */}
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="md"
            className="shadow-sm shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Новая операция</span>
          </Button>
        </section>

        {/* 3. Main Content Views */}
        {activeTab === 'transactions' ? (
          <section className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Фильтры:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Type Filter */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={`px-2.5 py-1 rounded-md ${
                      typeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500'
                    }`}
                  >
                    Все
                  </button>
                  <button
                    onClick={() => setTypeFilter('expense')}
                    className={`px-2.5 py-1 rounded-md ${
                      typeFilter === 'expense' ? 'bg-white text-rose-600 shadow-2xs font-semibold' : 'text-slate-500'
                    }`}
                  >
                    Расходы
                  </button>
                  <button
                    onClick={() => setTypeFilter('income')}
                    className={`px-2.5 py-1 rounded-md ${
                      typeFilter === 'income' ? 'bg-white text-emerald-600 shadow-2xs font-semibold' : 'text-slate-500'
                    }`}
                  >
                    Доходы
                  </button>
                </div>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-100 border-none text-xs font-medium text-slate-700 py-1.5 px-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">Все категории</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.type === 'income' ? '🟢' : '🔴'} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transactions List */}
            <TransactionList
              transactions={transactions}
              onDelete={handleDeleteTransaction}
              isLoading={isTxLoading}
              deletingId={deletingId}
            />
          </section>
        ) : (
          <section className="space-y-6">
            {/* Income vs Expense comparison */}
            <IncomeExpenseBar
              income={summary?.totalIncome ?? 0}
              expense={summary?.totalExpense ?? 0}
            />

            {/* Expense Donut Chart with Category Breakdown */}
            <ExpenseDonutChart
              data={expensesByCategory}
              isLoading={isExpensesLoading}
            />
          </section>
        )}
      </main>

      {/* Modal "Добавить операцию" */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Новая операция"
        description="Зафиксируйте расход или доход в системе"
      >
        <TransactionForm
          categories={categories}
          onSubmit={handleCreateTransaction}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={createTxMutation.isPending}
        />
      </Modal>
    </div>
  );
}
