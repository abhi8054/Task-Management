import React, { memo, useCallback, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import { useDebounce } from '../../hooks/useDebounce';
import type { Priority, Status } from '../../types/task';
import { Button } from '../UI/Button';
import { Select } from '../UI/Select';

const PRIORITIES = [
  { value: 'all',    label: 'All Priorities' },
  { value: 'high',   label: '🔴 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low',    label: '🟢 Low' },
];

const STATUSES = [
  { value: 'all',         label: 'All Statuses' },
  { value: 'todo',        label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done',        label: 'Done' },
];

const FilterBar = memo(() => {
  const { filters, setFilter, clearFilters, filteredTasks, tasks } = useTaskContext();
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  React.useEffect(() => {
    setFilter({ search: debouncedSearch });
  }, [debouncedSearch, setFilter]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setSearchInput('');
    clearFilters();
  }, [clearFilters]);

  const isFiltered = filters.priority !== 'all' || filters.status !== 'all' || filters.search !== '';
  const hiddenCount = tasks.length - filteredTasks.length;

  return (
    <div className="border-b border-white/[0.06] sticky top-0 z-30" style={{ background: 'rgba(8,12,24,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks…"
              value={searchInput}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 focus:bg-white/8 transition-all"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); setFilter({ search: '' }); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <SlidersHorizontal size={14} className="text-slate-500 shrink-0" />

            <Select
              value={filters.priority}
              onChange={(v) => setFilter({ priority: v as Priority | 'all' })}
              options={PRIORITIES}
              className="w-36"
            />

            <Select
              value={filters.status}
              onChange={(v) => setFilter({ status: v as Status | 'all' })}
              options={STATUSES}
              className="w-36"
            />

            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                <X size={13} /> Clear
              </Button>
            )}
          </div>

          {isFiltered && (
            <p className="text-xs text-slate-500 shrink-0 font-medium">
              {filteredTasks.length} shown{hiddenCount > 0 && `, ${hiddenCount} hidden`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

FilterBar.displayName = 'FilterBar';
export default FilterBar;
