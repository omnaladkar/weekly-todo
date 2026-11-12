import { ArrowLeft, Loader2, Pencil, Search, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { tasksApi } from '../api/client.js';
import { formatTaskWhen } from '../utils/date.js';
import { PriorityBadge } from './PriorityBadge.jsx';

export function SearchOverlay({ open, onClose, onEdit, onDelete }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [state, setState] = useState('idle');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setQuery('');
    setResults([]);
    setState('idle');
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const term = query.trim();
    if (!term) {
      setResults([]);
      setState('idle');
      return undefined;
    }

    let cancelled = false;
    setState('loading');
    const timer = window.setTimeout(async () => {
      try {
        const data = await tasksApi.list(term);
        if (!cancelled) {
          setResults(data);
          setState('ready');
        }
      } catch {
        if (!cancelled) setState('error');
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKey(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleDelete(task) {
    const removed = await onDelete(task);
    if (removed) {
      setResults((prev) => prev.filter((item) => item.id !== task.id));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-6">
      <div className="flex h-[100dvh] w-full max-w-[480px] flex-col bg-canvas sm:h-[min(780px,88dvh)] sm:overflow-hidden sm:rounded-[36px] sm:shadow-2xl">
        <div className="flex items-center gap-3 px-5 pb-3 pt-safe">
          <div className="flex w-full items-center gap-3 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="icon-btn shrink-0"
              aria-label="Close search"
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
            </button>

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tasks…"
                aria-label="Search tasks"
                className="field pl-10 pr-10"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {query.trim() ? 'Results' : 'Search'}
          </p>
          {state === 'ready' && query.trim() ? (
            <p className="text-[11px] font-semibold text-muted">
              {results.length} {results.length === 1 ? 'match' : 'matches'}
            </p>
          ) : null}
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-10">
          {state === 'idle' ? (
            <div className="mt-8 flex flex-col items-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-card">
                <Search className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-bold text-ink">Find any task</p>
              <p className="mt-1 max-w-[17rem] text-xs leading-relaxed text-muted">
                Search across titles and descriptions. Results can be edited or
                deleted right here.
              </p>
            </div>
          ) : null}

          {state === 'loading' ? (
            <div className="mt-10 flex flex-col items-center gap-3 text-muted">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-xs font-semibold">Searching…</p>
            </div>
          ) : null}

          {state === 'error' ? (
            <p className="mt-8 rounded-2xl bg-rose-50 px-4 py-3 text-center text-xs font-semibold text-rose-600">
              Search failed. Please try again.
            </p>
          ) : null}

          {state === 'ready' && results.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-line bg-white/70 px-5 py-8 text-center">
              <p className="text-sm font-bold text-ink">No matches</p>
              <p className="mt-1 text-xs text-muted">
                Try a different keyword or check the spelling.
              </p>
            </div>
          ) : null}

          {state === 'ready' && results.length > 0 ? (
            <div className="space-y-2.5">
              {results.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2 rounded-2xl border border-line bg-white px-4 py-3 shadow-card"
                >
                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p
                      className={
                        task.status === 'completed'
                          ? 'truncate text-sm font-semibold text-muted line-through'
                          : 'truncate text-sm font-semibold text-ink'
                      }
                    >
                      {task.title}
                    </p>
                    {task.description ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                        {task.description}
                      </p>
                    ) : null}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-muted">
                        {formatTaskWhen(task.dueAt)}
                      </span>
                      <PriorityBadge priority={task.priority} />
                      {task.status === 'completed' ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                          Done
                        </span>
                      ) : null}
                    </div>
                  </button>

                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      aria-label={`Edit ${task.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-primary-soft hover:text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(task)}
                      aria-label={`Delete ${task.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
