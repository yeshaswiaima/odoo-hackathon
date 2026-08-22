import React from 'react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  trendLabel,
  color = 'blue', // 'blue' | 'green' | 'amber' | 'purple' | 'slate' | 'red'
  onClick,
  className = '',
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-brand-blue',
      border: 'hover:border-blue-300',
    },
    green: {
      bg: 'bg-emerald-50',
      text: 'text-brand-success',
      border: 'hover:border-emerald-300',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-brand-warning',
      border: 'hover:border-amber-300',
    },
    red: {
      bg: 'bg-rose-50',
      text: 'text-brand-danger',
      border: 'hover:border-rose-300',
    },
    purple: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-300',
    },
    slate: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'hover:border-slate-300',
    },
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-brand-border p-5 shadow-card transition-all ${
        onClick ? 'cursor-pointer hover:shadow-card-hover ' + currentTheme.border : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${currentTheme.bg} ${currentTheme.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-brand-navy">{value}</span>
      </div>

      {(trend || trendLabel) && (
        <div className="mt-2 flex items-center text-xs">
          {trend && (
            <span
              className={`font-semibold mr-1.5 ${
                trendDirection === 'up'
                  ? 'text-emerald-600'
                  : trendDirection === 'down'
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}
            >
              {trend}
            </span>
          )}
          {trendLabel && <span className="text-brand-muted">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
