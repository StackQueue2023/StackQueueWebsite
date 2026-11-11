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
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', textVal: 'text-purple-700' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', textVal: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', textVal: 'text-amber-600' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100', textVal: 'text-cyan-600' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', textVal: 'text-pink-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', textVal: 'text-red-600' }
  };

  const theme = colorMap[color] || colorMap.purple;

  return (
    <div className={`bg-white rounded-2xl p-5 border ${theme.border} shadow-2xs space-y-2.5 transition-all hover:shadow-xs hover:border-slate-300`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
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
          <p className="text-[11px] text-slate-400 font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>

      {badge && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono font-bold text-slate-500">
          <span>Target / Status</span>
          <span className="text-purple-600">{badge}</span>
        </div>
      )}
    </div>
  );
}
