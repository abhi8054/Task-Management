import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  error?: boolean;
}

interface PopupPos {
  top: number;
  left: number;
  width: number;
}

export const Select = memo(({ value, onChange, options, className = '', error }: SelectProps) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopupPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const computePos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  const handleToggle = useCallback(() => {
    if (!open) computePos();
    setOpen((o) => !o);
  }, [open, computePos]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      // also allow clicks inside the portal popup — handled by portal's own buttons
      setOpen(false);
    };
    const closeKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const closeScroll = () => setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', closeKey);
    window.addEventListener('scroll', closeScroll, true);
    window.addEventListener('resize', closeScroll);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', closeKey);
      window.removeEventListener('scroll', closeScroll, true);
      window.removeEventListener('resize', closeScroll);
    };
  }, [open]);

  const handleSelect = useCallback((val: string) => {
    onChange(val);
    setOpen(false);
  }, [onChange]);

  const borderCls = error
    ? 'border-red-400 focus:ring-red-300/40'
    : 'border-slate-200 focus:ring-indigo-500/40 focus:border-indigo-400';

  const openCls = open
    ? `ring-2 bg-white ${error ? 'ring-red-300/40' : 'ring-indigo-500/40 border-indigo-400'}`
    : '';

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm bg-slate-50 border rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:bg-white transition-all cursor-pointer ${borderCls} ${openCls}`}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && pos && createPortal(
        <div
          style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-scale-in"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm text-left transition-colors whitespace-nowrap
                  ${active
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <span>{opt.label}</span>
                {active && <Check size={13} className="text-indigo-500 shrink-0" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
});

Select.displayName = 'Select';
