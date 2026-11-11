import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  Filter,
  RefreshCw,
  Send,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import paymentApi from '../../api/paymentApi';
import RecordPaymentModal from './RecordPaymentModal';
import StudentFeeHistoryModal from './StudentFeeHistoryModal';

export default function FeeManagementDashboard({ showHeader = true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Paid' | 'Pending' | 'Partially Paid'
  const [triggeringReminders, setTriggeringReminders] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);

  // Modals state
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedStudentIdForHistory, setSelectedStudentIdForHistory] = useState(null);

  const fetchFeeDashboard = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await paymentApi.getAdminFeeDashboard();
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin fee dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeeDashboard();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchFeeDashboard(false);
  };

  const handleTriggerReminders = async () => {
    setTriggeringReminders(true);
    try {
      const res = await paymentApi.triggerFeeReminders();
      if (res.data?.success) {
        setNotificationMsg({
          type: 'success',
          text: res.data.message || 'Fee reminder cycle evaluated and dispatched.'
        });
        fetchFeeDashboard(true);
      }
    } catch (err) {
      setNotificationMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to trigger reminders.'
      });
    } finally {
      setTriggeringReminders(false);
      setTimeout(() => setNotificationMsg(null), 5000);
    }
  };

  const summary = data?.summary || {
    totalExpectedFees: 0,
    totalFeesCollected: 0,
    totalPendingFees: 0,
    paidStudentsCount: 0,
    pendingStudentsCount: 0,
    totalStudentsCount: 0
  };

  const students = data?.students || [];
  const monthlyReports = data?.monthlyCollectionReport || [];

  const filteredStudents = students.filter(st => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (st.name || '').toLowerCase().includes(q) ||
      (st.studentId || '').toLowerCase().includes(q) ||
      (st.courseTitle || '').toLowerCase().includes(q) ||
      (st.email || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || st.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Optional Top Section Header */}
      {showHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-100 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              <span>Institutional Fee Operations</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
              <span>Student Fee Management & Collections</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage student fees, monthly collections, pending payments and billing reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleTriggerReminders}
              disabled={triggeringReminders}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              title="Run 3-day pre-due, due-date, and overdue reminder checks across active students"
            >
              <Send className={`w-3.5 h-3.5 ${triggeringReminders ? 'animate-pulse' : ''}`} />
              <span>{triggeringReminders ? 'Checking Reminders...' : 'Run Automatic Reminders'}</span>
            </button>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-3 py-2 bg-white hover:bg-purple-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}

      {/* Notification Banner */}
      {notificationMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold border shadow-xs flex items-center space-x-2 ${
          notificationMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {notificationMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* 1. Five KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Expected */}
        <div className="bg-white border border-purple-100/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Total Expected Fees
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              ₹{(summary.totalExpectedFees || 0).toLocaleString('en-IN')}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">₹2,000/mo per active student</p>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 font-mono">
              Total Fees Collected
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              ₹{(summary.totalFeesCollected || 0).toLocaleString('en-IN')}
            </span>
            <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Verified bank/UPI/cash</p>
          </div>
        </div>

        {/* Total Pending */}
        <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 font-mono">
              Total Pending Fees
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
              ₹{(summary.totalPendingFees || 0).toLocaleString('en-IN')}
            </span>
            <p className="text-[10px] text-amber-700 font-bold mt-0.5">Outstanding current dues</p>
          </div>
        </div>

        {/* Paid Students */}
        <div className="bg-white border border-purple-100/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Paid Students
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {summary.paidStudentsCount || 0}
            </span>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Up-to-date with fee payment</p>
          </div>
        </div>

        {/* Pending Students */}
        <div className="bg-white border border-purple-100/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Pending Students
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {summary.pendingStudentsCount || 0}
            </span>
            <p className="text-[10px] text-amber-600 font-bold mt-0.5">Awaiting fee collection</p>
          </div>
        </div>
      </div>

      {/* 2. Monthly Collection Report */}
      <div className="bg-white border border-purple-100/90 shadow-xs rounded-3xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
              <FileSpreadsheet className="w-4 h-4 text-purple-600" />
              <span>Monthly Collection Report</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Aggregated monthly collections, pending dues, and billing reconciliation.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Automated Billing Cycle: Monthly (₹2,000)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {monthlyReports.map((report, idx) => (
            <div key={idx} className="bg-purple-50/40 border border-purple-100 rounded-2xl p-3.5 space-y-2">
              <span className="text-xs font-black text-slate-800">{report.month}</span>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Collected:</span>
                  <strong className="text-emerald-600 font-mono">₹{report.collected.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Pending:</span>
                  <strong className="text-amber-600 font-mono">₹{report.pending.toLocaleString('en-IN')}</strong>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-500 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((report.collected / (report.expected || 1)) * 100))}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Student Fee Ledger & Collections Table */}
      <div className="bg-white border border-purple-100/90 shadow-xs rounded-3xl p-5 space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <span>Enrolled Students Fee Ledger</span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                {filteredStudents.length} Students
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Click <strong className="text-purple-600 font-semibold">Collect Fee</strong> to record student payments or <strong className="text-purple-600 font-semibold">View History</strong> for complete fee ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, ID, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none w-56"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {['ALL', 'Paid', 'Pending'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-2xl border border-purple-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-purple-50/80 text-slate-700 font-bold border-b border-purple-200">
              <tr>
                <th className="py-2.5 px-3">Student Info</th>
                <th className="py-2.5 px-3">Course / Domain</th>
                <th className="py-2.5 px-3">Monthly Fee</th>
                <th className="py-2.5 px-3">Total Paid</th>
                <th className="py-2.5 px-3">Current Pending</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {filteredStudents.map((st) => (
                <tr key={st.userId} className="hover:bg-purple-50/30 transition">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-purple-700 text-xs bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                        {st.studentId}
                      </span>
                      <span className="font-extrabold text-slate-900">{st.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono text-purple-700/80">@{st.username}</span> • {st.email}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800 block">{st.courseTitle}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Domain: {st.domain || 'Technical'}</span>
                  </td>

                  <td className="py-3 px-3 font-mono font-black text-slate-900 text-xs">
                    ₹{(st.monthlyFee || 2000).toLocaleString('en-IN')}/mo
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                    ₹{(st.amountPaid || 0).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-amber-600">
                    ₹{(st.pendingAmount || 0).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      st.paymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : st.paymentStatus === 'Partially Paid'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {st.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    {st.dueDate ? new Date(st.dueDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : '—'}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedStudentForPayment(st);
                          setRecordModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg shadow-2xs transition flex items-center space-x-1 cursor-pointer"
                        title="Collect & Record Student Fee"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Collect Fee</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedStudentIdForHistory(st.userId || st.studentId);
                          setHistoryModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition flex items-center space-x-1 cursor-pointer"
                        title="View Complete Fee History"
                      >
                        <Eye className="w-3 h-3" />
                        <span>History</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CreditCard className="w-8 h-8 text-purple-300 stroke-[1.5]" />
                      <p className="font-bold text-xs text-slate-600">No student fee records found</p>
                      <p className="text-[11px] text-slate-400">
                        {searchQuery ? 'Try clearing your search query or status filter.' : 'All enrolled students will appear here automatically.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={recordModalOpen}
        onClose={() => {
          setRecordModalOpen(false);
          setSelectedStudentForPayment(null);
        }}
        onSuccess={() => {
          fetchFeeDashboard(true);
        }}
        student={selectedStudentForPayment}
        installment={selectedStudentForPayment ? {
          _id: selectedStudentForPayment.installmentId,
          installmentNumber: selectedStudentForPayment.installmentNumber,
          principalAmount: selectedStudentForPayment.monthlyFee || 2000,
          studentName: selectedStudentForPayment.name,
          studentCode: selectedStudentForPayment.studentId,
          programName: selectedStudentForPayment.courseTitle
        } : null}
      />

      {/* Student Fee Payment History Modal */}
      <StudentFeeHistoryModal
        isOpen={historyModalOpen}
        onClose={() => {
          setHistoryModalOpen(false);
          setSelectedStudentIdForHistory(null);
        }}
        studentId={selectedStudentIdForHistory}
        onPaymentRecorded={() => {
          fetchFeeDashboard(true);
        }}
      />
    </div>
  );
}
