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
    <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(109,40,217,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(99,102,241,0.1) 0%, transparent 50%), #080c18' }}>
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
