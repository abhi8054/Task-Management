import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import type { Task, Filters, Status, TaskFormData } from '../types/task';
import { generateId, SAMPLE_TASKS, applyFilters } from '../utils/helpers';

// ── State ────────────────────────────────────────────────────────────────────
interface State {
  tasks: Task[];
  filters: Filters;
}

// ── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'LOAD_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { id: string; status: Status } }
  | { type: 'SET_FILTER'; payload: Partial<Filters> };

const defaultFilters: Filters = { priority: 'all', status: 'all', search: '' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_TASKS':
      return { ...state, tasks: action.payload };

    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };

    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? { ...t, status: action.payload.status, updatedAt: new Date().toISOString() }
            : t
        ),
      };

    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    default:
      return state;
  }
}

// ── API helpers ──────────────────────────────────────────────────────────────
const API = '/api/tasks';

async function apiPost(task: Task): Promise<void> {
  await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task) });
}
async function apiPut(task: Task): Promise<void> {
  await fetch(`${API}/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task) });
}
async function apiPatch(id: string, patch: Partial<Task>): Promise<void> {
  await fetch(`${API}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
}
async function apiDelete(id: string): Promise<void> {
  await fetch(`${API}/${id}`, { method: 'DELETE' });
}

// ── localStorage cache ───────────────────────────────────────────────────────
const STORAGE_KEY = 'task-dashboard-v1';

function readStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : SAMPLE_TASKS;
  } catch {
    return SAMPLE_TASKS;
  }
}

function writeStorage(tasks: Task[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch { /* quota */ }
}

function initState(): State {
  return { tasks: readStorage(), filters: defaultFilters };
}

// ── Context ──────────────────────────────────────────────────────────────────
interface TaskContextValue {
  loading: boolean;
  tasks: Task[];
  filters: Filters;
  filteredTasks: Task[];
  tasksByStatus: Record<Status, Task[]>;
  stats: { total: number; todo: number; inProgress: number; done: number; overdue: number };
  addTask: (data: TaskFormData) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: Status) => void;
  setFilter: (filter: Partial<Filters>) => void;
  clearFilters: () => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const [loading, setLoading] = React.useState(true);

  // Hydrate from API on mount; localStorage already loaded as initial state
  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/tasks', { signal: controller.signal })
      .then((r) => r.json())
      .then((tasks: Task[]) => {
        dispatch({ type: 'LOAD_TASKS', payload: tasks });
        writeStorage(tasks);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // StrictMode double-mount — ignore
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  // Keep localStorage in sync whenever tasks change
  useEffect(() => {
    writeStorage(state.tasks);
  }, [state.tasks]);

  // ── Mutations (optimistic + API sync) ──────────────────────────────────────
  const addTask = useCallback((data: TaskFormData) => {
    const now = new Date().toISOString();
    const task: Task = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    dispatch({ type: 'ADD_TASK', payload: task });
    apiPost(task).catch(console.error);
  }, []);

  const updateTask = useCallback((task: Task) => {
    const updated = { ...task, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_TASK', payload: updated });
    apiPut(updated).catch(console.error);
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
    apiDelete(id).catch(console.error);
  }, []);

  const moveTask = useCallback((id: string, status: Status) => {
    const updatedAt = new Date().toISOString();
    dispatch({ type: 'MOVE_TASK', payload: { id, status } });
    apiPatch(id, { status, updatedAt }).catch(console.error);
  }, []);

  const setFilter    = useCallback((f: Partial<Filters>) => dispatch({ type: 'SET_FILTER', payload: f }), []);
  const clearFilters = useCallback(() => dispatch({ type: 'SET_FILTER', payload: defaultFilters }), []);

  // ── Derived state ──────────────────────────────────────────────────────────
  const filteredTasks = useMemo(
    () => applyFilters(state.tasks, state.filters),
    [state.tasks, state.filters]
  );

  const tasksByStatus = useMemo<Record<Status, Task[]>>(
    () => ({
      'todo':        filteredTasks.filter((t) => t.status === 'todo'),
      'in-progress': filteredTasks.filter((t) => t.status === 'in-progress'),
      'done':        filteredTasks.filter((t) => t.status === 'done'),
    }),
    [filteredTasks]
  );

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total:      state.tasks.length,
      todo:       state.tasks.filter((t) => t.status === 'todo').length,
      inProgress: state.tasks.filter((t) => t.status === 'in-progress').length,
      done:       state.tasks.filter((t) => t.status === 'done').length,
      overdue:    state.tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate + 'T23:59:59') < now && t.status !== 'done'
      ).length,
    };
  }, [state.tasks]);

  const value = useMemo<TaskContextValue>(
    () => ({ loading, tasks: state.tasks, filters: state.filters, filteredTasks, tasksByStatus, stats, addTask, updateTask, deleteTask, moveTask, setFilter, clearFilters }),
    [loading, state.tasks, state.filters, filteredTasks, tasksByStatus, stats, addTask, updateTask, deleteTask, moveTask, setFilter, clearFilters]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used inside TaskProvider');
  return ctx;
}
