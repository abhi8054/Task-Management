import React, { memo, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, PackageOpen } from 'lucide-react';
import type { Task, Status } from '../../types/task';
import { STATUS_STYLES } from '../../utils/helpers';
import TaskCard from './TaskCard';

interface Props {
  status: Status;
  tasks: Task[];
  isOver: boolean;
  onAddTask: (status: Status) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const KanbanColumn = memo(({ status, tasks, isOver, onAddTask, onEditTask, onDeleteTask }: Props) => {
  const { setNodeRef } = useDroppable({ id: status });
  const cfg = STATUS_STYLES[status];

  const handleAdd = useCallback(() => onAddTask(status), [status, onAddTask]);

  return (
    <div className="flex flex-col flex-1 min-w-[280px] max-w-sm sm:max-w-none">
      {/* Column header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl bg-gradient-to-r ${cfg.column} shadow-lg`}>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xs font-bold text-white/90 tracking-widest uppercase">{cfg.label}</h2>
          <span className="flex items-center justify-center min-w-[22px] h-5 rounded-full bg-white/15 text-white/80 text-xs font-bold px-1.5">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center size-7 rounded-lg bg-white/10 hover:bg-white/25 text-white/70 hover:text-white transition-all"
          aria-label={`Add task to ${cfg.label}`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={[
          'flex-1 flex flex-col gap-3 p-3 rounded-b-2xl min-h-[200px] transition-all duration-200 border border-t-0',
          isOver
            ? 'bg-violet-500/10 border-violet-500/30 ring-1 ring-inset ring-violet-500/20'
            : 'bg-white/[0.03] border-white/[0.06]',
        ].join(' ')}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-10 gap-3 text-white/20">
            <PackageOpen size={30} strokeWidth={1.2} />
            <div className="text-center">
              <p className="text-sm font-medium">No tasks</p>
              <p className="text-xs mt-0.5 text-white/15">Drag here or click +</p>
            </div>
          </div>
        )}

        {/* Drop indicator */}
        {isOver && (
          <div className="h-12 rounded-xl border-2 border-dashed border-violet-500/40 bg-violet-500/5 flex items-center justify-center">
            <p className="text-xs text-violet-400/70 font-medium">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';
export default KanbanColumn;
