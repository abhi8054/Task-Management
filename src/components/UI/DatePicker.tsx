import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD or ''
  onChange: (value: string) => void;
  className?: string;
  error?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function parseLocal(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDisplay(value: string): string {
  const d = parseLocal(value);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface PopupPos {
  top: number;
  left: number;
}

export const DatePicker = memo(({ value, onChange, className = '', error }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopupPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  const selected = parseLocal(value);
  const [view, setView] = useState({
    month: selected ? selected.getMonth() : today.getMonth(),
    year: selected ? selected.getFullYear() : today.getFullYear(),
  });

  useEffect(() => {
    if (selected) setView({ month: selected.getMonth(), year: selected.getFullYear() });
  }, [value]);

  const computePos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    // Show above if not enough space below (popup ~320px tall)
    const spaceBelow = window.innerHeight - r.bottom;
    setPos(spaceBelow >= 320
      ? { top: r.bottom + 4, left: r.left }
      : { top: r.top - 324, left: r.left }
    );
  }, []);

  const handleToggle = useCallback(() => {
    if (!open) computePos();
    setOpen((o) => !o);
  }, [open, computePos]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const handleScroll = () => setOpen(false);
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [open]);

  const prevMonth = useCallback(() =>
    setView(v => v.month === 0 ? { month: 11, year: v.year - 1 } : { month: v.month - 1, year: v.year }),
  []);

  const nextMonth = useCallback(() =>
    setView(v => v.month === 11 ? { month: 0, year: v.year + 1 } : { month: v.month + 1, year: v.year }),
  []);

  const selectDay = useCallback((day: number) => {
    onChange(toISO(view.year, view.month, day));
    setOpen(false);
  }, [view, onChange]);

  const selectToday = useCallback(() => {
    onChange(toISO(today.getFullYear(), today.getMonth(), today.getDate()));
    setOpen(false);
  }, [onChange]);

  const clearDate = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange('');
  }, [onChange]);

  // Build calendar grid
  const firstDow = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isSelected = (day: number) =>
    !!selected &&
    day === selected.getDate() &&
    view.month === selected.getMonth() &&
    view.year === selected.getFullYear();

  const isToday = (day: number) =>
    day === today.getDate() &&
    view.month === today.getMonth() &&
    view.year === today.getFullYear();

  const borderCls = error
    ? 'border-red-400 focus:ring-red-300/40'
    : 'border-slate-200 focus:ring-indigo-500/40 focus:border-indigo-400';

  const openCls = open
    ? `ring-2 bg-white ${error ? 'ring-red-300/40' : 'ring-indigo-500/40 border-indigo-400'}`
    : '';

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm bg-slate-50 border rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:bg-white ${borderCls} ${openCls} ${value ? 'text-slate-700' : 'text-slate-400'}`}
      >
        <Calendar size={14} className="shrink-0 text-slate-400" />
        <span className="flex-1 text-left">{value ? formatDisplay(value) : 'Pick a date'}</span>
        {value
          ? <X size={13} className="shrink-0 text-slate-400 hover:text-red-400 transition-colors" onClick={clearDate} />
          : <ChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        }
      </button>

      {open && pos && createPortal(
        <div
          ref={popupRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: 288, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-scale-in"
        >
          {/* Month / year nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm font-semibold text-slate-700 select-none">
              {MONTHS[view.month]} {view.year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAY_HEADERS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-400">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const sel = isSelected(day);
              const tod = isToday(day);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center text-sm rounded-full transition-colors
                    ${sel
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : tod
                        ? 'border border-indigo-400 text-indigo-600 font-medium hover:bg-indigo-50'
                        : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={selectToday}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => clearDate()}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';
