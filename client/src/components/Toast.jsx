import { X } from 'lucide-react';

export function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-5">
      <div className="pointer-events-auto flex w-full max-w-[420px] animate-toast-in items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-xl">
        <span className="min-w-0 flex-1">{toast.message}</span>
        {toast.action ? (
          <button
            type="button"
            onClick={toast.action.onClick}
            className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-white/20"
          >
            {toast.action.label}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="shrink-0 rounded-lg p-1 text-white/60 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
