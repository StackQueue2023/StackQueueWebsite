import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  Clock,
  CreditCard,
  Send,
  CheckCircle2,
  Calendar,
  DollarSign,
  ShieldAlert,
  RefreshCw,
  Search,
  UserCheck
} from 'lucide-react';
import paymentApi from '../../api/paymentApi';
import RecordPaymentModal from '../../components/payments/RecordPaymentModal';

export default function TutorPaymentFollowupPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Record Payment Modal
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchTutorFollowups = async () => {
    try {
      const res = await paymentApi.getTutorPaymentFollowups();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tutor payment followups:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTutorFollowups();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchTutorFollowups();
  };

  const handleOpenRecordPayment = (inst) => {
    const plan = inst.feePlanId || {};
    const pPending = Math.max(0, (inst.principalAmount || 2000) - (inst.principalPaid || 0));

    setSelectedInstallment({
      ...inst,
      principalPending: pPending,
      studentName: inst.studentName || plan.studentName,
      studentCode: inst.studentCode || plan.studentCode,
      programName: inst.programName || plan.programName
    });
    setSelectedStudent({
      studentName: inst.studentName || plan.studentName,
      studentCode: inst.studentCode || plan.studentCode,
      programName: inst.programName || plan.programName
    });
    setRecordModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Loading student fee follow-up records...</p>
      </div>
    );
  }

  const pendingList = data?.pendingInstallments || data?.overdueInstallments || [];
  const pendingTxns = data?.pendingTransactions || [];
  const reminderHistory = data?.reminderHistory || [];

  const filteredPending = pendingList.filter((inst) => {
    const plan = inst.feePlanId || {};
    const sName = (inst.studentName || plan.studentName || '').toLowerCase();
    const sCode = (inst.studentCode || plan.studentCode || '').toLowerCase();
    const pName = (inst.programName || plan.programName || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return sName.includes(q) || sCode.includes(q) || pName.includes(q);
  });

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 text-slate-900 relative overflow-hidden shadow-xs">
        <div className="bg-white absolute -right-10 -bottom-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-blue-800 font-mono text-xs uppercase tracking-widest font-bold bg-white px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Tutor Portal • Payment Follow-up Desk</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
              <UserCheck className="w-7 h-7 text-blue-800 shrink-0" />
              <span>Assigned Students Payment Follow-Ups</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Assigned students with pending fee installments. Tutors can record student payments for admin verification.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white hover:bg-white text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Follow-Ups</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Pending Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Pending Installments</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-700">
            {pendingList.length}
          </div>
          <p className="text-[10px] text-slate-400">Awaiting student payment completion</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Pending Admin Verification</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-700">
            {pendingTxns.length}
          </div>
          <p className="text-[10px] text-slate-400">Submitted payments under review</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-blue-800 text-xs font-semibold">
            <span>Automated Reminders Sent</span>
            <Send className="w-4 h-4 text-blue-800" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-900">
            {reminderHistory.length}
          </div>
          <p className="text-[10px] text-slate-400">Delivered to mock email sink</p>
        </div>
      </div>

      {/* 3. Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-50">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Assigned Students: Pending Installments
            </h3>
            <p className="text-xs text-slate-500">
              Assigned students with pending payments. You can record payments directly on their behalf.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or program..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-white border border-blue-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 text-slate-800 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-blue-200 text-slate-400 font-mono uppercase text-[10px] tracking-wider bg-white">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Program / Category</th>
                <th className="py-2.5 px-3">Installment #</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Principal Due</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {filteredPending.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    No pending student installments requiring follow-up at this time.
                  </td>
                </tr>
              ) : (
                filteredPending.map((inst) => {
                  const plan = inst.feePlanId || {};
                  const studentName = inst.studentName || plan.studentName || 'Student';
                  const studentCode = inst.studentCode || plan.studentCode || 'STU-000';
                  const pPending = Math.max(0, (inst.principalAmount || 2000) - (inst.principalPaid || 0));

                  return (
                    <tr key={inst._id} className="hover:bg-white transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{studentName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{studentCode}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {inst.programName || plan.programName || 'Training Program'}
                        </div>
                        <div className="text-[10px] text-blue-800 font-mono">
                          {inst.category || plan.category || 'Courses'}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        #{inst.installmentNumber}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-800">
                        {new Date(inst.dueDate).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-3 font-mono font-black text-amber-700">
                        ₹{pPending.toLocaleString()}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleOpenRecordPayment(inst)}
                          className="bg-white px-3 py-1.5 text-blue-800 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 shadow-xs cursor-pointer border border-[#9333EA]"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Record Payment</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Payment Submission Modal for Tutor */}
      <RecordPaymentModal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        onSuccess={fetchTutorFollowups}
        installment={selectedInstallment}
        student={selectedStudent}
        category={selectedInstallment?.category || 'Courses'}
        isAdmin={false} // Will mark as 'Pending Verification'
      />
    </div>
  );
}
