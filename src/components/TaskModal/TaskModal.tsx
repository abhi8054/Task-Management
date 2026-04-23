import React, { useEffect, useReducer, useCallback } from 'react';
import type { Task, TaskFormData, Priority, Status } from '../../types/task';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Select } from '../UI/Select';
import { DatePicker } from '../UI/DatePicker';

interface Props {
  open: boolean;
  task?: Task | null;
  defaultStatus?: Status;
  onClose: () => void;
  onSave: (data: TaskFormData) => void;
}

type FormState = TaskFormData;

const defaultForm = (status: Status = 'todo'): FormState => ({
  title: '',
  description: '',
  priority: 'medium',
  status,
  dueDate: '',
});

function formReducer(state: FormState, patch: Partial<FormState>): FormState {
  return { ...state, ...patch };
}

export function TaskModal({ open, task, defaultStatus = 'todo', onClose, onSave }: Props) {
  const [form, patchForm] = useReducer(formReducer, defaultForm(defaultStatus));
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});

  // Sync form when modal opens
  useEffect(() => {
    if (open) {
      if (task) {
        patchForm({ title: task.title, description: task.description, priority: task.priority, status: task.status, dueDate: task.dueDate });
      } else {
        patchForm(defaultForm(defaultStatus));
      }
      setErrors({});
    }
  }, [open, task, defaultStatus]);

  const validate = useCallback((): boolean => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.length > 100) e.title = 'Title must be ≤ 100 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, title: form.title.trim(), description: form.description.trim() });
    onClose();
  }, [form, validate, onSave, onClose]);

  const field = (label: string, required: boolean, children: React.ReactNode, error?: string) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

  const inputCls = (err?: string) =>
    `w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:bg-white transition-all ${err ? 'border-red-400 focus:ring-red-300/40' : 'border-slate-200 focus:ring-indigo-500/40 focus:border-indigo-400'}`;

  return (
    <Modal open={open} title={task ? 'Edit Task' : 'Create New Task'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {field('Title', true,
          <input
            type="text"
            value={form.title}
            onChange={(e) => patchForm({ title: e.target.value })}
            placeholder="e.g. Implement user authentication"
            className={inputCls(errors.title)}
            autoFocus
            maxLength={100}
          />,
          errors.title
        )}

        {field('Description', false,
          <textarea
            value={form.description}
            onChange={(e) => patchForm({ description: e.target.value })}
            placeholder="Add details about the task…"
            rows={3}
            className={`${inputCls()} resize-none`}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {field('Priority', true,
            <Select
              value={form.priority}
              onChange={(v) => patchForm({ priority: v as Priority })}
              options={[
                { value: 'low',    label: '🟢 Low' },
                { value: 'medium', label: '🟡 Medium' },
                { value: 'high',   label: '🔴 High' },
              ]}
            />
          )}

          {field('Status', true,
            <Select
              value={form.status}
              onChange={(v) => patchForm({ status: v as Status })}
              options={[
                { value: 'todo',        label: 'Todo' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'done',        label: 'Done' },
              ]}
            />
          )}
        </div>

        {field('Due Date', false,
          <DatePicker
            value={form.dueDate}
            onChange={(v) => patchForm({ dueDate: v })}
          />
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{task ? 'Save Changes' : 'Create Task'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default TaskModal;
