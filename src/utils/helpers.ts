import type { Priority, Status, Task, Filters } from '../types/task';

export function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate + 'T23:59:59');
  return due < new Date();
}

export function isDueSoon(dueDate: string): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate + 'T23:59:59');
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 2;
}

// Full class strings so Tailwind JIT picks them up
export const PRIORITY_STYLES: Record<Priority, { badge: string; dot: string; label: string }> = {
  low:    { badge: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20', dot: 'bg-emerald-500', label: 'Low' },
  medium: { badge: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',       dot: 'bg-amber-500',   label: 'Medium' },
  high:   { badge: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',          dot: 'bg-rose-500',    label: 'High' },
};

export const STATUS_STYLES: Record<Status, { badge: string; label: string; column: string; glow: string }> = {
  'todo':        { badge: 'bg-slate-500/10 text-slate-400',     label: 'Todo',        column: 'from-slate-600 to-slate-700',    glow: 'ring-slate-500/30' },
  'in-progress': { badge: 'bg-violet-500/10 text-violet-400',   label: 'In Progress', column: 'from-violet-700 to-indigo-700',  glow: 'ring-violet-500/30' },
  'done':        { badge: 'bg-emerald-500/10 text-emerald-400', label: 'Done',        column: 'from-emerald-700 to-teal-700',   glow: 'ring-emerald-500/30' },
};

export const COLUMN_ORDER: Status[] = ['todo', 'in-progress', 'done'];

export const SAMPLE_TASKS: Task[] = [];

export function applyFilters(tasks: Task[], filters: Filters): Task[] {
  return tasks.filter((task) => {
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}
