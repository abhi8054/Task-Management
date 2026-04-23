import React, { memo } from 'react';
import { LayoutDashboard, Plus, AlertTriangle, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { Button } from './UI/Button';

interface HeaderProps {
  onNewTask: () => void;
}

const StatCard = memo(({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
  <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 ring-1 ring-white/10 hover:ring-white/20 transition-all">
    <div className={color}>{icon}</div>
    <div>
      <p className="text-xl font-bold text-white leading-none">{value}</p>
      <p className="text-xs text-white/50 mt-0.5 font-medium">{label}</p>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

const Header = memo(({ onNewTask }: HeaderProps) => {
  const { stats } = useTaskContext();
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <header className="border-b border-white/[0.06]" style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.2) 0%, rgba(15,23,42,0.8) 50%, rgba(99,102,241,0.15) 100%), rgba(8,12,24,0.9)', backdropFilter: 'blur(20px)' }}>
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">

        {/* Top row */}
        <div className="flex items-center justify-between py-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30 ring-1 ring-white/10">
              <LayoutDashboard size={19} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">TaskBoard</h1>
              <p className="text-xs text-white/40 mt-0.5 font-medium">Project management dashboard</p>
            </div>
          </div>

          <Button variant="primary" size="md" onClick={onNewTask} className="shrink-0">
            <Plus size={15} />
            New Task
          </Button>
        </div>

        {/* Stats + progress */}
        <div className="pb-5 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="grid grid-cols-2 sm:flex gap-2.5 flex-1">
            <StatCard icon={<ListTodo size={17} />}     label="Total"       value={stats.total}      color="text-slate-400" />
            <StatCard icon={<Clock size={17} />}         label="In Progress" value={stats.inProgress} color="text-violet-400" />
            <StatCard icon={<CheckCircle2 size={17} />}  label="Done"        value={stats.done}       color="text-emerald-400" />
            {stats.overdue > 0 && (
              <StatCard icon={<AlertTriangle size={17} />} label="Overdue"   value={stats.overdue}   color="text-rose-400" />
            )}
          </div>

          {/* Progress bar */}
          <div className="sm:w-44 shrink-0">
            <div className="flex justify-between text-xs text-white/40 mb-1.5 font-medium">
              <span>Completion</span>
              <span className="text-white font-semibold">{pct}%</span>
            </div>
            <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700 ease-out shadow-sm shadow-violet-500/50"
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
