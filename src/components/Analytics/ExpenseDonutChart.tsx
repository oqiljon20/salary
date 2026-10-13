import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategoryExpenseAnalytics } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { PieChart as PieIcon } from 'lucide-react';

interface ExpenseDonutChartProps {
  data: CategoryExpenseAnalytics[];
  isLoading?: boolean;
}

export function ExpenseDonutChart({ data, isLoading }: ExpenseDonutChartProps) {
  const totalAmount = data.reduce((acc, curr) => acc + curr.total, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Расходы по категориям</CardTitle>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0 || totalAmount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-800">
            Расходы по категориям
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <PieIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-600">Нет данных о расходах за выбранный период</p>
          <p className="text-xs text-slate-400 mt-1">Добавьте новую операцию расхода, чтобы увидеть статистику</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: item.total,
    color: item.color,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(1) : '0';
      return (
        <div className="bg-slate-900 text-white text-xs py-2 px-3 rounded-xl shadow-lg border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.payload.color }}
            />
            <span className="font-semibold">{item.name}</span>
          </div>
          <div className="text-slate-300">
            {formatCurrency(item.value)} ({percent}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-800">
            Расходы по категориям
          </CardTitle>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            Всего: {formatCurrency(totalAmount)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart */}
          <div className="md:col-span-5 h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-medium text-slate-400">Итого</span>
              <span className="text-sm font-bold text-slate-800">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="md:col-span-7 space-y-3 max-h-72 overflow-y-auto pr-2">
            {data.map((item) => {
              const percent = totalAmount > 0 ? (item.total / totalAmount) * 100 : 0;
              return (
                <div key={item.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-slate-700 text-xs sm:text-sm">
                        {item.categoryName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {formatCurrency(item.total)}
                      </span>
                      <span className="text-xs text-slate-400 w-12 text-right">
                        {percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
