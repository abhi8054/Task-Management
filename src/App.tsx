import React, { useState, useCallback } from 'react';
import { TaskProvider } from './context/TaskContext';
import Header from './components/Header';
import FilterBar from './components/Filters/FilterBar';
import KanbanBoard from './components/Board/KanbanBoard';
import { TaskModal } from './components/TaskModal/TaskModal';
import type { TaskFormData } from './types/task';
import { useTaskContext } from './context/TaskContext';

function AppContent() {
  const { addTask } = useTaskContext();
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  const openNewTask  = useCallback(() => setNewTaskOpen(true), []);
  const closeNewTask = useCallback(() => setNewTaskOpen(false), []);

  const handleSave = useCallback((data: TaskFormData) => {
    addTask(data);
    setNewTaskOpen(false);
  }, [addTask]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col">
      <Header onNewTask={openNewTask} />
      <FilterBar />

      <main className="flex-1 flex overflow-hidden">
        <KanbanBoard />
      </main>

      <TaskModal
        open={newTaskOpen}
        task={null}
        defaultStatus="todo"
        onClose={closeNewTask}
        onSave={handleSave}
      />
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}
