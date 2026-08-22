import React from 'react';

export const StatusBadge = ({ status = '', size = 'md', className = '' }) => {
  const normalized = String(status).toLowerCase().trim().replace(/[-_]/g, ' ');

  let label = status;
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let dot = 'bg-slate-400';

  if (['present', 'approved', 'active', 'paid'].includes(normalized)) {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dot = 'bg-emerald-500';
    if (normalized === 'present') label = 'Present';
    if (normalized === 'approved') label = 'Approved';
    if (normalized === 'active') label = 'Active';
    if (normalized === 'paid') label = 'Paid';
  } else if (['absent', 'rejected', 'danger', 'inactive'].includes(normalized)) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    dot = 'bg-rose-500';
    if (normalized === 'absent') label = 'Absent';
    if (normalized === 'rejected') label = 'Rejected';
    if (normalized === 'inactive') label = 'Inactive';
  } else if (['pending', 'half day', 'halfday', 'processing'].includes(normalized)) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    dot = 'bg-amber-500';
    if (normalized === 'pending') label = 'Pending';
    if (normalized === 'half day') label = 'Half Day';
    if (normalized === 'processing') label = 'Processing';
  } else if (['leave', 'on leave'].includes(normalized)) {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
    dot = 'bg-blue-500';
    label = 'On Leave';
  } else if (['not checked in', 'not_checked_in'].includes(normalized)) {
    bg = 'bg-slate-100 text-slate-600 border-slate-200';
    dot = 'bg-slate-400';
    label = 'Not Checked In';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${bg} ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
