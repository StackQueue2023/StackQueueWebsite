import React, { useState } from 'react';

/**
 * Interactive Analytics Donut Chart
 * Features:
 * - Pure SVG rendering with zero external library overhead
 * - Interactive slice click for drill-down filtering
 * - Hover tooltip with count and percentage
 * - Center display with dynamic total or hovered segment
 * - Interactive legend with active indicator
 */
export default function AnalyticsDonutChart({
  title = 'Distribution',
  subtitle = '',
  data = [], // [{ name, count, percentage, color, id }]
  size = 240,
  strokeWidth = 32,
  centerLabel = 'Total',
  centerValue = null,
  selectedSegment = null,
  onSelectSegment = null,
  showLegend = true,
  legendPosition = 'bottom' // 'bottom' | 'right'
}) {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const total = data.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute SVG stroke-dasharray & stroke-dashoffset for each segment
  let cumulativePercent = 0;
  const segments = data
    .filter(item => (Number(item.count) || 0) > 0)
    .map((item, idx) => {
      const count = Number(item.count) || 0;
      const percent = total > 0 ? (count / total) : 0;
      const strokeDasharray = `${percent * circumference} ${circumference}`;
      const strokeDashoffset = -cumulativePercent * circumference;
      cumulativePercent += percent;

      const isSelected = selectedSegment && (
        selectedSegment === item.name ||
        selectedSegment === item.id ||
        selectedSegment === item
      );
      const isHovered = hoveredSegment && hoveredSegment.name === item.name;

      return {
        ...item,
        percent: Math.round(percent * 100),
        strokeDasharray,
        strokeDashoffset,
        color: item.color || ['#8B2BE2', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#06B6D4', '#6366F1'][idx % 7],
        isSelected,
        isHovered
      };
    });

  const activeDisplay = hoveredSegment || (selectedSegment ? segments.find(s => s.isSelected) : null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-purple-200">
      {/* Title */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
            {title}
          </h4>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {selectedSegment && (
          <button
            onClick={() => onSelectSegment && onSelectSegment(null)}
            className="text-[10px] font-bold text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 transition"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {segments.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 font-semibold">
          No records to display
        </div>
      ) : (
        <div className={`flex items-center justify-center my-3 ${legendPosition === 'right' ? 'flex-row gap-6' : 'flex-col gap-4'}`}>
          {/* Circular SVG Donut */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90"
            >
              {/* Background Track Circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />

              {/* Segments */}
              {segments.map((seg, idx) => (
                <circle
                  key={seg.id || seg.name || idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={seg.isSelected || seg.isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    filter: seg.isSelected ? 'drop-shadow(0 0 6px rgba(139, 43, 226, 0.45))' : 'none',
                    opacity: selectedSegment && !seg.isSelected ? 0.45 : 1
                  }}
                  onMouseEnter={() => setHoveredSegment(seg)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() => {
                    if (onSelectSegment) {
                      onSelectSegment(seg.isSelected ? null : seg.name);
                    }
                  }}
                />
              ))}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono truncate max-w-[120px]">
                {activeDisplay ? activeDisplay.name : centerLabel}
              </span>
              <span className="text-xl font-black text-slate-900 font-mono">
                {activeDisplay
                  ? (activeDisplay.count?.toLocaleString?.() || activeDisplay.count)
                  : (centerValue !== null ? centerValue : total.toLocaleString())}
              </span>
              {activeDisplay && (
                <span className="text-[11px] font-bold text-purple-600 font-mono">
                  {activeDisplay.percent}%
                </span>
              )}
            </div>
          </div>

          {/* Interactive Legend */}
          {showLegend && (
            <div className={`w-full ${legendPosition === 'right' ? 'flex-1 space-y-1.5' : 'grid grid-cols-2 gap-2 pt-2'}`}>
              {segments.map((seg, idx) => {
                const isSelected = selectedSegment && (selectedSegment === seg.name || selectedSegment === seg.id);
                return (
                  <button
                    key={seg.id || seg.name + idx}
                    type="button"
                    onClick={() => onSelectSegment && onSelectSegment(isSelected ? null : seg.name)}
                    onMouseEnter={() => setHoveredSegment(seg)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    className={`flex items-center justify-between text-left p-1.5 rounded-xl text-xs transition-all w-full ${
                      isSelected
                        ? 'bg-purple-50 ring-1 ring-purple-300 font-bold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate pr-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="truncate text-slate-700 text-[11px]">
                        {seg.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0 text-[11px] font-mono">
                      <span className="font-bold text-slate-900">{seg.count?.toLocaleString()}</span>
                      <span className="text-slate-400 text-[10px]">({seg.percent}%)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Summary Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Segments: {segments.length}</span>
        <span className="font-bold text-slate-700">Total: {total.toLocaleString()}</span>
      </div>
    </div>
  );
}
