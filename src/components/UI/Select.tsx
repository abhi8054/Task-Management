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
  const popupRef   = useRef<HTMLDivElement>(null);

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
      if (popupRef.current?.contains(target)) return;
      setOpen(false);
    };
    const closeKey    = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
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
    ? 'border-rose-500/40 focus:ring-rose-500/20'
    : 'border-white/10 focus:ring-violet-500/30 focus:border-violet-500/40';

  const openCls = open
    ? `ring-2 bg-white/8 ${error ? 'ring-rose-500/20 border-rose-500/40' : 'ring-violet-500/30 border-violet-500/40'}`
    : '';

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white/5 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 transition-all cursor-pointer ${borderCls} ${openCls}`}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-slate-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && pos && createPortal(
        <div
          ref={popupRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999, background: 'rgba(10,13,30,0.98)', backdropFilter: 'blur(20px)' }}
          className="border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden animate-scale-in"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-left transition-colors whitespace-nowrap
                  ${active
                    ? 'bg-violet-500/15 text-violet-300 font-medium'
                    : 'text-slate-300 hover:bg-white/5 hover:text-slate-100'}`}
              >
                <span>{opt.label}</span>
                {active && <Check size={12} className="text-violet-400 shrink-0" />}
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
