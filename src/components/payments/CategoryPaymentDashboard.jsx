import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Send,
  FileText,
  Printer,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  Info
} from 'lucide-react';
import paymentApi from '../../api/paymentApi';
import RecordPaymentModal from './RecordPaymentModal';
import StudentFeePlanModal from './StudentFeePlanModal';
import ReceiptModal from './ReceiptModal';
import ConfigureFeePlanModal from './ConfigureFeePlanModal';

export default function CategoryPaymentDashboard({ category, onRefreshParent }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [feePlanModalOpen, setFeePlanModalOpen] = useState(false);
  const [selectedFeePlanId, setSelectedFeePlanId] = useState(null);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [configureModalOpen, setConfigureModalOpen] = useState(false);
  const [verifyingTxnId, setVerifyingTxnId] = useState(null);
  const [sendingReminderId, setSendingReminderId] = useState(null);

  const fetchCategoryPayments = async () => {
    try {
      const res = await paymentApi.getCategoryPayments(category);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(`Failed to load payments for ${category}:`, err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (category) {
      setLoading(true);
      fetchCategoryPayments();
    }
  }, [category]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchCategoryPayments();
  };

  const handleVerifyPayment = async (txnId) => {
    if (!window.confirm('Verify this payment transaction and generate official receipt?')) return;
    setVerifyingTxnId(txnId);
    try {
      const res = await paymentApi.verifyPayment(txnId);
      if (res.data.success) {
        alert(res.data.message || 'Payment verified successfully!');
        fetchCategoryPayments();
        if (res.data.data?.receipt) {
          setSelectedReceipt(res.data.data.receipt);
          setReceiptModalOpen(true);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifyingTxnId(null);
    }
  };

  const handleSendReminder = async (installmentId) => {
    setSendingReminderId(installmentId);
    try {
      const res = await paymentApi.sendManualReminder(installmentId);
      if (res.data.success) {
        alert(res.data.message || 'Payment reminder sent to mock sink successfully!');
        fetchCategoryPayments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch reminder');
    } finally {
      setSendingReminderId(null);
    }
  };

  const openRecordModalForStudent = (student) => {
    // Pick the earliest pending installment
    const pendingInst = student.installments?.find(
      (i) => i.status === 'Pending' || i.status === 'Partially Paid' || i.status === 'Unpaid'
    ) || student.installments?.[0] || {
      _id: 'dummy',
      installmentNumber: 1,
      principalAmount: student.monthlyInstallmentAmount || 2000,
      principalPaid: 0,
      principalPending: student.monthlyInstallmentAmount || 2000,
      dueDate: student.nextDueDate
    };

    setSelectedInstallment({
      ...pendingInst,
      principalPending: Math.max(0, (pendingInst.principalAmount || 2000) - (pendingInst.principalPaid || 0)),
      studentName: student.studentName,
      studentCode: student.studentCode,
      programName: student.programName
    });
    setSelectedStudent(student);
    setRecordModalOpen(true);
  };

  const handleViewReceiptByNumber = async (receiptNumber) => {
    try {
      const res = await paymentApi.getReceiptDetail(receiptNumber);
      if (res.data.success) {
        setSelectedReceipt(res.data.data);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      alert('Could not fetch receipt details.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3 bg-white/70 rounded-3xl p-8 border border-purple-100">
        <div className="w-9 h-9 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Loading {category} Payments & Financial Analytics...</p>
      </div>
    );
  }

  const summary = data?.summaryCards || {};
  const charts = data?.charts || {};
  const students = data?.students || [];
  const pendingTxns = data?.pendingVerificationTransactions || [];

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.programName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return s.paymentStatus?.toUpperCase() === statusFilter;
  });

  const collectionPercent = summary.expectedFees > 0
    ? Math.round((summary.collectedPrincipal / summary.expectedFees) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white/95 rounded-2xl border border-purple-100 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {category} Payment Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200">
              ₹2,000 / mo Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time fee collections, pending principal balance, and scheduled payment tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="px-3 py-2 bg-purple-50/70 hover:bg-purple-100/70 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Refresh payment records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setConfigureModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Configure Fee Plan</span>
          </button>
        </div>
      </div>

      {/* 2. Pending Verification Banner (if any) */}
      {pendingTxns.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 rounded-2xl bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{pendingTxns.length} Payment(s) Awaiting Admin Verification</span>
            </div>
            <span className="text-[10px] text-amber-700 font-mono bg-amber-100 px-2 py-0.5 rounded-full font-bold">
              Action Required
            </span>
          </div>

          <div className="divide-y divide-amber-100 text-xs">
            {pendingTxns.map((pt) => (
              <div key={pt._id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span>{pt.studentName}</span>
                    <span className="font-mono text-[10px] text-slate-500 font-normal">({pt.studentCode})</span>
                    <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 text-[10px] font-mono">
                      {pt.paymentMethod} • Ref: {pt.referenceId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Recorded on {new Date(pt.paymentDate).toLocaleDateString()} • Note: {pt.notes || 'None'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-slate-900 text-sm">
                    ₹{(pt.amount || 0).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleVerifyPayment(pt._id)}
                    disabled={verifyingTxnId === pt._id}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{verifyingTxnId === pt._id ? 'Verifying...' : 'Verify & Receipt'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Expected Fees */}
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Expected Fees</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900">
            ₹{(summary.expectedFees || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Agreed course commitments</p>
        </div>

        {/* Collected Principal */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>Principal Collected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black font-mono text-emerald-700">
            ₹{(summary.collectedPrincipal || 0).toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <span>{collectionPercent}% Collected</span>
          </div>
        </div>

        {/* Pending Principal */}
        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Pending Principal</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black font-mono text-amber-700">
            ₹{(summary.pendingPrincipal || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Future & current dues</p>
        </div>

        {/* Pending Accounts */}
        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Pending Accounts</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black font-mono text-amber-700">
            {summary.pendingCount || 0}
          </div>
          <div className="text-[10px] font-bold text-amber-600">
            {summary.pendingCount || 0} student(s) with pending balance
          </div>
        </div>

        {/* Student Status Summary */}
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Students Enrolled</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900">
            {students.length}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-600 font-bold">{summary.fullyPaidCount || 0} Paid</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{summary.pendingCount || 0} Pending</span>
          </div>
        </div>
      </div>

      {/* 4. Visual Financial Charts Section (4 SVG / Responsive Charts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Chart 1: Donut Collection vs Pending */}
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Collection Ratio
            </h3>
            <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
              {collectionPercent}%
            </span>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-purple-50"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Collected Ring */}
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${collectionPercent}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xs text-slate-400 font-bold">Collected</span>
                <span className="text-sm font-black font-mono text-emerald-600">
                  {collectionPercent}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 text-xs border-t border-purple-50">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Collected Principal:</span>
              </span>
              <strong className="font-mono text-slate-800">
                ₹{(summary.collectedPrincipal || 0).toLocaleString()}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Pending Principal:</span>
              </span>
              <strong className="font-mono text-slate-800">
                ₹{(summary.pendingPrincipal || 0).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Chart 2: Program Comparison */}
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Program Comparison
            </h3>
            <span className="text-[10px] text-slate-400">Principal</span>
          </div>

          <div className="space-y-3 py-1">
            {(charts.programComparison || []).slice(0, 3).map((prog, idx) => {
              const totalProg = (prog.collected || 0) + (prog.pending || 0);
              const progPercent = totalProg > 0 ? Math.round((prog.collected / totalProg) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate max-w-[130px]" title={prog.programName}>
                      {prog.programName}
                    </span>
                    <span className="font-mono text-[11px] text-purple-700 font-bold">
                      ₹{(prog.collected || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-purple-50 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progPercent}%` }}
                    />
                    <div
                      className="bg-amber-300 h-full transition-all duration-500"
                      style={{ width: `${100 - progPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{progPercent}% Paid</span>
                    <span>Pend: ₹{(prog.pending || 0).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Monthly Collection Trend */}
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Monthly Inflows
            </h3>
            <span className="text-[10px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded font-bold">
              Trend
            </span>
          </div>

          <div className="h-28 flex items-end justify-between gap-1.5 pt-4 px-1">
            {(charts.monthlyCollections || []).map((m, idx) => {
              const maxAmt = Math.max(...(charts.monthlyCollections || []).map((x) => x.amount || 1), 1);
              const heightPct = Math.max(15, Math.round(((m.amount || 0) / maxAmt) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] font-mono text-purple-700 opacity-0 group-hover:opacity-100 transition font-bold">
                    ₹{(m.amount || 0).toLocaleString()}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-md hover:from-purple-700 hover:to-pink-600 transition-all cursor-pointer shadow-2xs"
                    style={{ height: `${heightPct}%` }}
                    title={`${m.month}: ₹${(m.amount || 0).toLocaleString()}`}
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-500">{m.month}</span>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 text-center border-t border-purple-50 pt-1.5">
            Historical collections by billing cycle
          </p>
        </div>

        {/* Chart 4: Student Status Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Student Status
            </h3>
            <span className="text-[10px] text-slate-400">Total: {students.length}</span>
          </div>

          <div className="space-y-2 py-1">
            {(charts.paymentStatusDistribution || []).map((item, idx) => {
              const totalSt = students.length || 1;
              const pct = Math.round((item.count / totalSt) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span>{item.status}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 5. Student Payment Table with Search & Status Tabs */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-2xs overflow-hidden space-y-4 p-6">
        
        {/* Table Filters Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-purple-50">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Enrolled Students Fee Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Tracking ₹2,000 monthly installments and scheduled payment statuses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or ID..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-purple-50/40 border border-purple-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 text-slate-800 font-medium"
              />
            </div>

            {/* Status Pills */}
            <div className="inline-flex rounded-xl bg-purple-50/60 p-1 border border-purple-100 text-[11px] font-bold">
              {['ALL', 'PAID', 'PARTIALLY PAID', 'PENDING'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition capitalize cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-purple-900 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-purple-100 text-slate-400 font-mono uppercase text-[10px] tracking-wider bg-purple-50/30">
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Program / Cohort</th>
                <th className="py-3 px-3">Agreed Fee</th>
                <th className="py-3 px-3">Monthly / Paid</th>
                <th className="py-3 px-3">Principal Due</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    No students found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const isPaid = st.paymentStatus === 'Paid';
                  const isPartial = st.paymentStatus === 'Partially Paid';
                  const isPending = !isPaid && !isPartial;

                  return (
                    <tr key={st.feePlanId} className="hover:bg-purple-50/40 transition">
                      {/* Student Info */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{st.studentName}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {st.studentCode} • {st.studentEmail}
                        </div>
                      </td>

                      {/* Program */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800 truncate max-w-[150px]" title={st.programName}>
                          {st.programName}
                        </div>
                        <div className="text-[10px] text-purple-600 font-mono">
                          {st.courseDuration ? `${st.courseDuration} • ` : ''}Tutor: {st.assignedTutorName || 'Assigned Staff'}
                        </div>
                      </td>

                      {/* Agreed Fee */}
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                        ₹{(st.totalAgreedFee || 0).toLocaleString()}
                      </td>

                      {/* Monthly & Paid */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-bold text-emerald-700">
                          ₹{(st.amountPaid || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ₹{(st.monthlyInstallmentAmount || 2000).toLocaleString()}/mo
                        </div>
                      </td>

                      {/* Principal Due */}
                      <td className="py-3.5 px-3 font-mono">
                        <div className="font-bold text-amber-700">
                          ₹{(st.remainingPrincipal || 0).toLocaleString()}
                        </div>
                        {st.nextDueDate && (
                          <div className="text-[10px] text-slate-400">
                            Due: {new Date(st.nextDueDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Paid in Full</span>
                          </span>
                        )}
                        {isPartial && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>Partially Paid</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Record Payment */}
                          {!isPaid && (
                            <button
                              onClick={() => openRecordModalForStudent(st)}
                              className="px-2.5 py-1.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Record payment for this student"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Record</span>
                            </button>
                          )}

                          {/* Send Reminder (for Pending / Unpaid) */}
                          {!isPaid && st.installments?.[0] && (
                            <button
                              onClick={() => handleSendReminder(st.installments[0]._id)}
                              disabled={sendingReminderId === st.installments[0]._id}
                              className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Dispatch fee reminder email"
                            >
                              <Send className="w-3 h-3" />
                              <span>Reminder</span>
                            </button>
                          )}

                          {/* View Plan / History */}
                          <button
                            onClick={() => {
                              setSelectedFeePlanId(st.feePlanId);
                              setFeePlanModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            title="View Installment Schedule & Transactions"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Schedule</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modals Mounting */}
      <RecordPaymentModal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        onSuccess={() => {
          fetchCategoryPayments();
          if (onRefreshParent) onRefreshParent();
        }}
        installment={selectedInstallment}
        student={selectedStudent}
        category={category}
        isAdmin={true}
      />

      <StudentFeePlanModal
        isOpen={feePlanModalOpen}
        onClose={() => setFeePlanModalOpen(false)}
        feePlanId={selectedFeePlanId}
        onRecordPaymentClick={(inst, stu) => {
          setSelectedInstallment(inst);
          setSelectedStudent(stu);
          setRecordModalOpen(true);
        }}
        onViewReceiptClick={(receipt) => {
          setSelectedReceipt(receipt);
          setReceiptModalOpen(true);
        }}
      />

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />

      <ConfigureFeePlanModal
        isOpen={configureModalOpen}
        onClose={() => setConfigureModalOpen(false)}
        onSuccess={() => {
          fetchCategoryPayments();
          if (onRefreshParent) onRefreshParent();
        }}
        initialCategory={category}
      />
    </div>
  );
}
