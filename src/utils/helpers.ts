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
  low:    { badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500', label: 'Low' },
  medium: { badge: 'bg-amber-100 text-amber-700 ring-amber-200',       dot: 'bg-amber-500',   label: 'Medium' },
  high:   { badge: 'bg-red-100 text-red-700 ring-red-200',             dot: 'bg-red-500',     label: 'High' },
};

export const STATUS_STYLES: Record<Status, { badge: string; label: string; column: string; glow: string }> = {
  'todo':        { badge: 'bg-slate-100 text-slate-600',  label: 'Todo',        column: 'from-slate-600 to-slate-700',    glow: 'ring-slate-200' },
  'in-progress': { badge: 'bg-blue-100 text-blue-700',    label: 'In Progress', column: 'from-blue-500 to-indigo-600',    glow: 'ring-blue-200' },
  'done':        { badge: 'bg-emerald-100 text-emerald-700', label: 'Done',     column: 'from-emerald-500 to-teal-600',   glow: 'ring-emerald-200' },
};

export const COLUMN_ORDER: Status[] = ['todo', 'in-progress', 'done'];

export const SAMPLE_TASKS: Task[] = [
  {
    id: 'sample_1',
    title: 'Design system architecture',
    description: 'Plan microservices layout and database schema for the new platform.',
    priority: 'high',
    status: 'todo',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample_2',
    title: 'Implement authentication flow',
    description: 'OAuth 2.0 + JWT with refresh token rotation.',
    priority: 'high',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample_3',
    title: 'Write unit tests for API',
    description: 'Achieve 80% code coverage using Vitest.',
    priority: 'medium',
    status: 'todo',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample_4',
    title: 'Set up CI/CD pipeline',
    description: 'GitHub Actions: lint, test, build, deploy to staging.',
    priority: 'medium',
    status: 'done',
    dueDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample_5',
    title: 'Update project README',
    description: 'Add setup instructions and contribution guide.',
    priority: 'low',
    status: 'done',
    dueDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample_6',
    title: 'Performance audit & optimization',
    description: 'Profile bundle size, lazy-load routes, add caching headers.',
    priority: 'medium',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function applyFilters(tasks: Task[], filters: Filters): Task[] {
  return tasks.filter((task) => {
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}
