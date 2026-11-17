import React from 'react';

/**
 * Universal Card Component
 * Standardized pure White background, subtle border, rounded corners, soft shadow.
 * Optional accent tops for XP (yellow), Progress (blue), Completed (green), Error (red).
 */
export default function Card({
  children,
  className = '',
  accent = null, // 'course' | 'internship' | 'project' | 'product' | 'blue' | 'green' | 'yellow' | 'purple' | null
  hover = true,
  onClick = null,
  ...props
}) {
  const accentClasses = {
    course: 'bg-blue-50 border-blue-200 border-t-4 border-t-blue-600 text-blue-900',
    blue: 'bg-blue-50 border-blue-200 border-t-4 border-t-blue-600 text-blue-900',
    internship: 'bg-emerald-50 border-emerald-200 border-t-4 border-t-emerald-600 text-emerald-900',
    green: 'bg-emerald-50 border-emerald-200 border-t-4 border-t-emerald-600 text-emerald-900',
    project: 'bg-yellow-50 border-amber-300 border-t-4 border-t-amber-600 text-amber-950',
    product: 'bg-yellow-50 border-amber-300 border-t-4 border-t-amber-600 text-amber-950',
    yellow: 'bg-yellow-50 border-amber-300 border-t-4 border-t-amber-500 text-amber-950',
    purple: 'bg-gradient-to-br from-pink-50 via-white to-purple-50 border-purple-200 border-t-4 border-t-[#9333EA]',
    gradient: 'bg-gradient-to-br from-pink-50 via-white to-purple-50 border-purple-200 border-t-4 border-t-[#9333EA]'
  };

  const defaultSurface = accent && accentClasses[accent]
    ? accentClasses[accent]
    : 'bg-white border-slate-200/90';

  const hoverClass = hover ? 'hover:shadow-md transition-all duration-200' : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`border rounded-2xl p-5 shadow-sm ${defaultSurface} ${hoverClass} ${cursorClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
