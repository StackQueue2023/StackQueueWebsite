import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * Interactive Analytics Bar Chart
 * 
 * Replaces circular donut/pie charts with a clean, readable horizontal bar distribution.
 * Preserves existing drill-down filtering, active selection, dynamic ranking, and percentages.
 */
export default function AnalyticsBarChart({
  title = 'Distribution',
  subtitle = '',
  data = [], // [{ name, count, percentage, color, id }]
  centerLabel = '',
  centerValue = null,
  selectedSegment = null,
  selectedItem = null,
  onSelectSegment = null,
  onSelectItem = null,
  showLegend = true,
  legendPosition = 'bottom',
  maxItems = 8,
  valuePrefix = '',
  valueSuffix = ''
}) {
  const activeSelection = selectedSegment !== undefined && selectedSegment !== null ? selectedSegment : selectedItem;
  const handleSelect = onSelectSegment || onSelectItem;

  const total = Number(centerValue) > 0
    ? Number(centerValue)
    : data.reduce((sum, item) => sum + (Number(item.count) || 0), 0);

  const displayData = data.slice(0, maxItems);
  const maxCount = Math.max(...displayData.map(d => Number(d.count) || 0), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-blue-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 border-b border-slate-100 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
              {title}
            </h4>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {total > 0 && (
            <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              {centerLabel ? `${centerLabel}: ` : 'Total: '}<strong>{total.toLocaleString()}</strong>
            </span>
          )}
          {activeSelection && (
            <button
              onClick={() => handleSelect && handleSelect(null)}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 transition cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bar Distribution */}
      {displayData.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 font-semibold">
          No records to display
        </div>
      ) : (
        <div className="space-y-2.5 my-2">
          {displayData.map((item, idx) => {
            const count = Number(item.count) || 0;
            const pct = item.percentage !== undefined
              ? item.percentage
              : total > 0
              ? Math.round((count / total) * 100)
              : 0;
            const barWidth = Math.max(4, Math.round((count / maxCount) * 100));
            const isSelected = activeSelection && (
              activeSelection === item.name ||
              activeSelection === item.id ||
              activeSelection === item
            );
            const barColor = item.color || ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'][idx % 7];

            return (
              <div
                key={item.id || item.name + idx}
                onClick={() => handleSelect && handleSelect(item.name || item.id)}
                className={`group cursor-pointer p-2 rounded-xl transition-all ${
                  isSelected ? 'bg-blue-50/70 ring-2 ring-blue-500' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: barColor }}
                    />
                    <span className="font-semibold text-slate-800 truncate group-hover:text-blue-700 transition">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 font-mono">
                    <span className="font-bold text-slate-900 text-xs">
                      {valuePrefix}{count.toLocaleString()}{valueSuffix}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                  <div
                    className="h-full rounded-full transition-all duration-700"
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

      {/* Footer Meta */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>Segments: {displayData.length}</span>
        <span>Total: {total.toLocaleString()}</span>
      </div>
    </div>
  );
}
