import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
} from 'date-fns';

const WEEK_OPTIONS = { weekStartsOn: 1 };

export function startOfTaskWeek(date) {
  return startOfWeek(date, WEEK_OPTIONS);
}

export function weekKey(date) {
  return format(startOfTaskWeek(date), 'yyyy-MM-dd');
}

export function isCurrentWeek(start, now = new Date()) {
  return isSameDay(start, startOfTaskWeek(now));
}

export function weekLabel(start, now = new Date()) {
  const weeksApart =
    differenceInCalendarDays(start, startOfTaskWeek(now)) / 7;

  if (weeksApart === 0) return 'This week';
  if (weeksApart === 1) return 'Next week';
  if (weeksApart === -1) return 'Last week';
  return weeksApart > 0 ? `In ${weeksApart} weeks` : `${-weeksApart} weeks ago`;
}

export function formatWeekRange(start, end) {
  const sameMonth = start.getMonth() === end.getMonth();
  return sameMonth
    ? `${format(start, 'MMM d')} – ${format(end, 'd')}`
    : `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
}

export function formatTaskWhen(iso, now = new Date()) {
  const date = parseISO(iso);
  let day;

  if (isSameDay(date, now)) day = 'Today';
  else if (isSameDay(date, addDays(now, 1))) day = 'Tomorrow';
  else day = format(date, 'EEE, MMM d');

  return `${day} · ${format(date, 'h:mm a')}`;
}

export function formatLongDate(date = new Date()) {
  return format(date, 'EEEE, MMMM d');
}

export function groupTasksByWeek(tasks, now = new Date()) {
  const buckets = new Map();
  const currentWeekStart = startOfTaskWeek(now);

  function ensureBucket(start) {
    const key = format(start, 'yyyy-MM-dd');
    if (!buckets.has(key)) {
      buckets.set(key, {
        key,
        start,
        end: addDays(start, 6),
        tasks: [],
      });
    }
    return buckets.get(key);
  }

  ensureBucket(currentWeekStart);

  for (const task of tasks) {
    ensureBucket(startOfTaskWeek(parseISO(task.dueAt))).tasks.push(task);
  }

  const weeks = [...buckets.values()].map((week) => {
    const sorted = [...week.tasks].sort(
      (a, b) => new Date(a.dueAt) - new Date(b.dueAt)
    );
    const completed = sorted.filter((task) => task.status === 'completed').length;

    return {
      ...week,
      tasks: sorted,
      total: sorted.length,
      completed,
      open: sorted.length - completed,
      label: weekLabel(week.start, now),
      isCurrent: isSameDay(week.start, currentWeekStart),
      range: formatWeekRange(week.start, week.end),
    };
  });

  return weeks.sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;

    const nowMs = currentWeekStart.getTime();
    const aFuture = a.start.getTime() > nowMs;
    const bFuture = b.start.getTime() > nowMs;

    if (aFuture !== bFuture) return aFuture ? -1 : 1;
    return aFuture
      ? a.start.getTime() - b.start.getTime()
      : b.start.getTime() - a.start.getTime();
  });
}
