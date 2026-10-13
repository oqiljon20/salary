import React from 'react';
import { Category } from '../../types';
import { CategoryIcon } from './CategoryIcon';
import { cn } from '../../lib/utils';

interface CategorySelectProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
  error?: string;
}

export function CategorySelect({ categories, selectedId, onSelect, error }: CategorySelectProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        Нет доступных категорий
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        Категория
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
        {categories.map((cat) => {
          const isSelected = cat.id === selectedId;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all select-none',
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30 font-semibold'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300'
              )}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-1.5 transition-transform"
                style={{
                  backgroundColor: `${cat.color}20`,
                  color: cat.color,
                }}
              >
                <CategoryIcon name={cat.icon} className="w-5 h-5" />
              </div>
              <span className="text-xs truncate w-full">{cat.name}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}
