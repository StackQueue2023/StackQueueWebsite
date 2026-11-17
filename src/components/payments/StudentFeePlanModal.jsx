import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  User,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import paymentApi from '../../api/paymentApi';

export default function StudentFeePlanModal({
  isOpen,
  onClose,
  feePlanId,
  onRecordPaymentClick,
  onViewReceiptClick
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('installments'); // 'installments' | 'transactions' | 'reminders'
  const [sendingReminderId, setSendingReminderId] = useState(null);

  const loadDetail = async () => {
    if (!feePlanId) return;
    setLoading(true);
    try {
      const res = await paymentApi.getStudentPaymentDetail(feePlanId);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load student payment detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && feePlanId) {
      loadDetail();
    }
  }, [isOpen, feePlanId]);

  if (!isOpen) return null;

  const handleSendReminder = async (installmentId) => {
    setSendingReminderId(installmentId);
    try {
      const res = await paymentApi.sendManualReminder(installmentId);
      if (res.data.success) {
        alert(res.data.message || 'Reminder logged and sent via mock sink.');
        loadDetail();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reminder');
    } finally {
      setSendingReminderId(null);
    }
  };

  const plan = data?.feePlan;
  const installments = data?.installments || [];
  const transactions = data?.transactions || [];
  const reminderLogs = data?.reminderLogs || [];

  const totalPaid = installments.reduce((acc, i) => acc + (i.principalPaid || 0), 0);
  const remainingPrincipal = Math.max(0, (plan?.totalAgreedFee || 0) - totalPaid);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Hero */}
        <div className="bg-white p-6 shrink-0 border-b border-blue-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white text-[#9333EA] border border-blue-200">
                  {plan?.studentCode || 'STU-ID'}
                </span>
                <span className="bg-white px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#9333EA] border border-blue-200">
                  {plan?.category || 'Category'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#0F172A]">
                {plan?.studentName || 'Student Name'}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Program: <strong className="text-slate-900 font-bold">{plan?.programName}</strong> • Duration: <strong className="text-slate-900 font-bold">{plan?.courseDuration || (plan?.courseId?.durationText || (plan?.courseId?.durationWeeks ? `${plan.courseId.durationWeeks} Weeks` : '12 Weeks'))} ({plan?.totalHours || plan?.courseId?.totalHours || 120} Hours)</strong> • Tutor: <strong className="text-slate-900 font-bold">{plan?.assignedTutorName}</strong>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:text-[#9333EA] border border-blue-200 hover:border-[#9333EA] bg-white rounded-full transition shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-blue-200 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">Total Agreed Fee</span>
              <strong className="text-base text-slate-900 font-black">₹{(plan?.totalAgreedFee || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Verified Paid</span>
              <strong className="text-base text-emerald-700 font-black">₹{totalPaid.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Remaining Principal</span>
              <strong className="text-base text-[#E02B91] font-black">₹{remainingPrincipal.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Monthly Due / Installment</span>
              <strong className="text-base text-amber-700 font-black">₹{(plan?.monthlyInstallmentAmount || 2000).toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-blue-200 bg-white px-6 shrink-0 gap-2">
          {[
            { id: 'installments', label: `Installments (${installments.length})` },
            { id: 'transactions', label: `Payment Transactions (${transactions.length})` },
            { id: 'reminders', label: `Reminder Logs (${reminderLogs.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 ${ activeTab === tab.id ? 'border-[#8B2BE2] text-purple-900 bg-white shadow-2xs' : 'border-transparent text-slate-500 hover:text-blue-800' }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading student financial records...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: INSTALLMENTS */}
              {activeTab === 'installments' && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-blue-200 overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white border-b border-blue-200 font-mono text-[10px] uppercase font-bold text-purple-900">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Due Date</th>
                          <th className="py-2.5 px-3">Principal Due</th>
                          <th className="py-2.5 px-3">Paid</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-50">
                        {installments.map(inst => {
                          const pPending = Math.max(0, (inst.principalAmount || 0) - (inst.principalPaid || 0));

                          return (
                            <tr key={inst._id} className="hover:bg-white transition-colors">
                              <td className="py-3 px-3 font-mono font-bold text-slate-700">
                                #{inst.installmentNumber}
                              </td>
                              <td className="py-3 px-3 font-mono">
                                {new Date(inst.dueDate).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                ₹{inst.principalAmount?.toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-3 font-mono text-emerald-700 font-bold">
                                ₹{inst.principalPaid?.toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ inst.status === 'Paid' ? 'bg-white text-emerald-700 border border-emerald-200' : inst.status === 'Partially Paid' ? 'bg-white text-blue-700 border border-blue-200' : 'bg-white text-amber-700 border border-amber-200' }`}>
                                  {inst.status === 'Overdue' ? 'Pending' : inst.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {inst.status !== 'Paid' && (
                                    <>
                                      <button
                                        onClick={() => handleSendReminder(inst._id)}
                                        disabled={sendingReminderId === inst._id}
                                        className="p-1.5 text-blue-800 hover:text-purple-800 hover:bg-white rounded-lg transition"
                                        title="Send Mock Email Reminder"
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (onRecordPaymentClick) onRecordPaymentClick(inst, plan);
                                        }}
                                        className="bg-white px-2.5 py-1 text-blue-800 rounded-lg font-bold text-[10px] transition border border-[#9333EA]"
                                      >
                                        Pay
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: TRANSACTIONS */}
              {activeTab === 'transactions' && (
                <div className="space-y-3">
                  {transactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic text-xs bg-white rounded-2xl">
                      No payment transactions recorded yet.
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-blue-200 overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white border-b border-blue-200 font-mono text-[10px] uppercase font-bold text-purple-900">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Ref ID</th>
                            <th className="py-2.5 px-3">Method</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3">Verification</th>
                            <th className="py-2.5 px-3 text-right">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-50">
                          {transactions.map(txn => (
                            <tr key={txn._id} className="hover:bg-white transition-colors">
                              <td className="py-3 px-3 font-mono text-slate-600">
                                {new Date(txn.paymentDate).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                {txn.referenceId}
                              </td>
                              <td className="py-3 px-3">{txn.paymentMethod}</td>
                              <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                                ₹{txn.amount.toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ txn.status === 'Verified' ? 'bg-white text-emerald-700 border border-emerald-200' : 'bg-white text-amber-700 border border-amber-200' }`}>
                                  {txn.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                {txn.receiptNumber ? (
                                  <button
                                    onClick={() => {
                                      if (onViewReceiptClick) onViewReceiptClick(txn.receiptNumber);
                                    }}
                                    className="text-blue-800 hover:text-purple-900 font-bold underline font-mono text-[11px]"
                                  >
                                    #{txn.receiptNumber}
                                  </button>
                                ) : (
                                  <span className="text-slate-400 italic">Pending Verification</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: REMINDER LOGS */}
              {activeTab === 'reminders' && (
                <div className="space-y-3">
                  {reminderLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic text-xs bg-white rounded-2xl">
                      No reminder notifications dispatched yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {reminderLogs.map(log => (
                        <div key={log._id} className="p-3.5 rounded-2xl bg-white border border-blue-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 font-mono text-[11px]">
                              {log.reminderType}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(log.sentAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-600 font-medium">{log.subject}</p>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <span>To: <strong>{log.recipientName}</strong> ({log.recipientType})</span>
                            <span className="px-2 py-0.5 rounded bg-white text-emerald-800 font-mono text-[10px] font-bold">
                              {log.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 border-t border-blue-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Student Payment Schedule & Audit Trail • Stack Queue LMS
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-white text-slate-800 font-bold text-xs rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
