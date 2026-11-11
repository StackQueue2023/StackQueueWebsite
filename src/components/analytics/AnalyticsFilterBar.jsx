import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

/**
 * Analytics Slicer & Filter Toolbar
 */
export default function AnalyticsFilterBar({
  searchQuery = '',
  onSearchChange = () => {},
  filters = [], // [{ key, label, value, options: [{ label, value }], onChange }]
  onClearFilters = () => {},
  hasActiveFilters = false,
  totalRecords = 0,
  recordLabel = 'Records'
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Left Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter table records..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Slicers / Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5">
        {filters.map((f) => (
          <div key={f.key} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">{f.label}:</span>
            <select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none text-xs cursor-pointer"
            >
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold border border-purple-200 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}

        {/* Counter Badge */}
        <div className="text-[11px] font-mono text-slate-500 font-bold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">
          {totalRecords} {recordLabel}
        </div>
      </div>
    </div>
  );
}
