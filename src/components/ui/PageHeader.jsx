import React from 'react';
import { getCategoryTheme } from '../../theme/categoryTheme';

/**
 * Universal Page Header Component
 * Pure white surface with category-based text & border colors:
 * course (blue), internship (green), project/product (golden yellow), gradient (pink-to-violet text).
 */
export default function PageHeader({
  title,
  subtitle = null,
  badge = null,
  icon: Icon = null,
  actions = null,
  category = 'gradient',
  className = ''
}) {
  const theme = getCategoryTheme(category);
  return (
    <div className={`${theme.surface} flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-2xl border ${theme.border} ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center space-x-2.5">
          {Icon && (
            <div className={`w-8 h-8 rounded-lg ${theme.badge} ${theme.icon} flex items-center justify-center border ${theme.border} shrink-0`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h1 className={`text-xl md:text-2xl font-black tracking-tight ${theme.heading}`}>{title}</h1>
          {badge && (
            <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${theme.badge} border ${theme.border}`}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className={`text-xs ${theme.subtext} max-w-2xl`}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center space-x-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
