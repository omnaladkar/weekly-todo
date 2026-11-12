import { CalendarPlus, Plus } from 'lucide-react';

export function EmptyState({ onCreate }) {
  return (
    <div className="mt-6 flex flex-col items-center rounded-[28px] border border-dashed border-primary/25 bg-white/70 px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
        <CalendarPlus className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-lg font-extrabold text-ink">A clean slate</h2>
      <p className="mt-1.5 max-w-[16rem] text-sm leading-relaxed text-muted">
        No tasks yet. Add your first one and watch your weeks fill up.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition active:scale-95"
      >
        <Plus className="h-4 w-4" />
        Create a task
      </button>
    </div>
  );
}
