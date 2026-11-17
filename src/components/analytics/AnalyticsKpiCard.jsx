import React from 'react';

/**
 * Analytics Metric KPI Tile
 */
export default function AnalyticsKpiCard({
  title = '',
  value = '',
  subtitle = '',
  icon: Icon,
  color = 'purple', // 'purple' | 'emerald' | 'amber' | 'cyan' | 'pink' | 'red'
  badge = null
}) {
  const colorMap = {
    purple: { card: 'bg-white', bg: 'bg-purple-100', text: 'text-[#7E22CE]', border: 'border-purple-200', textVal: 'text-sq-gradient' },
    emerald: { card: 'bg-emerald-50', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', textVal: 'text-emerald-800' },
    amber: { card: 'bg-yellow-50', bg: 'bg-yellow-100', text: 'text-amber-900', border: 'border-amber-300', textVal: 'text-amber-900' },
    cyan: { card: 'bg-blue-50', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', textVal: 'text-blue-800' },
    blue: { card: 'bg-blue-50', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', textVal: 'text-blue-800' },
    pink: { card: 'bg-pink-50', bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200', textVal: 'text-sq-gradient' },
    red: { card: 'bg-rose-50', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200', textVal: 'text-rose-700' }
  };

  const theme = colorMap[color] || colorMap.purple;

  return (
    <div className={`${theme.card} rounded-2xl p-5 border ${theme.border} shadow-2xs space-y-2.5 transition-all hover:shadow-xs`}>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.text} font-mono`}>
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl ${theme.bg} ${theme.text}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <div className={`text-2xl font-black font-mono tracking-tight ${theme.textVal}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-600 font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>

      {badge && (
        <div className={`pt-2 border-t ${theme.border} flex items-center justify-between text-[10px] font-mono font-bold text-slate-600`}>
          <span>Target / Status</span>
          <span className={theme.text}>{badge}</span>
        </div>
      )}
    </div>
  );
}
