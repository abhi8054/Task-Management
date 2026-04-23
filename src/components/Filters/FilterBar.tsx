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

  // Sync debounced search to context
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
    <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks by title…"
              value={searchInput}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all placeholder:text-slate-400"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); setFilter({ search: '' }); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <SlidersHorizontal size={15} className="text-slate-400 shrink-0" />

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
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                <X size={13} /> Clear
              </Button>
            )}
          </div>

          {/* Result count */}
          {isFiltered && (
            <p className="text-xs text-slate-500 shrink-0">
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
