import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Calendar,
  Send,
  FileText,
  User,
  GraduationCap,
  Layers,
  DollarSign,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import paymentApi from '../../api/paymentApi';

export default function StudentFeeHistoryModal({ isOpen, onClose, studentId, onPaymentRecorded }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('installments'); // 'installments' | 'transactions' | 'reminders'

  const fetchHistory = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await paymentApi.getStudentFeeHistory(studentId);
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching student fee history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && studentId) {
      fetchHistory();
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const student = data?.student || {};
  const installments = data?.installments || [];
  const transactions = data?.transactions || [];
  const reminderLogs = data?.reminderLogs || [];

  const totalPaid = transactions
    .filter(t => t.status === 'Verified')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const pendingAmount = installments
    .filter(i => i.status !== 'Paid')
    .reduce((sum, i) => sum + Math.max(0, (i.principalAmount || 2000) - (i.principalPaid || 0)), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black tracking-tight">{student.name || 'Student Fee Record'}</h3>
                <span className="font-mono text-xs bg-white/25 px-2 py-0.5 rounded-full font-bold">
                  {student.studentId || 'STU'}
                </span>
              </div>
              <p className="text-xs text-purple-100 mt-0.5">
                {student.course || 'Course Track'} • Domain: {student.domain || 'Technical Domain'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="p-5 border-b border-purple-100 bg-purple-50/40 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Monthly Fee</span>
            <p className="text-base font-black text-slate-900 font-mono mt-0.5">
              ₹{(student.monthlyFee || 2000).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-purple-600 font-bold">Billing Cycle: Monthly</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Total Collected</span>
            <p className="text-base font-black text-emerald-600 font-mono mt-0.5">
              ₹{totalPaid.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-emerald-700 font-bold">{transactions.length} Verified Txn(s)</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Current Pending</span>
            <p className="text-base font-black text-amber-600 font-mono mt-0.5">
              ₹{pendingAmount.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-amber-700 font-bold">Due for this cycle</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Current Status</span>
            <p className="mt-1">
              <span className={`px-2.5 py-1 text-xs font-extrabold rounded-full border ${
                student.feePaymentStatus === 'Paid'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : student.feePaymentStatus === 'Partially Paid'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {student.feePaymentStatus || 'Pending'}
              </span>
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 px-5 pt-3 border-b border-purple-100 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('installments')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'installments'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Installments ({installments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'transactions'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Payment Transactions ({transactions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'reminders'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Reminder Logs ({reminderLogs.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-500 mt-3">Loading fee records from database...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: INSTALLMENTS */}
              {activeTab === 'installments' && (
                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-2xl border border-purple-100">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-purple-50/80 text-slate-700 font-bold border-b border-purple-200">
                        <tr>
                          <th className="py-2.5 px-3">Billing Cycle</th>
                          <th className="py-2.5 px-3">Due Date</th>
                          <th className="py-2.5 px-3">Monthly Amount</th>
                          <th className="py-2.5 px-3">Paid Amount</th>
                          <th className="py-2.5 px-3">Balance</th>
                          <th className="py-2.5 px-3">Payment Status</th>
                          <th className="py-2.5 px-3">Last Reminder</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-50">
                        {installments.map((inst) => {
                          const pDue = Math.max(0, (inst.principalAmount || 2000) - (inst.principalPaid || 0));
                          return (
                            <tr key={inst._id} className="hover:bg-purple-50/30 transition">
                              <td className="py-3 px-3 font-bold text-slate-900">
                                Month #{inst.installmentNumber || 1}
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-600">
                                {new Date(inst.dueDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                ₹{(inst.principalAmount || 2000).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                                ₹{(inst.principalPaid || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-amber-600">
                                ₹{pDue.toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  inst.status === 'Paid'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : inst.status === 'Partially Paid'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {inst.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-[11px] text-slate-500">
                                {inst.lastReminderDate ? (
                                  <span>
                                    {new Date(inst.lastReminderDate).toLocaleDateString('en-IN')} ({inst.lastReminderType || `${inst.reminderCount} sent`})
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {installments.length === 0 && (
                          <tr>
                            <td colSpan="7" className="py-8 text-center text-slate-400">
                              No monthly installments generated yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: TRANSACTIONS */}
              {activeTab === 'transactions' && (
                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-2xl border border-purple-100">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-purple-50/80 text-slate-700 font-bold border-b border-purple-200">
                        <tr>
                          <th className="py-2.5 px-3">Transaction ID</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Payment Mode</th>
                          <th className="py-2.5 px-3">Reference / Txn No.</th>
                          <th className="py-2.5 px-3">Receipt No.</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-50">
                        {transactions.map((tx) => (
                          <tr key={tx._id} className="hover:bg-purple-50/30 transition">
                            <td className="py-3 px-3 font-mono font-bold text-purple-700">
                              {tx.transactionId}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600">
                              {new Date(tx.paymentDate || tx.createdAt).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-3 px-3 font-mono font-black text-emerald-600 text-sm">
                              ₹{(tx.amount || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-bold text-slate-700 border border-slate-200 text-[10px]">
                                {tx.paymentMethod || 'UPI'}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                              {tx.referenceId || '—'}
                            </td>
                            <td className="py-3 px-3 font-mono text-xs text-purple-600 font-bold">
                              {tx.receiptNumber || 'REC-ISSUED'}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {tx.status || 'Verified'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {transactions.length === 0 && (
                          <tr>
                            <td colSpan="7" className="py-8 text-center text-slate-400">
                              No payment transactions recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: REMINDERS */}
              {activeTab === 'reminders' && (
                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-2xl border border-purple-100">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-purple-50/80 text-slate-700 font-bold border-b border-purple-200">
                        <tr>
                          <th className="py-2.5 px-3">Reminder Milestone</th>
                          <th className="py-2.5 px-3">Dispatched Date</th>
                          <th className="py-2.5 px-3">Amount Due</th>
                          <th className="py-2.5 px-3">Due Date</th>
                          <th className="py-2.5 px-3">Subject</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-50">
                        {reminderLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-purple-50/30 transition">
                            <td className="py-3 px-3 font-bold text-purple-700">
                              {log.reminderType || 'Monthly Reminder'}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600">
                              {new Date(log.sentAt || log.createdAt).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-amber-600">
                              ₹{(log.amountDue || 2000).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600">
                              {log.dueDate ? new Date(log.dueDate).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td className="py-3 px-3 text-[11px] text-slate-700 max-w-xs truncate" title={log.subject}>
                              {log.subject}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                {log.status || 'Delivered'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {reminderLogs.length === 0 && (
                          <tr>
                            <td colSpan="6" className="py-8 text-center text-slate-400">
                              No reminder dispatches logged for this student yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-100 bg-slate-50 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500">
            Records retrieved directly from database • Linked by Student ID & Course ID
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
