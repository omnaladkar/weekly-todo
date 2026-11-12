import { cn } from '../utils/cn.js';

const STYLES = {
  low: {
    wrap: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
    label: 'Low',
  },
  medium: {
    wrap: 'bg-amber-50 text-amber-700 ring-amber-100',
    dot: 'bg-amber-500',
    label: 'Medium',
  },
  high: {
    wrap: 'bg-rose-50 text-rose-700 ring-rose-100',
    dot: 'bg-rose-500',
    label: 'High',
  },
};

export function PriorityBadge({ priority = 'medium', className }) {
  const style = STYLES[priority] || STYLES.medium;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1',
        style.wrap,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {style.label}
    </span>
  );
}
