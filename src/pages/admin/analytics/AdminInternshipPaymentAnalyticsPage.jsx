import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../api/client';
import {
  CreditCard, Users, TrendingUp, AlertCircle, DollarSign,
  Search, Filter, Download, RefreshCw, ChevronRight, CheckCircle2,
  Clock, XCircle, ArrowUpDown, Layers, Briefcase, Calendar,
  BarChart2, FileText, AlertTriangle, ShieldCheck
} from 'lucide-react';

export default function AdminInternshipPaymentAnalyticsPage({ embedded = false, initialTab = 'overview' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Filters for student list
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/internship/analytics/payments');
      if (res.data?.success) {
        setAnalytics(res.data.data || res.data);
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
    unpaid: 0,
    collectionPercentage: 0
  };

  const batchBreakdown = analytics?.batchBreakdown || [];
  const courseBreakdown = analytics?.courseBreakdown || [];
  const statusDistribution = analytics?.statusDistribution || [];
  const finOps = analytics?.financialOperations || {};

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !searchTerm.trim() ||
        (s.studentName || s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.batchCode || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchBatch = selectedBatch === 'ALL' || s.batchCode === selectedBatch;
      const matchCourse = selectedCourse === 'ALL' || (s.courseName || s.course) === selectedCourse;
      const matchStatus = selectedStatus === 'ALL' || s.paymentStatus === selectedStatus;

      return matchSearch && matchBatch && matchCourse && matchStatus;
    });
  }, [students, searchTerm, selectedBatch, selectedCourse, selectedStatus]);

  // Unique lists for filters
  const uniqueBatches = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.batchCode).filter(Boolean)));
  }, [students]);

  const uniqueCourses = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.courseName || s.course).filter(Boolean)));
  }, [students]);

  // Max value calculation for Bar Charts scaling
  const maxBatchFee = useMemo(() => {
    return Math.max(...batchBreakdown.map((b) => Math.max(b.expected || 0, b.collected || 0, b.pending || 0)), 1);
  }, [batchBreakdown]);

  const maxCourseFee = useMemo(() => {
    return Math.max(...courseBreakdown.map((c) => Math.max(c.expected || 0, c.collected || 0, c.pending || 0)), 1);
  }, [courseBreakdown]);

  const maxStatusCount = useMemo(() => {
    return Math.max(...statusDistribution.map((s) => s.count || 0), 1);
  }, [statusDistribution]);

  // Outstanding dues filtered
  const outstandingStudents = useMemo(() => {
    const list = finOps?.outstandingDues?.students || [];
    if (selectedUrgency === 'ALL') return list;
    return list.filter((s) => s.urgency === selectedUrgency);
  }, [finOps, selectedUrgency]);

  // CSV Exporters
  const exportStudentsCSV = () => {
    if (!filteredStudents.length) return;
    const headers = ['Student Name', 'Username', 'Email', 'Phone', 'Batch Code', 'Course', 'Fee', 'Paid Amount', 'Pending Amount', 'Payment Status'];
    const rows = filteredStudents.map((s) => [
      `"${s.studentName || s.name || ''}"`,
      `"${s.username || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.batchCode || ''}"`,
      `"${s.courseName || s.course || ''}"`,
      s.fee,
      s.paidAmount,
      s.pendingAmount,
      `"${s.paymentStatus}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `internship_students_payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOutstandingCSV = () => {
    const list = finOps?.outstandingDues?.students || [];
    if (!list.length) return;
    const headers = ['Student Name', 'Username', 'Batch Code', 'Course', 'Total Fee', 'Paid Amount', 'Pending Dues', 'Days Pending', 'Urgency'];
    const rows = list.map((s) => [
      `"${s.studentName || s.name || ''}"`,
      `"${s.username || ''}"`,
      `"${s.batchCode || ''}"`,
      `"${s.courseName || ''}"`,
      s.fee,
      s.paidAmount,
      s.pendingAmount,
      s.daysPending,
      `"${s.urgency}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `outstanding_dues_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTransactionsCSV = () => {
    const list = finOps?.transactions || [];
    if (!list.length) return;
    const headers = ['Transaction Ref', 'Student Name', 'Username', 'Batch', 'Course', 'Amount', 'Date', 'Method', 'Status'];
    const rows = list.map((t) => [
      `"${t.transactionRef}"`,
      `"${t.studentName}"`,
      `"${t.username}"`,
      `"${t.batchCode}"`,
      `"${t.courseName}"`,
      t.amount,
      `"${t.paymentDate}"`,
      `"${t.paymentMethod}"`,
      `"${t.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `payment_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`${embedded ? 'space-y-6 pt-2' : 'min-h-screen bg-slate-50/60 p-4 sm:p-8 space-y-6'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Internship Payment Analytics
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Real-time fee collections, installment tracking & financial operations (Strictly Bar Charts Only)
            </p>
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
            onClick={exportStudentsCSV}
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
            {summary.collectionPercentage || (summary.totalExpected > 0 ? Math.round((summary.totalCollected / summary.totalExpected) * 100) : 0)}% Realized
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

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview & Bar Charts', icon: BarChart2 },
          { id: 'students', label: 'Student Payment Records', icon: Users },
          { id: 'batches', label: 'Batch Breakdown', icon: Layers },
          { id: 'courses', label: 'Course Analytics', icon: Briefcase },
          { id: 'financial_ops', label: 'Financial Operations & Sub-Analytics', icon: DollarSign }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'financial_ops' && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-mono">
                  New
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & BAR CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
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
                  <p className="text-xs text-slate-500 font-medium">Real-time collections and pending dues per batch</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Collected</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Pending</span>
                </div>
              </div>

              {batchBreakdown.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                  No batch fee data available. Import students to populate batches.
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  {batchBreakdown.map((b) => {
                    const collectedPct = Math.min(100, Math.round(((b.collected || 0) / maxBatchFee) * 100));
                    const pendingPct = Math.min(100, Math.round(((b.pending || 0) / maxBatchFee) * 100));

                    return (
                      <div key={b.batchId || b.code || b.name} className="space-y-1.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800 font-mono">{b.name} ({b.code})</span>
                          <span className="text-slate-500">₹{(b.collected || 0).toLocaleString()} / ₹{(b.expected || 0).toLocaleString()}</span>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-lg overflow-hidden flex gap-1">
                          <div style={{ width: `${collectedPct}%` }} className="bg-emerald-500 transition-all duration-500" title={`Collected: ₹${b.collected}`} />
                          <div style={{ width: `${pendingPct}%` }} className="bg-amber-400 transition-all duration-500" title={`Pending: ₹${b.pending}`} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>{b.studentsCount || 0} students</span>
                          <span>{b.expected > 0 ? Math.round((b.collected / b.expected) * 100) : 0}% paid</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* BAR CHART 2: Payment Status Distribution (Bar Chart Only) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Status Distribution</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-mono">
                    Bar Chart
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Headcount by payment status</p>
              </div>

              <div className="space-y-4 pt-4">
                {statusDistribution.map((item) => {
                  const pct = Math.min(100, Math.round(((item.count || 0) / maxStatusCount) * 100));
                  const barColor =
                    item.status === 'Fully Paid'
                      ? 'bg-emerald-500'
                      : item.status === 'Partially Paid'
                      ? 'bg-amber-400'
                      : 'bg-red-400';

                  return (
                    <div key={item.status} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800">{item.status}</span>
                        <span className="text-slate-600 font-mono">{item.count} students</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-lg overflow-hidden">
                        <div style={{ width: `${pct}%` }} className={`h-full ${barColor} transition-all duration-500`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BAR CHART 3: Course-wise Revenue Realization */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Course-Wise Financial Performance</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-mono">
                    Horizontal Bar Chart
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Fee realization across all enrolled internship domains</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Collected</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Pending</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {courseBreakdown.map((c) => {
                const collectedPct = Math.min(100, Math.round(((c.collected || 0) / maxCourseFee) * 100));
                const pendingPct = Math.min(100, Math.round(((c.pending || 0) / maxCourseFee) * 100));

                return (
                  <div key={c.course} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-2">
                    <div className="flex justify-between items-start text-xs font-bold">
                      <span className="text-slate-900">{c.course}</span>
                      <span className="font-mono text-slate-600">₹{(c.collected || 0).toLocaleString()} / ₹{(c.expected || 0).toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-md overflow-hidden flex gap-1">
                      <div style={{ width: `${collectedPct}%` }} className="bg-blue-500" />
                      <div style={{ width: `${pendingPct}%` }} className="bg-amber-400" />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{c.studentsCount || 0} enrolled</span>
                      <span className="font-bold text-blue-700">{c.expected > 0 ? Math.round((c.collected / c.expected) * 100) : 0}% Realized</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT PAYMENT RECORDS */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Student Payment Records</h3>
              <p className="text-xs text-slate-500">Live verified database records of all enrolled internship candidates</p>
            </div>
            <div className="text-xs font-bold text-slate-500 font-mono">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, username, email..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
            >
              <option value="ALL">All Batches</option>
              {uniqueBatches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
            >
              <option value="ALL">All Courses</option>
              {uniqueCourses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="Fully Paid">Fully Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Student & Username</th>
                  <th className="py-3 px-4">Batch & Course</th>
                  <th className="py-3 px-4">Contact</th>
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
                    <tr key={s._id || s.id || idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s.studentName || s.name}</div>
                        <div className="text-[11px] font-mono text-emerald-700 font-semibold">{s.username}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs font-bold text-purple-700">{s.batchCode}</div>
                        <div className="text-[11px] text-slate-500">{s.courseName || s.course}</div>
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        <div>{s.email || '—'}</div>
                        <div className="text-slate-400">{s.phone || '—'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{s.fee}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">₹{s.paidAmount}</td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-700">₹{s.pendingAmount}</td>
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
      )}

      {/* TAB 3: BATCH BREAKDOWN */}
      {activeTab === 'batches' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Batch-Level Financial Performance</h3>
            <p className="text-xs text-slate-500">Breakdown of expected fees, collections, and pending dues per batch</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batchBreakdown.map((b) => {
              const realizedPct = b.expected > 0 ? Math.round((b.collected / b.expected) * 100) : 0;
              return (
                <div key={b.code || b.name} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{b.name}</h4>
                      <span className="text-[11px] font-mono font-bold text-purple-700">{b.code}</span>
                    </div>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-mono font-bold">
                      {realizedPct}% Realized
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Total Students:</span>
                      <span className="font-bold text-slate-800">{b.studentsCount}</span>
                    </div>
                    <div className="flex justify-between text-blue-700">
                      <span>Expected:</span>
                      <span className="font-mono font-bold">₹{(b.expected || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Collected:</span>
                      <span className="font-mono font-bold">₹{(b.collected || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-amber-700">
                      <span>Pending:</span>
                      <span className="font-mono font-bold">₹{(b.pending || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Horizontal Bar Chart for this batch */}
                  <div className="pt-2">
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                      <div style={{ width: `${realizedPct}%` }} className="bg-emerald-500 h-full" />
                      <div style={{ width: `${100 - realizedPct}%` }} className="bg-amber-400 h-full" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: COURSE ANALYTICS */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Course & Domain Financial Realization</h3>
            <p className="text-xs text-slate-500">Analysis of revenue realization across individual technical domains</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courseBreakdown.map((c) => {
              const realizedPct = c.expected > 0 ? Math.round((c.collected / c.expected) * 100) : 0;
              return (
                <div key={c.course} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{c.course}</h4>
                      <span className="text-[11px] text-slate-500">{c.studentsCount} candidates enrolled</span>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-mono font-bold">
                      {realizedPct}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Expected</span>
                      <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">₹{(c.expected || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase">Collected</span>
                      <p className="text-xs font-mono font-bold text-emerald-700 mt-0.5">₹{(c.collected || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-600 font-bold uppercase">Pending</span>
                      <p className="text-xs font-mono font-bold text-amber-700 mt-0.5">₹{(c.pending || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Horizontal Bar Chart */}
                  <div className="h-3 bg-slate-100 rounded-md overflow-hidden flex gap-0.5">
                    <div style={{ width: `${realizedPct}%` }} className="bg-blue-600 h-full" />
                    <div style={{ width: `${100 - realizedPct}%` }} className="bg-amber-400 h-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: FINANCIAL OPERATIONS & SUB-ANALYTICS */}
      {activeTab === 'financial_ops' && (
        <div className="space-y-6">
          {/* Section 1: Revenue Analytics */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>1. Revenue Analytics</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono">
                    Financial Performance
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Total expected vs collected vs pending revenue comparison</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                <span className="text-[10px] font-bold uppercase text-blue-600 font-mono">Total Expected</span>
                <p className="text-2xl font-black text-blue-900 mt-1 font-mono">₹{summary.totalExpected.toLocaleString()}</p>
                <span className="text-[10px] text-blue-600">Committed student fees</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[10px] font-bold uppercase text-emerald-600 font-mono">Total Collected</span>
                <p className="text-2xl font-black text-emerald-900 mt-1 font-mono">₹{summary.totalCollected.toLocaleString()}</p>
                <span className="text-[10px] text-emerald-600">Successfully verified</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                <span className="text-[10px] font-bold uppercase text-amber-600 font-mono">Pending Balance</span>
                <p className="text-2xl font-black text-amber-900 mt-1 font-mono">₹{summary.totalPending.toLocaleString()}</p>
                <span className="text-[10px] text-amber-600">Active receivables</span>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                <span className="text-[10px] font-bold uppercase text-purple-600 font-mono">Collection Rate</span>
                <p className="text-2xl font-black text-purple-900 mt-1 font-mono">{summary.collectionPercentage || 0}%</p>
                <span className="text-[10px] text-purple-600">Fee realization efficiency</span>
              </div>
            </div>

            {/* Overall Revenue Bar Chart */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
              <span className="text-xs font-bold text-slate-700">Overall Realization Progress</span>
              <div className="h-6 bg-slate-200 rounded-xl overflow-hidden flex gap-1 p-1">
                <div
                  style={{ width: `${summary.collectionPercentage || 0}%` }}
                  className="bg-emerald-500 rounded-lg transition-all duration-500"
                  title={`Collected: ₹${summary.totalCollected}`}
                />
                <div
                  style={{ width: `${100 - (summary.collectionPercentage || 0)}%` }}
                  className="bg-amber-400 rounded-lg transition-all duration-500"
                  title={`Pending: ₹${summary.totalPending}`}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>₹{summary.totalCollected.toLocaleString()} Collected ({summary.collectionPercentage}%)</span>
                <span>₹{summary.totalPending.toLocaleString()} Pending ({100 - summary.collectionPercentage}%)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Installment Analytics */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>2. Payment Installment Analytics</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-mono">
                  Schedules & Dues
                </span>
              </h3>
              <p className="text-xs text-slate-500">Tracking of installments, scheduled due dates, and overdue alerts</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Total Installments</span>
                <p className="text-xl font-black text-slate-900 mt-1 font-mono">{finOps?.installments?.totalInstallments || 0}</p>
                <span className="text-[10px] text-slate-500">2 per candidate</span>
              </div>
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30">
                <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono">Paid Installments</span>
                <p className="text-xl font-black text-emerald-700 mt-1 font-mono">{finOps?.installments?.paidInstallments || 0}</p>
                <span className="text-[10px] text-emerald-600">Settled on schedule</span>
              </div>
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30">
                <span className="text-[10px] font-bold text-amber-600 uppercase font-mono">Pending Installments</span>
                <p className="text-xl font-black text-amber-700 mt-1 font-mono">{finOps?.installments?.pendingInstallments || 0}</p>
                <span className="text-[10px] text-amber-600">Awaiting payment</span>
              </div>
              <div className="p-4 rounded-2xl border border-red-200 bg-red-50/30">
                <span className="text-[10px] font-bold text-red-600 uppercase font-mono">Overdue Installments</span>
                <p className="text-xl font-black text-red-700 mt-1 font-mono">{finOps?.installments?.overdueInstallments || 0}</p>
                <span className="text-[10px] text-red-600">Past due date</span>
              </div>
            </div>

            {/* Installments Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Batch</th>
                    <th className="py-3 px-4">Total Fee</th>
                    <th className="py-3 px-4">Installment 1 (Due Day 3)</th>
                    <th className="py-3 px-4">Installment 2 (Due Day 10)</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(finOps?.installments?.studentInstallments || []).slice(0, 15).map((s, idx) => (
                    <tr key={s.id || idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{s.username}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-700">{s.batchCode}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{s.totalFee}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.installment1?.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            ₹{s.installment1?.amount} • {s.installment1?.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">Due: {s.installment1?.dueDate}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.installment2?.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            ₹{s.installment2?.amount} • {s.installment2?.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">Due: {s.installment2?.dueDate}</span>
                      </td>
                      <td className="py-3 px-4">
                        {s.isOverdue ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> Overdue
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> In Order
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Outstanding Dues Analysis */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>3. Outstanding Dues Analysis</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono">
                    Urgency Ranking
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Students with pending dues sorted by amount & urgency ranking</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold"
                >
                  <option value="ALL">All Urgencies</option>
                  <option value="High">High Urgency (&gt; 14 days)</option>
                  <option value="Medium">Medium Urgency (&gt; 7 days)</option>
                  <option value="Low">Low Urgency (Recent)</option>
                </select>
                <button
                  onClick={exportOutstandingCSV}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Export Dues
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Batch & Course</th>
                    <th className="py-3 px-4">Total Fee</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Pending Dues</th>
                    <th className="py-3 px-4">Days Pending</th>
                    <th className="py-3 px-4">Urgency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {outstandingStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No outstanding dues matching criteria!
                      </td>
                    </tr>
                  ) : (
                    outstandingStudents.slice(0, 20).map((s, idx) => (
                      <tr key={s.id || idx} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{s.name || s.studentName}</div>
                          <div className="text-[11px] font-mono text-slate-400">{s.username}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-purple-700">{s.batchCode}</div>
                          <div className="text-[11px] text-slate-500">{s.courseName}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">₹{s.fee}</td>
                        <td className="py-3 px-4 font-mono text-emerald-700 font-bold">₹{s.paidAmount}</td>
                        <td className="py-3 px-4 font-mono text-amber-700 font-black">₹{s.pendingAmount}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{s.daysPending} days</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.urgency === 'High'
                              ? 'bg-red-100 text-red-800'
                              : s.urgency === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {s.urgency} Priority
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Verified Transaction History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>4. Verified Payment Transaction History</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-mono">
                    Audit Trail
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Every verified payment receipt registered in the database</p>
              </div>
              <button
                onClick={exportTransactionsCSV}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" /> Export Ledger
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Transaction Ref</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Batch</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(finOps?.transactions || []).length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    (finOps?.transactions || []).slice(0, 25).map((t, idx) => (
                      <tr key={t.transactionRef || idx} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{t.transactionRef}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{t.studentName}</div>
                          <div className="text-[11px] font-mono text-slate-400">{t.username}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-purple-700 font-bold">{t.batchCode}</td>
                        <td className="py-3 px-4 text-slate-600">{t.courseName}</td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-700">₹{t.amount}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{t.paymentDate}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                            {t.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                            <ShieldCheck className="w-3 h-3" /> {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Date-Wise Financial Reports */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>5. Date-Wise Daily Collection Summary</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-mono">
                  Daily Summary
                </span>
              </h3>
              <p className="text-xs text-slate-500">Day-by-day fee collection breakdown from enrolled candidates</p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Total Amount Collected</th>
                    <th className="py-3 px-4">Number of Transactions</th>
                    <th className="py-3 px-4">Daily Volume Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(finOps?.reports?.dateWise || []).length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">
                        No date-wise collections available yet.
                      </td>
                    </tr>
                  ) : (
                    (finOps?.reports?.dateWise || []).map((row) => (
                      <tr key={row.date} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.date}</td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-700">₹{row.amount.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{row.transactionsCount} payments</td>
                        <td className="py-3 px-4">
                          <div className="w-48 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, (row.amount / Math.max(1, ...(finOps?.reports?.dateWise || []).map(r => r.amount))) * 100)}%` }}
                              className="bg-emerald-500 h-full rounded-full"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
