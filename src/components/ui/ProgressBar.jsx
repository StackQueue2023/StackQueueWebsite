import React from 'react';

/**
 * Universal Progress Bar Component
 * Primary: Blue
 * 100% Completed: Green
 * Warning / Pending: Yellow
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label = null,
  showPercentage = true,
  color = 'blue', // 'blue' | 'green' | 'yellow' | 'red'
  height = 'h-2.5',
  className = ''
}) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  // Auto-switch to green if 100% and default color
  let activeColor = color;
  if (color === 'blue' && percent >= 100) {
    activeColor = 'green';
  }

  const fillColors = {
    blue: 'bg-blue-600',
    course: 'bg-blue-600',
    purple: 'bg-gradient-to-r from-[#EC4899] via-[#DB2777] to-[#9333EA]',
    gradient: 'bg-gradient-to-r from-[#EC4899] via-[#DB2777] to-[#9333EA]',
    green: 'bg-emerald-600',
    internship: 'bg-emerald-600',
    yellow: 'bg-amber-500',
    project: 'bg-amber-600',
    product: 'bg-amber-600',
    red: 'bg-rose-600'
  };

  const trackColors = {
    blue: 'bg-blue-100 border-blue-200',
    course: 'bg-blue-100 border-blue-200',
    purple: 'bg-purple-100 border-purple-200',
    gradient: 'bg-purple-100 border-purple-200',
    green: 'bg-emerald-100 border-emerald-200',
    internship: 'bg-emerald-100 border-emerald-200',
    yellow: 'bg-yellow-100 border-amber-200',
    project: 'bg-yellow-100 border-amber-200',
    product: 'bg-yellow-100 border-amber-200',
    red: 'bg-rose-100 border-rose-200'
  };

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-mono text-slate-700 ml-auto">{percent}%</span>}
        </div>
      )}
      <div className={`w-full border rounded-full overflow-hidden ${trackColors[activeColor] || trackColors.blue} ${height}`}>
        <div
          className={`${height} ${fillColors[activeColor] || fillColors.blue} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
