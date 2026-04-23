import React, { memo, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:   'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 ring-1 ring-white/10',
  secondary: 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-slate-100 ring-1 ring-white/10',
  danger:    'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-500/20 ring-1 ring-white/10',
  ghost:     'text-slate-400 hover:bg-white/5 hover:text-slate-200',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-xl',
  lg: 'px-5 py-2.5 text-base gap-2 rounded-xl',
};

export const Button = memo(({ variant = 'secondary', size = 'md', loading, children, className = '', disabled, ...rest }: ButtonProps) => (
  <button
    {...rest}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:opacity-40 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
  >
    {loading && (
      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    )}
    {children}
  </button>
));

Button.displayName = 'Button';
export default Button;
