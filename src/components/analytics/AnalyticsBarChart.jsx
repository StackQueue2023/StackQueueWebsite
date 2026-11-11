import React from 'react';

/**
 * Interactive Analytics Bar Chart
 * Features:
 * - Horizontal bar distribution with animated fill
 * - Dynamic ranking and percentage badges
 * - Click to filter drill-down functionality
 * - Responsive layout with hover effects
 */
export default function AnalyticsBarChart({
  title = 'Ranking & Distribution',
  subtitle = '',
  data = [], // [{ name, count, color, id }]
  maxItems = 8,
  selectedItem = null,
  onSelectItem = null,
  valuePrefix = '',
  valueSuffix = ''
}) {
  const displayData = data.slice(0, maxItems);
  const maxCount = Math.max(...displayData.map(d => Number(d.count) || 0), 1);
  const totalCount = displayData.reduce((acc, d) => acc + (Number(d.count) || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-purple-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
            {title}
          </h4>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {selectedItem && (
          <button
            onClick={() => onSelectItem && onSelectItem(null)}
            className="text-[10px] font-bold text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 transition"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Bar Items */}
      {displayData.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 font-semibold">
          No records to display
        </div>
      ) : (
        <div className="space-y-3">
          {displayData.map((item, idx) => {
            const count = Number(item.count) || 0;
            const pct = Math.round((count / (totalCount || 1)) * 100);
            const barWidth = Math.max(4, Math.round((count / maxCount) * 100));
            const isSelected = selectedItem && (selectedItem === item.name || selectedItem === item.id);
            const barColor = item.color || ['#8B2BE2', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#06B6D4', '#6366F1'][idx % 7];

            return (
              <div
                key={item.id || item.name + idx}
                onClick={() => onSelectItem && onSelectItem(item.name)}
                className={`group cursor-pointer p-2 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-purple-50/80 ring-2 ring-purple-500'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400 w-4">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 truncate group-hover:text-purple-700 transition">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {valuePrefix}{count.toLocaleString()}{valueSuffix}
                    </span>
                    <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: barColor
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Displaying Top {displayData.length} records</span>
        <span className="font-bold text-slate-700">Total: {valuePrefix}{totalCount.toLocaleString()}{valueSuffix}</span>
      </div>
    </div>
  );
}
