import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Filter,
  Sparkles,
  Save,
  CheckCircle2,
  Table
} from 'lucide-react';
import api from '../../api/client';

export default function DataAnalyticsWorkspace({
  courseId,
  question,
  initialState,
  onSubmitSolution,
  isSubmitting
}) {
  const [dataset, setDataset] = useState([
    { id: 1, region: 'North', sales: 42000, profit: 12000, margin: 28.5 },
    { id: 2, region: 'South', sales: 38000, profit: 9500, margin: 25.0 },
    { id: 3, region: 'East', sales: 55000, profit: 18000, margin: 32.7 },
    { id: 4, region: 'West', sales: 61000, profit: 21500, margin: 35.2 }
  ]);

  const [activeFilter, setActiveFilter] = useState(initialState?.activeFilter || 'all');
  const [chartType, setChartType] = useState(initialState?.charts?.[0]?.type || 'bar');
  const [saveStatus, setSaveStatus] = useState('saved');
  const saveTimeoutRef = useRef(null);

  // Compute live KPIs
  const filteredData = activeFilter === 'all' ? dataset : dataset.filter(d => d.region.toLowerCase() === activeFilter.toLowerCase());
  const totalSales = filteredData.reduce((sum, d) => sum + d.sales, 0);
  const totalProfit = filteredData.reduce((sum, d) => sum + d.profit, 0);
  const avgMargin = (filteredData.reduce((sum, d) => sum + d.margin, 0) / (filteredData.length || 1)).toFixed(1);

  const triggerAutoSave = (updatedData) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.post(`/workspace/state/${courseId}/${question._id}`, {
          environmentType: 'data_analytics',
          stateData: updatedData
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error('Analytics auto-save error:', err);
        setSaveStatus('saved');
      }
    }, 1200);
  };

  const handleFilterChange = (region) => {
    setActiveFilter(region);
    triggerAutoSave({
      kpis: [
        { label: 'Total Sales', value: totalSales },
        { label: 'Total Profit', value: totalProfit }
      ],
      charts: [{ type: chartType }],
      activeFilter: region
    });
  };

  const handleValidateAndSubmit = () => {
    const payload = {
      kpis: [
        { label: 'Total Revenue', value: totalSales },
        { label: 'Net Profit', value: totalProfit },
        { label: 'Profit Margin', value: avgMargin }
      ],
      charts: [{ type: chartType, dimension: 'region', metric: 'sales' }],
      filters: [activeFilter]
    };
    onSubmitSolution('data_analytics', payload);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-bold text-teal-400">
            <BarChart3 className="w-4 h-4" />
            <span>Data & Business Analytics Visual Studio</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Filter options */}
          <div className="flex items-center space-x-1">
            {['all', 'North', 'South', 'East', 'West'].map(r => (
              <button
                key={r}
                onClick={() => handleFilterChange(r)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  activeFilter.toLowerCase() === r.toLowerCase()
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>{saveStatus === 'saving' ? 'Auto-saving...' : 'Auto-saved'}</span>
          </span>

          <button
            onClick={handleValidateAndSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 disabled:opacity-50 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Evaluating...' : 'Verify Analytics Dashboard'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Sales</span>
            <p className="text-2xl font-black text-teal-400 mt-1">${totalSales.toLocaleString()}</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Profit</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">${totalProfit.toLocaleString()}</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Margin</span>
            <p className="text-2xl font-black text-indigo-400 mt-1">{avgMargin}%</p>
          </div>
        </div>

        {/* Chart View */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Revenue Distribution by Region</span>
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded ${chartType === 'bar' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`p-1.5 rounded ${chartType === 'line' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between px-8 pt-4 border-b border-slate-800">
            {filteredData.map(item => {
              const maxSales = 70000;
              const barHeight = Math.round((item.sales / maxSales) * 100);

              return (
                <div key={item.id} className="flex flex-col items-center space-y-2 group">
                  <span className="text-[10px] font-mono text-teal-300">${(item.sales / 1000).toFixed(0)}k</span>
                  <div
                    style={{ height: `${barHeight}%` }}
                    className="w-14 rounded-t-xl bg-gradient-to-t from-teal-600 to-cyan-400 group-hover:brightness-125 transition-all shadow-lg"
                  />
                  <span className="text-xs font-bold text-slate-400 mt-2">{item.region}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
