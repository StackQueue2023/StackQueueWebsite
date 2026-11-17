import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../api/client';
import {
  CreditCard, Users, TrendingUp, AlertCircle, DollarSign,
  Search, Filter, Download, RefreshCw, ChevronRight, CheckCircle2,
  Clock, XCircle, ArrowUpDown, Layers, Briefcase
} from 'lucide-react';

export default function AdminInternshipPaymentAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Filters for student list
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/internship/analytics/payments');
      if (res.data?.success) {
        setAnalytics(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to load payment analytics');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching payment analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const students = useMemo(() => analytics?.students || [], [analytics]);
  const summary = analytics?.summary || {
    totalStudents: 0,
    totalExpected: 0,
    totalCollected: 0,
    totalPending: 0,
    fullyPaid: 0,
    partiallyPaid: 0,
    unpaid: 0
  };

  const batchBreakdown = analytics?.batchBreakdown || [];
  const courseBreakdown = analytics?.courseBreakdown || [];
  const statusDistribution = analytics?.statusDistribution || [];

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !searchTerm.trim() ||
        (s.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.batchCode || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchBatch = selectedBatch === 'ALL' || s.batchCode === selectedBatch;
      const matchCourse = selectedCourse === 'ALL' || s.courseName === selectedCourse;
      const matchStatus = selectedStatus === 'ALL' || s.paymentStatus === selectedStatus;

      return matchSearch && matchBatch && matchCourse && matchStatus;
    });
  }, [students, searchTerm, selectedBatch, selectedCourse, selectedStatus]);

  // Unique lists for filters
  const uniqueBatches = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.batchCode).filter(Boolean)));
  }, [students]);

  const uniqueCourses = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.courseName).filter(Boolean)));
  }, [students]);

  // Max value calculation for Bar Charts scaling
  const maxBatchFee = useMemo(() => {
    return Math.max(...batchBreakdown.map((b) => Math.max(b.expected, b.collected, b.pending)), 1);
  }, [batchBreakdown]);

  const maxCourseFee = useMemo(() => {
    return Math.max(...courseBreakdown.map((c) => Math.max(c.expected, c.collected, c.pending)), 1);
  }, [courseBreakdown]);

  const maxStatusCount = useMemo(() => {
    return Math.max(...statusDistribution.map((s) => s.count), 1);
  }, [statusDistribution]);

  const exportCSV = () => {
    if (!filteredStudents.length) return;
    const headers = ['Student Name', 'Username', 'Email', 'Phone', 'Batch Code', 'Course', 'Fee', 'Paid Amount', 'Pending Amount', 'Payment Status'];
    const rows = filteredStudents.map((s) => [
      `"${s.studentName || ''}"`,
      `"${s.username || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.batchCode || ''}"`,
      `"${s.courseName || ''}"`,
      s.fee,
      s.paidAmount,
      s.pendingAmount,
      `"${s.paymentStatus}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `internship_payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Internship Payment Analytics
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                Real-time fee collections, batch distributions, and pending dues tracking (Bar Charts Only)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportCSV}
            disabled={!filteredStudents.length}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Total Students</span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{summary.totalStudents}</p>
          <span className="text-[10px] text-slate-500 font-medium">All batches</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">Expected Total</span>
          <p className="text-xl sm:text-2xl font-black text-blue-900 mt-1 font-mono">₹{summary.totalExpected.toLocaleString()}</p>
          <span className="text-[10px] text-blue-600 font-medium">Assigned Fees</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 font-mono">Collected Total</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-900 mt-1 font-mono">₹{summary.totalCollected.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-medium font-mono">
            {summary.totalExpected > 0 ? Math.round((summary.totalCollected / summary.totalExpected) * 100) : 0}% Realized
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 font-mono">Pending Total</span>
          <p className="text-xl sm:text-2xl font-black text-amber-900 mt-1 font-mono">₹{summary.totalPending.toLocaleString()}</p>
          <span className="text-[10px] text-amber-600 font-medium">Outstanding Dues</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Fully Paid</span>
          <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">{summary.fullyPaid}</p>
          <span className="text-[10px] text-slate-400">0 balance</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Partially Paid</span>
          <p className="text-2xl font-black text-amber-600 mt-1 font-mono">{summary.partiallyPaid}</p>
          <span className="text-[10px] text-slate-400">Installments</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Unpaid</span>
          <p className="text-2xl font-black text-red-600 mt-1 font-mono">{summary.unpaid}</p>
          <span className="text-[10px] text-slate-400">Due reminders</span>
        </div>
      </div>

      {/* STRICT RULE: BAR CHARTS ONLY (NO PIE OR CIRCLE CHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BAR CHART 1: Batch-wise Fee Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Batch-Wise Payment Collections</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono">
                  Bar Chart
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Click any batch bar to filter the student list below</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Collected</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Pending</span>
            </div>
          </div>

          {batchBreakdown.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No batch fee data available. Import a Google Sheet to populate batches.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {batchBreakdown.map((b) => {
                const collectedPct = Math.min(100, Math.round((b.collected / maxBatchFee) * 100));
                const pendingPct = Math.min(100, Math.round((b.pending / maxBatchFee) * 100));
                const isSelected = selectedBatch === b.batchCode;

                return (
                  <div
                    key={b.batchId || b.batchCode}
                    onClick={() => setSelectedBatch(isSelected ? 'ALL' : b.batchCode)}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="font-mono text-emerald-700">{b.batchCode}</span>
                        <span className="text-slate-400 font-normal">({b.courseName})</span>
                      </span>
                      <span className="text-slate-600 font-mono text-[11px]">
                        Collected: <strong className="text-emerald-700">₹{b.collected.toLocaleString()}</strong> /
                        Pending: <strong className="text-amber-700">₹{b.pending.toLocaleString()}</strong>
                      </span>
                    </div>

                    {/* Dual Horizontal Stacked / Comparative Bar */}
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex gap-1 p-0.5">
                      <div
                        style={{ width: `${collectedPct}%` }}
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        title={`Collected: ₹${b.collected}`}
                      />
                      <div
                        style={{ width: `${pendingPct}%` }}
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        title={`Pending: ₹${b.pending}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BAR CHART 2: Payment Status Count Distribution (Vertical / Horizontal Bar) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>Status Distribution</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-mono">
                Bar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Click to filter by payment status</p>
          </div>

          <div className="space-y-4 pt-2">
            {statusDistribution.map((st) => {
              const barWidth = Math.min(100, Math.round((st.count / maxStatusCount) * 100));
              const isSelected = selectedStatus === st.status;
              const colorClass =
                st.status === 'Fully Paid'
                  ? 'bg-emerald-500'
                  : st.status === 'Partially Paid'
                  ? 'bg-amber-400'
                  : 'bg-red-400';

              return (
                <div
                  key={st.status}
                  onClick={() => setSelectedStatus(isSelected ? 'ALL' : st.status)}
                  className={`p-3 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">{st.status}</span>
                    <span className="font-mono font-black text-slate-900">{st.count} students</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${barWidth}%` }}
                      className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* BAR CHART 3: Course-wise Bar breakdown */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 font-mono">
              Course Distribution (Bar Chart)
            </h4>
            <div className="space-y-2">
              {courseBreakdown.slice(0, 4).map((c) => {
                const barWidth = Math.min(100, Math.round((c.expected / maxCourseFee) * 100));
                const isSelected = selectedCourse === c.courseName;

                return (
                  <div
                    key={c.courseName}
                    onClick={() => setSelectedCourse(isSelected ? 'ALL' : c.courseName)}
                    className={`p-2 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected ? 'border-purple-500 bg-purple-50/50' : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800 truncate">{c.courseName}</span>
                      <span className="font-mono text-[11px] text-slate-600">₹{c.collected.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${barWidth}%` }}
                        className="h-full bg-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* FILTERABLE STUDENT PAYMENT TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
        
        {/* Table Header & Interactive Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Detailed Student Payment Records</span>
              <span className="text-xs font-bold text-slate-400">({filteredStudents.length} of {students.length})</span>
            </h3>
            <p className="text-xs text-slate-500">Real-time status synced with Google Sheet & batch import</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student, username..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Batch Filter Dropdown */}
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none"
            >
              <option value="ALL">All Batches</option>
              {uniqueBatches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Course Filter Dropdown */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none"
            >
              <option value="ALL">All Courses</option>
              {uniqueCourses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Status Filter Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Fully Paid">Fully Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>

            {(selectedBatch !== 'ALL' || selectedCourse !== 'ALL' || selectedStatus !== 'ALL' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedBatch('ALL');
                  setSelectedCourse('ALL');
                  setSelectedStatus('ALL');
                  setSearchTerm('');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Student & Username</th>
                <th className="py-3 px-4">Batch & Course</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Total Fee</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Pending Dues</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No student records matching current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s._id || idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{s.studentName}</div>
                      <div className="text-[11px] font-mono text-emerald-700 font-semibold">{s.username}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs font-bold text-purple-700">{s.batchCode}</div>
                      <div className="text-[11px] text-slate-500">{s.courseName}</div>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      <div>{s.email || '—'}</div>
                      <div className="text-slate-400">{s.phone || '—'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{s.fee}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      ₹{s.paidAmount}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">
                      ₹{s.pendingAmount}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        s.paymentStatus === 'Fully Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.paymentStatus === 'Partially Paid'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {s.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
