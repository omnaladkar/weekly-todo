import { Check, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../utils/cn.js';
import { formatTaskWhen } from '../utils/date.js';
import { PriorityBadge } from './PriorityBadge.jsx';

const REVEAL = 88;

export function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [dragX, setDragX] = useState(null);
  const startRef = useRef(null);
  const offsetRef = useRef(0);
  const draggingRef = useRef(false);
  const suppressClickRef = useRef(false);
  const rootRef = useRef(null);

  const done = task.status === 'completed';
  const base = open ? -REVEAL : 0;
  const offset = dragX === null ? base : dragX;

  useEffect(() => {
    if (!open) return undefined;

    function handleOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [open]);

  function handlePointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startRef.current = { x: event.clientX, y: event.clientY };
    offsetRef.current = base;
    draggingRef.current = false;
    setDragX(null);
  }

  function handlePointerMove(event) {
    const start = startRef.current;
    if (!start) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (!draggingRef.current) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      draggingRef.current = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {}
    }

    const next = Math.min(0, Math.max(-REVEAL - 12, base + dx));
    offsetRef.current = next;
    setDragX(next);
  }

  function finishDrag() {
    if (draggingRef.current) {
      suppressClickRef.current = true;
      setOpen(offsetRef.current < -REVEAL / 2);
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
    startRef.current = null;
    draggingRef.current = false;
    setDragX(null);
  }

  function handleRowClick() {
    if (suppressClickRef.current) return;
    if (open) {
      setOpen(false);
      return;
    }
    onEdit(task);
  }

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-2xl"
      data-testid="task-item"
    >
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          onDelete(task);
        }}
        className="absolute inset-y-0 right-0 flex w-[88px] flex-col items-center justify-center gap-1 rounded-2xl bg-rose-500 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-rose-600"
        aria-label={`Delete ${task.title}`}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>

      <div
        onClick={handleRowClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse' && draggingRef.current) finishDrag();
        }}
        className={cn(
          'relative flex touch-pan-y select-none items-start gap-3 rounded-2xl border border-line/80 bg-white px-3.5 py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          dragX === null && 'transition-transform duration-200 ease-out'
        )}
        style={{ transform: `translateX(${offset}px)` }}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggle(task);
          }}
          aria-label={
            done ? `Mark ${task.title} as in progress` : `Mark ${task.title} as completed`
          }
          aria-pressed={done}
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-90',
            done
              ? 'border-primary bg-primary text-white'
              : 'border-line bg-white text-transparent hover:border-primary/60'
          )}
        >
          <Check className={cn('h-3 w-3', done && 'animate-pop')} strokeWidth={3.5} />
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'truncate text-sm font-semibold leading-snug',
              done ? 'text-muted line-through' : 'text-ink'
            )}
          >
            {task.title}
          </p>

          {task.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
              {task.description}
            </p>
          ) : null}

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[11px] font-semibold text-muted">
              {formatTaskWhen(task.dueAt)}
            </span>
            <PriorityBadge priority={task.priority} />
          </div>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(task);
          }}
          aria-label={`Edit ${task.title}`}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-primary-soft hover:text-primary"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
