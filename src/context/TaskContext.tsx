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
  | { type: 'ADD_TASK'; payload: TaskFormData }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { id: string; status: Status } }
  | { type: 'SET_FILTER'; payload: Partial<Filters> };

const defaultFilters: Filters = { priority: 'all', status: 'all', search: '' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TASK': {
      const now = new Date().toISOString();
      const task: Task = {
        ...action.payload,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, tasks: [task, ...state.tasks] };
    }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? { ...action.payload, updatedAt: new Date().toISOString() }
            : t
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

// ── Context ──────────────────────────────────────────────────────────────────
interface TaskContextValue {
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

const STORAGE_KEY = 'task-dashboard-v1';

function initState(): State {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return { tasks: raw ? JSON.parse(raw) : SAMPLE_TASKS, filters: defaultFilters };
  } catch {
    return { tasks: SAMPLE_TASKS, filters: defaultFilters };
  }
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  // Persist tasks whenever they change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
    } catch { /* quota */ }
  }, [state.tasks]);

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

  const addTask    = useCallback((data: TaskFormData) => dispatch({ type: 'ADD_TASK',    payload: data }), []);
  const updateTask = useCallback((task: Task)         => dispatch({ type: 'UPDATE_TASK', payload: task }), []);
  const deleteTask = useCallback((id: string)         => dispatch({ type: 'DELETE_TASK', payload: id }),   []);
  const moveTask   = useCallback((id: string, status: Status) => dispatch({ type: 'MOVE_TASK', payload: { id, status } }), []);
  const setFilter  = useCallback((f: Partial<Filters>) => dispatch({ type: 'SET_FILTER', payload: f }), []);
  const clearFilters = useCallback(() => dispatch({ type: 'SET_FILTER', payload: defaultFilters }), []);

  const value = useMemo<TaskContextValue>(
    () => ({ tasks: state.tasks, filters: state.filters, filteredTasks, tasksByStatus, stats, addTask, updateTask, deleteTask, moveTask, setFilter, clearFilters }),
    [state.tasks, state.filters, filteredTasks, tasksByStatus, stats, addTask, updateTask, deleteTask, moveTask, setFilter, clearFilters]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used inside TaskProvider');
  return ctx;
}
