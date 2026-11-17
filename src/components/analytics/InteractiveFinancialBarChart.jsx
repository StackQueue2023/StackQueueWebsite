import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, ChevronRight, X } from 'lucide-react';

/**
 * Interactive Financial Comparison Bar Chart
 * 
 * Complies with STACK QUEUE Payment Analytics requirements:
 * - 100% Bar Charts (NO pie, donut, ring, or circular diagrams)
 * - Three distinct bars or grouped bars:
 *     Total Agreed -> Blue (#2563EB)
 *     Collected    -> Green (#10B981 / #059669)
 *     Pending      -> Orange / Amber (#F59E0B / #D97706)
 * - Interactive: Click any bar to drill down and view records / student details
 * - Category-aware theme integration
 */
export default function InteractiveFinancialBarChart({
  title = 'Financial Performance & Receivables',
  subtitle = 'Total Agreed vs Collected vs Pending',
  category = 'Courses', // 'Courses' | 'Internships' | 'Products' | 'Projects'
  totalAgreed = 0,
  collected = 0,
  pending = 0,
  items = [], // [{ name, domain, totalAgreed, collected, pending, studentCount, students }]
  onSelectRecord = null,
  formatCurrency = (v) => `₹${Number(v || 0).toLocaleString()}`
}) {
  const [activeItem, setActiveItem] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Category specific accent color for the container header
  const categoryHeaderClass = {
    Courses: 'text-blue-700 bg-blue-50 border-blue-200',
    Internships: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Products: 'text-amber-800 bg-amber-50 border-amber-200',
    Projects: 'text-amber-800 bg-amber-50 border-amber-200'
  }[category] || 'text-purple-700 bg-purple-50 border-purple-200';

  // Overall collection %
  const overallPct = totalAgreed > 0 ? Math.round((collected / totalAgreed) * 100) : 0;
  const pendingPct = totalAgreed > 0 ? Math.round((pending / totalAgreed) * 100) : 0;

  // Maximum value for scaling global comparison bars
  const maxTotal = Math.max(totalAgreed, 1);

  const handleBarClick = (item) => {
    setActiveItem(item);
    if (onSelectRecord) {
      onSelectRecord(item);
    } else {
      setDetailModalOpen(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 transition hover:border-slate-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
              {title}
            </h3>
          </div>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* 3 Metric Legend Pills */}
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-sm bg-blue-600"></span> Total Agreed
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-sm bg-emerald-600"></span> Collected
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-sm bg-amber-500"></span> Pending
          </span>
        </div>
      </div>

      {/* Global 3-Bar Comparison Overview */}
      <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">Category Financial Snapshot</span>
          <span className="text-[11px] font-mono font-bold text-emerald-600">
            {overallPct}% Realized ({pendingPct}% Pending)
          </span>
        </div>

        {/* Total Agreed Bar (Blue) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-medium text-slate-600">
            <span className="flex items-center gap-1 font-semibold text-blue-800">
              <span className="w-2 h-2 rounded-sm bg-blue-600"></span> Total Agreed Fees
            </span>
            <span className="font-mono font-bold text-slate-900">{formatCurrency(totalAgreed)}</span>
          </div>
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.round((totalAgreed / maxTotal) * 100))}%` }}
            />
          </div>
        </div>

        {/* Collected Bar (Green) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-medium text-slate-600">
            <span className="flex items-center gap-1 font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-sm bg-emerald-600"></span> Collected Amount
            </span>
            <span className="font-mono font-bold text-emerald-700">{formatCurrency(collected)} ({overallPct}%)</span>
          </div>
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, overallPct)}%` }}
            />
          </div>
        </div>

        {/* Pending Bar (Amber/Orange) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-medium text-slate-600">
            <span className="flex items-center gap-1 font-semibold text-amber-800">
              <span className="w-2 h-2 rounded-sm bg-amber-500"></span> Pending Balance
            </span>
            <span className="font-mono font-bold text-amber-700">{formatCurrency(pending)} ({pendingPct}%)</span>
          </div>
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, pendingPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Program / Domain Multi-Bar Breakdown Table */}
      {items.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Domain & Program Breakdown ({items.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">Click any row to drill down</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {items.map((it, idx) => {
              const itAgreed = Number(it.totalAgreed || it.agreedFee || it.totalFees || 0);
              const itColl = Number(it.collected || it.collectedAmount || it.amountPaid || it.paidFee || 0);
              const itPend = Math.max(0, itAgreed - itColl);
              const collPct = itAgreed > 0 ? Math.round((itColl / itAgreed) * 100) : 0;
              const pendPct = itAgreed > 0 ? Math.round((itPend / itAgreed) * 100) : 0;

              return (
                <div
                  key={idx}
                  onClick={() => handleBarClick(it)}
                  className="group p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <span className="font-black text-slate-800 truncate group-hover:text-blue-700 transition">
                        {it.name || it.programName || it.domainName || 'Program'}
                      </span>
                      {it.studentCount !== undefined && (
                        <span className="text-[10px] text-slate-400">
                          ({it.studentCount} student{it.studentCount === 1 ? '' : 's'})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold shrink-0">
                      <span className="text-emerald-700">{formatCurrency(itColl)}</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-blue-700">{formatCurrency(itAgreed)}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>

                  {/* Grouped Horizontal Mini Bars */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/60">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${collPct}%` }}
                      title={`Collected: ${formatCurrency(itColl)} (${collPct}%)`}
                    />
                    <div
                      className="bg-amber-400 h-full transition-all duration-500"
                      style={{ width: `${pendPct}%` }}
                      title={`Pending: ${formatCurrency(itPend)} (${pendPct}%)`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="text-emerald-600 font-semibold">{collPct}% Collected</span>
                    <span className="text-amber-600 font-semibold">Pending: {formatCurrency(itPend)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drill-down Detail Modal */}
      {detailModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryHeaderClass}`}>
                  {category} Detail
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {activeItem.name || activeItem.programName || activeItem.domainName}
                </h3>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <span className="text-[10px] font-bold uppercase text-blue-700 block">Total Agreed</span>
                <strong className="text-sm font-black font-mono text-blue-900">
                  {formatCurrency(activeItem.totalAgreed || activeItem.agreedFee || 0)}
                </strong>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">Collected</span>
                <strong className="text-sm font-black font-mono text-emerald-900">
                  {formatCurrency(activeItem.collected || activeItem.amountPaid || 0)}
                </strong>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <span className="text-[10px] font-bold uppercase text-amber-700 block">Pending</span>
                <strong className="text-sm font-black font-mono text-amber-900">
                  {formatCurrency(activeItem.pending || (activeItem.totalAgreed - activeItem.collected) || 0)}
                </strong>
              </div>
            </div>

            {/* Student details if available */}
            {activeItem.students && activeItem.students.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Enrolled Students ({activeItem.students.length})
                </h4>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {activeItem.students.map((st, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-200/70"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{st.studentName}</p>
                        <p className="text-[10px] font-mono text-slate-400">{st.studentCode}</p>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <p className="font-bold text-emerald-600">{formatCurrency(st.amountPaid)}</p>
                        <p className="text-[10px] text-amber-600">Pend: {formatCurrency(st.remainingPrincipal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setDetailModalOpen(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
