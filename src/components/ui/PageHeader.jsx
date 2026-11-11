import React from 'react';

/**
 * Universal Page Header Component
 * Light surface, blue heading, optional icon, subtitle, and action buttons.
 */
export default function PageHeader({
  title,
  subtitle = null,
  badge = null,
  icon: Icon = null,
  actions = null,
  className = ''
}) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200/90 ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center space-x-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">{title}</h1>
          {badge && (
            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center space-x-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
