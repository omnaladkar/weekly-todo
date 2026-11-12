import { ChevronDown, Plus } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { TaskItem } from './TaskItem.jsx';

export function WeekCard({
  week,
  expanded,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  onToggleTask,
}) {
  const progress = week.total
    ? Math.round((week.completed / week.total) * 100)
    : 0;

  return (
    <section
      className={cn(
        'overflow-hidden rounded-[26px] bg-white shadow-card ring-1 transition-all',
        expanded ? 'ring-primary/25' : 'ring-line/70'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full px-5 pb-4 pt-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                {week.label}
              </span>
              {week.isCurrent ? (
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-primary">
                  Now
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[15px] font-extrabold tracking-tight text-ink">
              {week.range}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-canvas px-2.5 py-1 text-[11px] font-bold text-muted">
              {week.total} {week.total === 1 ? 'task' : 'tasks'}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted transition-transform duration-200',
                expanded && 'rotate-180 text-primary'
              )}
            />
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="flex items-center gap-3 text-[11px] font-semibold text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-ink">{week.open}</span> open
            </span>
            <span className="h-1 w-1 rounded-full bg-line" />
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-ink">{week.completed}</span> done
            </span>
          </div>
          <span className="text-[11px] font-bold text-muted">{progress}%</span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-[#A085FF] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </button>

      {expanded ? (
        <div className="animate-fade-in border-t border-line/70 px-3.5 pb-3.5 pt-3">
          {week.tasks.length ? (
            <div className="space-y-2">
              {week.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-canvas/60 px-4 py-7 text-center">
              <p className="text-sm font-semibold text-ink">Nothing here yet</p>
              <p className="mt-1 text-xs text-muted">
                Plan something for {week.range}.
              </p>
              <button
                type="button"
                onClick={() => onAdd(week.isCurrent ? null : week.start)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary-soft px-3 py-2 text-xs font-bold text-primary transition active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                Add a task
              </button>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
