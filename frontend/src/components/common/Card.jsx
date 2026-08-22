import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = 'p-6',
  headerClassName = 'p-6 pb-4 border-b border-brand-border',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-brand-border shadow-card transition-shadow ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className={`flex items-center justify-between ${headerClassName}`}>
          <div>
            {title && <h3 className="text-base font-semibold text-brand-navy leading-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-brand-muted mt-1 leading-normal">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};

export default Card;
