import React from 'react';
import { CategoryIcon } from './CategoryIcon';
import { cn } from '../../lib/utils';

interface CategoryBadgeProps {
  name: string;
  icon?: string;
  color?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function CategoryBadge({
  name,
  icon = 'Tag',
  color = '#6B7280',
  className,
  size = 'md',
}: CategoryBadgeProps) {
  const isSmall = size === 'sm';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors',
        isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className
      )}
      style={{
        backgroundColor: `${color}18`, // 10% opacity
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      <CategoryIcon name={icon} className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{name}</span>
    </span>
  );
}
