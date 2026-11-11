import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Send,
  Info,
  RefreshCw
} from 'lucide-react';
import paymentApi from '../../api/paymentApi';
import ReceiptModal from '../../components/payments/ReceiptModal';

export default function StudentPaymentsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('installments'); // 'installments' | 'transactions' | 'reminders'
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const fetchStudentPayments = async () => {
    try {
      const res = await paymentApi.getStudentMyPayments();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load student payments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentPayments();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchStudentPayments();
  };

  const handleOpenReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setReceiptModalOpen(true);
  };

  const handleOpenReceiptByNumber = async (receiptNumber) => {
    try {
      const res = await paymentApi.getReceiptDetail(receiptNumber);
      if (res.data.success) {
        setSelectedReceipt(res.data.data);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      alert('Could not retrieve receipt document.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Loading your fee schedule and payment history...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const feePlans = data?.feePlans || [];
  const installments = data?.installments || [];
  const transactions = data?.transactions || [];
  const receipts = data?.receipts || [];
  const reminders = data?.reminders || [];
  const activePlan = feePlans[0] || {};

  const paidPercent = summary.totalAgreedFee > 0
    ? Math.round((summary.totalPaidPrincipal / summary.totalAgreedFee) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-50/70 via-fuchsia-50/50 to-pink-50/60 border border-purple-200/80 p-6 md:p-8 text-slate-900 relative overflow-hidden shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold bg-purple-100/80 px-3 py-1 rounded-full border border-purple-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Student Academy Fee Portal • Demo Mode</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
              <CreditCard className="w-7 h-7 text-purple-600 shrink-0" />
              <span>My Fees & Installment Schedule</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Transparent monthly billing schedule, verified receipts, and payment status breakdown for your enrolled programs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Program Commitment Card */}
      {activePlan && (
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-50">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                {activePlan.category || 'Courses'} Program
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                {activePlan.programName || 'Institute Degree Track'}
              </h2>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-[11px] font-mono text-slate-500">Student ID:</span>
              <div className="font-mono font-bold text-slate-800">{activePlan.studentCode}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block text-[11px]">Course Duration</span>
              <strong className="text-slate-900 font-bold font-mono">
                {activePlan.courseDuration || activePlan.courseId?.durationText || (activePlan.courseId?.durationWeeks ? `${activePlan.courseId.durationWeeks} Weeks` : '12 Weeks')} ({activePlan.totalHours || activePlan.courseId?.totalHours || 120} Hours)
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Monthly Installment</span>
              <strong className="font-mono text-purple-900 font-bold">
                ₹{(activePlan.monthlyInstallmentAmount || 2000).toLocaleString()} / month
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Payment Schedule</span>
              <strong className="text-purple-700 font-bold font-mono">
                {installments.length} Monthly Installments
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Next Due Date</span>
              <strong className="text-amber-700 font-semibold font-mono">
                {(() => {
                  const pending = installments.find(i => i.status === 'Pending' || i.status === 'Partially Paid');
                  return pending ? new Date(pending.dueDate).toLocaleDateString() : 'All Cleared';
                })()}
              </strong>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div className="text-slate-500 font-medium">
              Assigned Mentor: <strong className="text-slate-800 font-semibold">{activePlan.assignedTutorName || 'Institute Senior Mentor'}</strong>
            </div>
            {Number(activePlan.downPaymentCollected) > 0 && (
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Down Payment: ₹{Number(activePlan.downPaymentCollected).toLocaleString()} ({activePlan.downPaymentMethod || 'Cash'})
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Agreed Fee */}
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
            <span>Total Program Fee</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </span>
          <div className="text-xl font-black font-mono text-slate-900">
            ₹{(summary.totalAgreedFee || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400">Total agreed commitment</p>
        </div>

        {/* Principal Paid */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-emerald-700 flex items-center justify-between">
            <span>Principal Paid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </span>
          <div className="text-xl font-black font-mono text-emerald-700">
            ₹{(summary.totalPaidPrincipal || 0).toLocaleString()}
          </div>
          <div className="text-[10px] font-bold text-emerald-600">
            {paidPercent}% of agreed fee paid
          </div>
        </div>

        {/* Remaining Principal */}
        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-amber-700 flex items-center justify-between">
            <span>Remaining Principal</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </span>
          <div className="text-xl font-black font-mono text-amber-700">
            ₹{(summary.remainingPrincipal || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400">Principal balance</p>
        </div>
      </div>

      {/* 4. Navigation Tabs for Details */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-2xs overflow-hidden p-6 space-y-5">
        
        {/* Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-50">
          <div className="inline-flex rounded-xl bg-purple-50/70 p-1 border border-purple-100 text-xs font-bold">
            <button
              onClick={() => setActiveTab('installments')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'installments'
                  ? 'bg-white text-purple-900 shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Installment Schedule ({installments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-white text-purple-900 shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payment History & Receipts ({transactions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reminders'
                  ? 'bg-white text-purple-900 shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reminder Notifications ({reminders.length})</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-purple-600 font-semibold">
            All Receipts Verifiable Online
          </span>
        </div>

        {/* TAB 1: INSTALLMENTS */}
        {activeTab === 'installments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-purple-100 text-slate-400 font-mono uppercase text-[10px] tracking-wider bg-purple-50/30">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Principal Due</th>
                  <th className="py-2.5 px-3">Principal Paid</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Receipt / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {installments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No installments scheduled for this program.
                    </td>
                  </tr>
                ) : (
                  installments.map((inst) => {
                    const isPaid = inst.status === 'Paid';
                    const isPartial = inst.status === 'Partially Paid';
                    const isPending = !isPaid && !isPartial;

                    return (
                      <tr key={inst._id} className="hover:bg-purple-50/30 transition">
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          #{inst.installmentNumber}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-800">
                          {new Date(inst.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          ₹{(inst.principalAmount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                          ₹{(inst.principalPaid || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          {isPaid && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Paid</span>
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
                        <td className="py-3 px-3 text-right">
                          {isPaid && receipts[0] ? (
                            <button
                              onClick={() => handleOpenReceipt(receipts[0])}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3 h-3" />
                              <span>E-Receipt</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-mono">
                              Scheduled
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: TRANSACTIONS & RECEIPTS */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-purple-100 text-slate-400 font-mono uppercase text-[10px] tracking-wider bg-purple-50/30">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Reference / ID</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Total Paid</th>
                    <th className="py-2.5 px-3">Allocation</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Official Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-purple-50/30 transition">
                        <td className="py-3 px-3 font-mono text-slate-800">
                          {new Date(tx.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          {tx.referenceId}
                        </td>
                        <td className="py-3 px-3 font-semibold text-purple-700">
                          {tx.paymentMethod}
                        </td>
                        <td className="py-3 px-3 font-mono font-black text-slate-900">
                          ₹{(tx.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          Principal: ₹{(tx.principalAllocated || tx.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          {tx.status === 'Verified' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending Verification</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {tx.receiptNumber ? (
                            <button
                              onClick={() => handleOpenReceiptByNumber(tx.receiptNumber)}
                              className="px-3 py-1 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <FileText className="w-3 h-3" />
                              <span>{tx.receiptNumber}</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px]">Awaiting verification</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REMINDER NOTIFICATIONS */}
        {activeTab === 'reminders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-purple-100 text-slate-400 font-mono uppercase text-[10px] tracking-wider bg-purple-50/30">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Subject / Type</th>
                  <th className="py-2.5 px-3">Recipient Email</th>
                  <th className="py-2.5 px-3">Amount Due</th>
                  <th className="py-2.5 px-3">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {reminders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No reminder notifications logged for your account.
                    </td>
                  </tr>
                ) : (
                  reminders.map((rem) => (
                    <tr key={rem._id} className="hover:bg-purple-50/30 transition">
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {new Date(rem.sentAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {rem.subject || rem.reminderType}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {rem.recipientEmail}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        ₹{(rem.amountDue || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <span>Delivered (Mock Sink)</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
}
