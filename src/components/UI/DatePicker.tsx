import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  value: string;
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

interface PopupPos { top: number; left: number; }

export const DatePicker = memo(({ value, onChange, className = '', error }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopupPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef   = useRef<HTMLDivElement>(null);
  const today = new Date();

  const selected = parseLocal(value);
  const [view, setView] = useState({
    month: selected ? selected.getMonth() : today.getMonth(),
    year:  selected ? selected.getFullYear() : today.getFullYear(),
  });

  useEffect(() => {
    if (selected) setView({ month: selected.getMonth(), year: selected.getFullYear() });
  }, [value]);

  const computePos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    setPos(spaceBelow >= 320
      ? { top: r.bottom + 4, left: r.left }
      : { top: r.top - 324,  left: r.left }
    );
  }, []);

  const handleToggle = useCallback(() => {
    if (!open) computePos();
    setOpen((o) => !o);
  }, [open, computePos]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popupRef.current?.contains(t)) return;
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
    setView(v => v.month === 0 ? { month: 11, year: v.year - 1 } : { month: v.month - 1, year: v.year }), []);
  const nextMonth = useCallback(() =>
    setView(v => v.month === 11 ? { month: 0, year: v.year + 1 } : { month: v.month + 1, year: v.year }), []);

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

  const firstDow = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isSelected = (day: number) =>
    !!selected && day === selected.getDate() && view.month === selected.getMonth() && view.year === selected.getFullYear();
  const isToday = (day: number) =>
    day === today.getDate() && view.month === today.getMonth() && view.year === today.getFullYear();

  const borderCls = error
    ? 'border-rose-500/40 focus:ring-rose-500/20'
    : 'border-white/10 focus:ring-violet-500/30 focus:border-violet-500/40';

  const openCls = open
    ? `ring-2 ${error ? 'ring-rose-500/20 border-rose-500/40' : 'ring-violet-500/30 border-violet-500/40'}`
    : '';

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm bg-white/5 border rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 ${borderCls} ${openCls} ${value ? 'text-slate-200' : 'text-slate-500'}`}
      >
        <Calendar size={14} className="shrink-0 text-slate-500" />
        <span className="flex-1 text-left">{value ? formatDisplay(value) : 'Pick a date'}</span>
        {value
          ? <X size={13} className="shrink-0 text-slate-500 hover:text-rose-400 transition-colors" onClick={clearDate} />
          : <ChevronDown size={13} className={`shrink-0 text-slate-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        }
      </button>

      {open && pos && createPortal(
        <div
          ref={popupRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: 280, zIndex: 9999, background: 'rgba(10,13,30,0.98)', backdropFilter: 'blur(20px)' }}
          className="border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-scale-in"
        >
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg text-slate-500 hover:bg-white/10 hover:text-slate-200 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-semibold text-slate-200 select-none">
              {MONTHS[view.month]} {view.year}
            </span>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg text-slate-500 hover:bg-white/10 hover:text-slate-200 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAY_HEADERS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-600">{d}</div>
            ))}
          </div>

          {/* Days */}
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
                      ? 'bg-violet-600 text-white font-semibold shadow-sm shadow-violet-500/40'
                      : tod
                        ? 'border border-violet-500/40 text-violet-400 hover:bg-violet-500/10'
                        : 'text-slate-400 hover:bg-white/10 hover:text-slate-100'
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/[0.08] flex items-center justify-between">
            <button type="button" onClick={selectToday} className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors">
              Today
            </button>
            {value && (
              <button type="button" onClick={() => clearDate()} className="text-xs text-slate-600 hover:text-rose-400 transition-colors">
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
