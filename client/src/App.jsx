import { Plus, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EmptyState } from './components/EmptyState.jsx';
import { Header } from './components/Header.jsx';
import { SearchOverlay } from './components/SearchOverlay.jsx';
import { WeekSkeletons } from './components/Skeleton.jsx';
import { TaskFormSheet } from './components/TaskFormSheet.jsx';
import { Toast } from './components/Toast.jsx';
import { WeekCard } from './components/WeekCard.jsx';
import { useTasks } from './hooks/useTasks.js';
import { groupTasksByWeek, weekKey } from './utils/date.js';

export default function App() {
  const {
    tasks,
    status,
    error,
    refresh,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const [expandedWeeks, setExpandedWeeks] = useState(() => new Set());
  const [searchOpen, setSearchOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formDate, setFormDate] = useState(null);
  const [toast, setToast] = useState(null);

  const toastTimer = useRef(null);
  const initialised = useRef(false);

  const weeks = useMemo(() => groupTasksByWeek(tasks), [tasks]);
  const currentWeek = weeks.find((week) => week.isCurrent);
  const openThisWeek = currentWeek ? currentWeek.open : 0;

  const dismissToast = useCallback(() => {
    window.clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const notify = useCallback((message, action = null) => {
    window.clearTimeout(toastTimer.current);
    setToast({ message, action });
    toastTimer.current = window.setTimeout(() => setToast(null), 5000);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  useEffect(() => {
    if (status === 'ready' && !initialised.current) {
      initialised.current = true;
      setExpandedWeeks(new Set([weekKey(new Date())]));
    }
  }, [status]);

  useEffect(() => {
    document.body.style.overflow = formOpen || searchOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [formOpen, searchOpen]);

  const openCreate = useCallback((date = null) => {
    setEditingTask(null);
    setFormDate(date instanceof Date ? date : null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((task) => {
    setEditingTask(task);
    setFormDate(null);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingTask(null);
    setFormDate(null);
  }, []);

  const toggleWeek = useCallback((key) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  async function handleSave(payload) {
    if (editingTask) {
      await updateTask(editingTask.id, payload);
      notify('Task updated');
    } else {
      await createTask(payload);
      const key = weekKey(new Date(payload.dueAt));
      setExpandedWeeks((prev) => new Set(prev).add(key));
      notify('Task added to your week');
    }
    closeForm();
  }

  async function handleToggleTask(task) {
    const nextStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    try {
      await updateTask(task.id, { status: nextStatus });
    } catch (err) {
      notify(err.message);
    }
  }

  async function handleDeleteTask(task) {
    try {
      await deleteTask(task.id);
      notify('Task deleted', {
        label: 'Undo',
        onClick: async () => {
          dismissToast();
          try {
            await createTask({
              title: task.title,
              description: task.description,
              dueAt: task.dueAt,
              priority: task.priority,
              status: task.status,
            });
            setExpandedWeeks((prev) => new Set(prev).add(weekKey(new Date(task.dueAt))));
            notify('Task restored');
          } catch (err) {
            notify(err.message);
          }
        },
      });
      return true;
    } catch (err) {
      notify(err.message);
      return false;
    }
  }

  function handleSearchEdit(task) {
    setSearchOpen(false);
    openEdit(task);
  }

  return (
    <div className="relative mx-auto min-h-[100dvh] w-full max-w-[480px] bg-canvas shadow-[0_30px_90px_-30px_rgba(23,22,39,0.55)] md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[36px]">
      <Header openTasksThisWeek={openThisWeek} onSearch={() => setSearchOpen(true)} />

      <main className="px-5 pb-36">
        {status === 'loading' ? <WeekSkeletons /> : null}

        {status === 'error' ? (
          <div className="rounded-[26px] border border-rose-100 bg-white p-7 text-center shadow-card">
            <p className="text-sm font-bold text-ink">Couldn’t load your tasks</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{error}</p>
            <button
              type="button"
              onClick={refresh}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-soft px-4 py-2.5 text-xs font-bold text-primary transition active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        ) : null}

        {status === 'ready' && tasks.length === 0 ? (
          <EmptyState onCreate={() => openCreate()} />
        ) : null}

        {status === 'ready' && tasks.length > 0 ? (
          <>
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                Your weeks
              </h2>
              <span className="text-[11px] font-semibold text-muted">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
              </span>
            </div>

            <div className="space-y-4">
              {weeks.map((week) => (
                <WeekCard
                  key={week.key}
                  week={week}
                  expanded={expandedWeeks.has(week.key)}
                  onToggle={() => toggleWeek(week.key)}
                  onAdd={openCreate}
                  onEdit={openEdit}
                  onDelete={handleDeleteTask}
                  onToggleTask={handleToggleTask}
                />
              ))}
            </div>
          </>
        ) : null}
      </main>

      <button
        type="button"
        onClick={() => openCreate()}
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        className="fixed left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-[#8B6BFF] px-6 py-4 text-sm font-extrabold text-white shadow-float transition hover:brightness-105 active:scale-95"
      >
        <Plus className="h-5 w-5" strokeWidth={3} />
        Add Task
      </button>

      <TaskFormSheet
        open={formOpen}
        task={editingTask}
        defaultDate={formDate}
        onClose={closeForm}
        onSave={handleSave}
      />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onEdit={handleSearchEdit}
        onDelete={handleDeleteTask}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
