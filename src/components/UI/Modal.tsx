import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, title, onClose, children, maxWidth = 'max-w-xl' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ animation: 'fade-in 0.15s ease-out' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full ${maxWidth} rounded-2xl shadow-2xl shadow-black/60 flex flex-col max-h-[90vh] border border-white/10`}
        style={{ background: 'rgba(10,13,30,0.95)', backdropFilter: 'blur(24px)', animation: 'slide-up 0.2s ease-out' }}
        role="dialog"
        aria-modal
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <h2 className="text-base font-semibold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
