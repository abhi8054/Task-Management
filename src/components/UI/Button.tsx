import React, { memo, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:   'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-200',
  secondary: 'bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 ring-1 ring-slate-200 shadow-sm',
  danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-200',
  ghost:     'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
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
    className={`inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
  >
    {loading && (
      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    )}
    {children}
  </button>
));

Button.displayName = 'Button';
export default Button;
