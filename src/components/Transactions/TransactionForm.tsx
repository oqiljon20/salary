import React, { useState, useEffect } from 'react';
import { TransactionType, CreateTransactionInput, Category } from '../../types';
import { CategorySelect } from '../Categories/CategorySelect';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { getTodayString } from '../../lib/utils';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface TransactionFormProps {
  categories: Category[];
  onSubmit: (data: CreateTransactionInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TransactionForm({
  categories,
  onSubmit,
  onCancel,
  isLoading,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayString());
  const [note, setNote] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter categories by selected type
  const filteredCategories = categories.filter((c) => c.type === type);

  // Automatically select first category if current selection doesn't match
  useEffect(() => {
    if (filteredCategories.length > 0) {
      const exists = filteredCategories.some((c) => c.id === categoryId);
      if (!exists) {
        setCategoryId(filteredCategories[0].id);
      }
    } else {
      setCategoryId('');
    }
  }, [type, filteredCategories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const parsedAmount = parseFloat(amount.replace(',', '.'));

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Введите корректную сумму больше 0';
    }

    if (!categoryId) {
      newErrors.categoryId = 'Выберите категорию';
    }

    if (!date) {
      newErrors.date = 'Выберите дату операции';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSubmit({
      amount: parsedAmount,
      type,
      categoryId,
      date,
      note: note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type Toggle: Расход / Доход */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all select-none ${
            type === 'expense'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" />
          <span>Расход</span>
        </button>

        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all select-none ${
            type === 'income'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpCircle className="w-4 h-4" />
          <span>Доход</span>
        </button>
      </div>

      {/* Amount (Big numeric input) */}
      <div className="space-y-1.5 text-center sm:text-left">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Сумма операции
        </label>
        <div className="relative flex items-center">
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            autoFocus
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
            }}
            className={`w-full rounded-2xl border bg-slate-50/50 py-3 px-4 pr-12 text-2xl sm:text-3xl font-extrabold transition-all placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-4 ${
              type === 'expense'
                ? 'text-rose-600 border-slate-200 focus:border-rose-500 focus:ring-rose-500/10'
                : 'text-emerald-600 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
            } ${errors.amount ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`}
          />
          <span className="absolute right-4 text-xl sm:text-2xl font-bold text-slate-400 select-none">
            ₽
          </span>
        </div>
        {errors.amount && <p className="text-xs font-medium text-rose-500 mt-1">{errors.amount}</p>}
      </div>

      {/* Category selection */}
      <CategorySelect
        categories={filteredCategories}
        selectedId={categoryId}
        onSelect={(id) => {
          setCategoryId(id);
          if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: '' }));
        }}
        error={errors.categoryId}
      />

      {/* Date */}
      <Input
        label="Дата"
        type="date"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
        }}
        error={errors.date}
      />

      {/* Note / Comment */}
      <Input
        label="Комментарий (необязательно)"
        placeholder="Например: Покупка продуктов на неделю"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={200}
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          variant={type === 'expense' ? 'danger' : 'primary'}
          className="flex-1"
          isLoading={isLoading}
        >
          Добавить
        </Button>
      </div>
    </form>
  );
}
