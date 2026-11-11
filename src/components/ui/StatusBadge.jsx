import React from 'react';
import { CheckCircle2, XCircle, Clock, Info } from 'lucide-react';

/**
 * Universal Status Badge Component
 * Consistently represents state using color + icon + text:
 * - Green: Completed, Passed, Active, Success
 * - Yellow: Pending, In Progress, Review
 * - Red: Failed, Inactive, Blocked, Error
 * - Blue: Info, New, Running
 */
export default function StatusBadge({
  status = 'active',
  label = null,
  size = 'md',
  className = ''
}) {
  const norm = String(status).toLowerCase().replace(/[\s-_]+/g, '');

  let variant = 'green';
  let Icon = CheckCircle2;
  let text = label || status;

  if (norm.includes('pass') || norm.includes('complete') || norm.includes('active') || norm.includes('success')) {
    variant = 'green';
    Icon = CheckCircle2;
  } else if (norm.includes('pend') || norm.includes('progress') || norm.includes('review') || norm.includes('wait')) {
    variant = 'yellow';
    Icon = Clock;
  } else if (norm.includes('fail') || norm.includes('block') || norm.includes('inactive') || norm.includes('error') || norm.includes('danger')) {
    variant = 'red';
    Icon = XCircle;
  } else {
    variant = 'blue';
    Icon = Info;
  }

  const styles = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-50 text-amber-800 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-purple-50 text-purple-700 border-purple-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5'
  };

  return (
    <span
      className={`inline-flex items-center font-bold font-mono uppercase tracking-wider rounded-lg border ${styles[variant]} ${sizes[size] || sizes.md} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{text}</span>
    </span>
  );
}
