import React, { memo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, GripVertical, Pencil, Trash2, AlertCircle, Clock } from 'lucide-react';
import type { Task } from '../../types/task';
import { PRIORITY_STYLES, formatDate, isOverdue, isDueSoon } from '../../utils/helpers';
import { PriorityBadge } from '../UI/Badge';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  overlay?: boolean;
}

const TaskCard = memo(({ task, onEdit, onDelete, overlay = false }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  const overdue  = isOverdue(task.dueDate);
  const dueSoon  = isDueSoon(task.dueDate);
  const priority = PRIORITY_STYLES[task.priority];

  const handleEdit   = useCallback(() => onEdit(task), [task, onEdit]);
  const handleDelete = useCallback(() => onDelete(task.id), [task.id, onDelete]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'group rounded-xl border transition-all duration-200 select-none',
        isDragging || overlay
          ? 'opacity-40 shadow-2xl scale-[1.02] rotate-1 border-violet-500/40 ring-1 ring-violet-500/20'
          : 'bg-white/[0.04] border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.07] shadow-sm hover:shadow-xl hover:shadow-black/20',
      ].join(' ')}
    >
      {/* Priority accent bar */}
      <div className={`h-0.5 rounded-t-xl ${priority.dot}`} />

      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing shrink-0 touch-none transition-colors"
            aria-label="Drag to reorder"
          >
            <GripVertical size={14} />
          </button>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2 break-words">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
              aria-label="Edit task"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              aria-label="Delete task"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pl-5">
          <PriorityBadge priority={task.priority} />

          {task.dueDate ? (
            <span className={`flex items-center gap-1 text-xs font-medium ${overdue ? 'text-rose-400' : dueSoon ? 'text-amber-400' : 'text-slate-500'}`}>
              {overdue  && <AlertCircle size={11} />}
              {dueSoon && !overdue && <Clock size={11} />}
              {!overdue && !dueSoon && <Calendar size={11} />}
              {formatDate(task.dueDate)}
            </span>
          ) : (
            <span className="text-xs text-white/15">No due date</span>
          )}
        </div>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';
export default TaskCard;
