import { addHours, format, parseISO } from 'date-fns';
import { Check, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../utils/cn.js';

const PRIORITY_OPTIONS = [
  {
    value: 'low',
    label: 'Low',
    dot: 'bg-emerald-500',
    active: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  },
  {
    value: 'medium',
    label: 'Medium',
    dot: 'bg-amber-500',
    active: 'border-amber-300 bg-amber-50 text-amber-700',
  },
  {
    value: 'high',
    label: 'High',
    dot: 'bg-rose-500',
    active: 'border-rose-300 bg-rose-50 text-rose-700',
  },
];

function buildInitialForm(task, defaultDate) {
  if (task) {
    const due = parseISO(task.dueAt);
    return {
      title: task.title,
      description: task.description || '',
      date: format(due, 'yyyy-MM-dd'),
      time: format(due, 'HH:mm'),
      priority: task.priority || 'medium',
    };
  }

  const base =
    defaultDate instanceof Date && !Number.isNaN(defaultDate.getTime())
      ? defaultDate
      : new Date();
  const isToday = format(base, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return {
    title: '',
    description: '',
    date: format(base, 'yyyy-MM-dd'),
    time: isToday ? format(addHours(new Date(), 1), 'HH:00') : '09:00',
    priority: 'medium',
  };
}

export function TaskFormSheet({ open, task, defaultDate, onClose, onSave }) {
  const [form, setForm] = useState(() => buildInitialForm(task, defaultDate));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const defaultTime = defaultDate?.getTime();

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialForm(task, defaultDate));
    setError('');
    setSaving(false);
  }, [open, task?.id, defaultTime]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKey(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const title = form.title.trim();
    if (!title) {
      setError('Give your task a title.');
      return;
    }

    const dueAt = new Date(`${form.date}T${form.time}`);
    if (Number.isNaN(dueAt.getTime())) {
      setError('Pick a valid date and time.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title,
        description: form.description.trim(),
        dueAt: dueAt.toISOString(),
        priority: form.priority,
      });
    } catch (err) {
      setError(err.message || 'Could not save the task.');
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        className="max-h-[92dvh] w-full max-w-[480px] animate-slide-up overflow-y-auto rounded-t-[32px] bg-white px-5 pb-8 pt-4 shadow-2xl sm:rounded-[32px] sm:pb-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line sm:hidden" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              {task ? 'Edit task' : 'New task'}
            </p>
            <h2
              id="task-form-title"
              className="mt-1 text-xl font-extrabold tracking-tight text-ink"
            >
              {task ? 'Update the details' : 'What needs doing?'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-muted transition hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="task-title" className="field-label">
              Title <span className="text-[10px] normal-case text-rose-400">required</span>
            </label>
            <input
              id="task-title"
              autoFocus
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              maxLength={120}
              placeholder="e.g. Send the weekly report"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="task-description" className="field-label">
              Description <span className="font-semibold normal-case text-muted">optional</span>
            </label>
            <textarea
              id="task-description"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Add notes, links, or context…"
              className="field resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-date" className="field-label">
                Date
              </label>
              <input
                id="task-date"
                type="date"
                value={form.date}
                onChange={(event) => updateField('date', event.target.value)}
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="task-time" className="field-label">
                Time
              </label>
              <input
                id="task-time"
                type="time"
                value={form.time}
                onChange={(event) => updateField('time', event.target.value)}
                className="field"
                required
              />
            </div>
          </div>

          <div>
            <span className="field-label">Priority</span>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField('priority', option.value)}
                  aria-pressed={form.priority === option.value}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-bold transition active:scale-95',
                    form.priority === option.value
                      ? option.active
                      : 'border-line bg-white text-muted hover:border-primary/30'
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', option.dot)} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-600"
            >
              {error}
            </p>
          ) : null}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 rounded-2xl border border-line px-4 py-3.5 text-sm font-bold text-muted transition hover:bg-canvas"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" strokeWidth={3} />
                  {task ? 'Save changes' : 'Create task'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
