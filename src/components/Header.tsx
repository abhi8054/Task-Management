import React, { memo } from 'react';
import { LayoutDashboard, Plus, AlertTriangle, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { Button } from './UI/Button';

interface HeaderProps {
  onNewTask: () => void;
}

const StatCard = memo(({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
  <div className={`flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 ring-1 ring-white/20`}>
    <div className={`text-white/80 ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      <p className="text-xs text-white/60 mt-0.5">{label}</p>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

const Header = memo(({ onNewTask }: HeaderProps) => {
  const { stats } = useTaskContext();
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <header className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-xl">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">

        {/* Top row */}
        <div className="flex items-center justify-between py-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">TaskBoard</h1>
              <p className="text-xs text-slate-400 mt-0.5">Project management dashboard</p>
            </div>
          </div>

          <Button variant="primary" size="md" onClick={onNewTask} className="shadow-lg shadow-indigo-500/25 shrink-0">
            <Plus size={16} />
            New Task
          </Button>
        </div>

        {/* Stats row */}
        <div className="pb-5 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="grid grid-cols-2 sm:flex gap-3 flex-1">
            <StatCard icon={<ListTodo size={18} />}    label="Total"       value={stats.total}      color="" />
            <StatCard icon={<Clock size={18} />}        label="In Progress" value={stats.inProgress} color="text-blue-300" />
            <StatCard icon={<CheckCircle2 size={18} />} label="Done"        value={stats.done}       color="text-emerald-300" />
            {stats.overdue > 0 && (
              <StatCard icon={<AlertTriangle size={18} />} label="Overdue" value={stats.overdue} color="text-red-300" />
            )}
          </div>

          {/* Progress bar */}
          <div className="sm:w-48 shrink-0">
            <div className="flex justify-between text-xs text-white/60 mb-1.5">
              <span>Completion</span>
              <span className="font-semibold text-white">{pct}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
export default Header;
