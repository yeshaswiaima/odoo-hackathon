import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(({
  label,
  error,
  helperText,
  options = [],
  className = '',
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-brand-navy mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        <select
          ref={ref}
          id={selectId}
          className={`block w-full appearance-none rounded-lg border text-sm py-2.5 pl-3.5 pr-10 bg-white transition-colors
            ${error
              ? 'border-brand-danger focus:border-brand-danger focus:ring-brand-danger/20 text-brand-danger'
              : 'border-brand-border text-brand-navy focus:border-brand-blue focus:ring-2 focus:ring-blue-100'
            }
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        >
          {children ? children : options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-muted">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-brand-danger font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-brand-muted">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
