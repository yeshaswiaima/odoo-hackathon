import React from 'react';

export const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  if (type === 'table') {
    return (
      <div className="w-full animate-pulse space-y-4">
        <div className="h-10 bg-slate-200 rounded-lg w-full" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-lg w-full flex items-center px-4 space-x-4">
            <div className="h-8 w-8 bg-slate-200 rounded-full flex-shrink-0" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-1/6" />
            <div className="h-4 bg-slate-200 rounded w-1/6 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-5 bg-white border border-brand-border rounded-xl shadow-card animate-pulse space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-slate-200 rounded w-24" />
              <div className="h-9 w-9 bg-slate-200 rounded-lg" />
            </div>
            <div className="h-7 bg-slate-200 rounded w-16" />
            <div className="h-3 bg-slate-100 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 bg-white border border-brand-border rounded-xl shadow-card animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-10 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
