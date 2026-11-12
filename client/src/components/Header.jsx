import { Search } from 'lucide-react';
import { formatLongDate } from '../utils/date.js';

export function Header({ openTasksThisWeek, onSearch }) {
  const subtitle =
    openTasksThisWeek === 0
      ? 'All clear this week. Nice work!'
      : `${openTasksThisWeek} open ${
          openTasksThisWeek === 1 ? 'task' : 'tasks'
        } this week`;

  return (
    <header className="px-5 pb-3 pt-safe">
      <div className="flex items-start justify-between gap-3 pt-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            {formatLongDate()}
          </p>
          <h1 className="mt-1.5 text-[30px] font-extrabold leading-none tracking-tight text-ink">
            My Tasks
          </h1>
          <p className="mt-2 text-sm font-medium text-muted">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSearch}
            className="icon-btn"
            aria-label="Search tasks"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#9B7BFF] text-sm font-extrabold text-white shadow-float"
            aria-hidden="true"
          >
            ON
          </div>
        </div>
      </div>
    </header>
  );
}
