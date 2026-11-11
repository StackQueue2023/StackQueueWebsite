import React from 'react';

/**
 * Universal Card Component
 * Standardized pure White background, subtle border, rounded corners, soft shadow.
 * Optional accent tops for XP (yellow), Progress (blue), Completed (green), Error (red).
 */
export default function Card({
  children,
  className = '',
  accent = null, // 'blue' | 'green' | 'yellow' | 'red' | null
  hover = true,
  onClick = null,
  ...props
}) {
  const accentClasses = {
    blue: 'border-t-4 border-t-purple-600',
    purple: 'border-t-4 border-t-purple-600',
    green: 'border-t-4 border-t-emerald-600',
    yellow: 'border-t-4 border-t-amber-500',
    red: 'border-t-4 border-t-red-600'
  };

  const hoverClass = hover ? 'hover:border-purple-200 hover:shadow-md transition-all duration-200' : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm ${hoverClass} ${cursorClass} ${accent ? accentClasses[accent] || '' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
