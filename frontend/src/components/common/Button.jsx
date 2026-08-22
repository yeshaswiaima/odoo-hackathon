import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-brand-blue hover:bg-brand-blue-hover text-white focus:ring-blue-500 shadow-sm',
    secondary: 'bg-white hover:bg-slate-50 text-brand-navy border border-brand-border focus:ring-slate-300 shadow-sm',
    danger: 'bg-brand-danger hover:bg-red-700 text-white focus:ring-red-500 shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100 text-brand-muted hover:text-brand-navy focus:ring-slate-200',
    outline: 'bg-transparent border border-brand-blue text-brand-blue hover:bg-blue-50 focus:ring-blue-400',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
