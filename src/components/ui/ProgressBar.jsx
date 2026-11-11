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
    blue: 'bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91]',
    purple: 'bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91]',
    green: 'bg-emerald-600',
    yellow: 'bg-amber-500',
    red: 'bg-red-600'
  };

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-mono text-slate-500 ml-auto">{percent}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 border border-slate-200/80 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${fillColors[activeColor] || fillColors.blue} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
