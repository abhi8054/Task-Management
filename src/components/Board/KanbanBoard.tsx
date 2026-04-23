import React, { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Task, Status, TaskFormData } from '../../types/task';
import { COLUMN_ORDER, STATUS_STYLES } from '../../utils/helpers';
import { useTaskContext } from '../../context/TaskContext';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import SkeletonCard from './SkeletonCard';
import { TaskModal } from '../TaskModal/TaskModal';

const STATUSES = new Set<string>(COLUMN_ORDER);

const SKELETON_COUNTS: Record<Status, number> = { 'todo': 3, 'in-progress': 2, 'done': 2 };

export default function KanbanBoard() {
  const { loading, tasksByStatus, addTask, updateTask, deleteTask, moveTask } = useTaskContext();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<Status>('todo');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumn, setOverColumn] = useState<Status | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Sensors — require 5px movement before drag starts (prevents accidental drags on click)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Flat lookup: taskId → status (for fast cross-column resolution)
  const taskStatusMap = useMemo(() => {
    const map = new Map<string, Status>();
    COLUMN_ORDER.forEach((s) => tasksByStatus[s].forEach((t) => map.set(t.id, s)));
    return map;
  }, [tasksByStatus]);

  const findTaskById = useCallback((id: string): Task | undefined => {
    for (const s of COLUMN_ORDER) {
      const t = tasksByStatus[s].find((t) => t.id === id);
      if (t) return t;
    }
  }, [tasksByStatus]);

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveTask(findTaskById(active.id as string) ?? null);
  }, [findTaskById]);

  const handleDragOver = useCallback(({ over }: DragOverEvent) => {
    if (!over) { setOverColumn(null); return; }
    const overId = over.id as string;
    if (STATUSES.has(overId)) {
      setOverColumn(overId as Status);
    } else {
      const s = taskStatusMap.get(overId);
      setOverColumn(s ?? null);
    }
  }, [taskStatusMap]);

  const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    setOverColumn(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId   = over.id as string;
    const activeStatus = taskStatusMap.get(activeId);

    let targetStatus: Status;
    if (STATUSES.has(overId)) {
      targetStatus = overId as Status;
    } else {
      targetStatus = taskStatusMap.get(overId) ?? activeStatus!;
    }

    if (activeStatus && activeStatus !== targetStatus) {
      moveTask(activeId, targetStatus);
    }
  }, [taskStatusMap, moveTask]);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openCreate = useCallback((status: Status) => {
    setNewTaskStatus(status);
    setEditingTask(null);
    setModalMode('create');
  }, []);

  const openEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setModalMode('edit');
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setEditingTask(null);
  }, []);

  const handleSave = useCallback((data: TaskFormData) => {
    if (modalMode === 'edit' && editingTask) {
      updateTask({ ...editingTask, ...data });
    } else {
      addTask(data);
    }
  }, [modalMode, editingTask, addTask, updateTask]);

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirm(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) { deleteTask(deleteConfirm); setDeleteConfirm(null); }
  }, [deleteConfirm, deleteTask]);

  if (loading) {
    return (
      <div className="flex gap-4 p-4 sm:p-6 overflow-x-auto flex-1 items-start">
        {COLUMN_ORDER.map((status) => {
          const cfg = STATUS_STYLES[status];
          return (
            <div key={status} className="flex flex-col flex-1 min-w-[280px] max-w-sm sm:max-w-none">
              <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl bg-gradient-to-r ${cfg.column} shadow-sm`}>
                <div className="flex items-center gap-2.5">
                  <div className="skeleton h-3.5 w-20 rounded-full opacity-40" />
                  <div className="skeleton h-5 w-6 rounded-full opacity-30" />
                </div>
                <div className="skeleton size-7 rounded-lg opacity-30" />
              </div>
              <div className="flex-1 flex flex-col gap-3 p-3 rounded-b-2xl bg-slate-100/70">
                {Array.from({ length: SKELETON_COUNTS[status] }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Board */}
        <div className="flex gap-4 p-4 sm:p-6 overflow-x-auto flex-1 items-start">
          {COLUMN_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              isOver={overColumn === status}
              onAddTask={openCreate}
              onEditTask={openEdit}
              onDeleteTask={handleDelete}
            />
          ))}
        </div>

        {/* Drag overlay — renders the floating card while dragging */}
        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
          {activeTask ? (
            <div className="rotate-2 scale-105">
              <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} overlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create / Edit modal */}
      <TaskModal
        open={modalMode !== null}
        task={modalMode === 'edit' ? editingTask : null}
        defaultStatus={newTaskStatus}
        onClose={closeModal}
        onSave={handleSave}
      />

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fade-in 0.15s ease-out' }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full ring-1 ring-black/5" style={{ animation: 'scale-in 0.15s ease-out' }}>
            <h3 className="text-base font-semibold text-slate-800 mb-2">Delete task?</h3>
            <p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm shadow-red-200">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
