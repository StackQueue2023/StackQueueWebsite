import React, { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle2 } from 'lucide-react';
import paymentApi from '../../api/paymentApi';

export default function RecordPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  installment,
  student,
  category = 'Courses',
  isAdmin = true
}) {
  // Resolved student info
  const resolvedStudentName = student?.studentName || student?.name || installment?.studentName || 'Student';
  const resolvedStudentId = student?.studentId || student?.studentCode || installment?.studentCode || 'STU1001';
  const resolvedCourse = student?.courseTitle || student?.programName || installment?.programName || 'Academic Course';
  const resolvedDomain = student?.domain || 'Technical Domain';
  const resolvedMonthlyFee = student?.monthlyFee || installment?.principalAmount || 2000;
  const initialAmount = student?.pendingAmount !== undefined ? student.pendingAmount : (installment?.principalAmount || 2000);

  const [amount, setAmount] = useState(initialAmount || 2000);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [referenceId, setReferenceId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(initialAmount > 0 ? initialAmount : 2000);
      setReferenceId(`TXN/${paymentMethod.toUpperCase().slice(0, 3)}/${Date.now().toString().slice(-6)}`);
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentStatus('Paid');
      setNotes('');
    }
  }, [isOpen, installment, student]);

  // Lock background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await paymentApi.recordPayment({
        installmentId: installment?._id || installment?.id || null,
        studentId: student?.userId || student?.id || student?._id || installment?.studentId || null,
        amount: Number(amount),
        paymentMethod,
        referenceId: referenceId.trim() || `REF-${Date.now().toString().slice(-6)}`,
        paymentDate,
        paymentStatus,
        notes,
        autoVerify: true
      });

      if (res.data?.success) {
        if (onSuccess) onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] shadow-2xl border border-purple-100 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Fixed & always visible at top */}
        <div className="bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] px-5 py-4 sm:px-6 sm:py-5 text-white flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">Record Student Fee Payment</h3>
              <p className="text-xs text-purple-100 font-medium">{category} • Admin Fee Collection</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container with Internal Scrollable Body and Sticky Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          
          {/* Scrollable Form Body */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
            
            {/* Student & Course Summary Panel */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/80 via-fuchsia-50/40 to-pink-50/40 border border-purple-100 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 font-mono">Student</span>
                  <p className="font-extrabold text-slate-900 text-sm">{resolvedStudentName}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Student ID</span>
                  <p className="font-mono font-bold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                    {resolvedStudentId}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold">Course / Domain:</span>
                  <p className="font-semibold text-slate-800">{resolvedCourse} ({resolvedDomain})</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold">Standard Monthly Fee:</span>
                  <p className="font-mono font-black text-slate-900">₹{Number(resolvedMonthlyFee).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Payment Amount & Payment Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>Payment Amount (₹) *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 font-mono">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-black font-mono text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="2000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
                  Payment Status *
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="Paid">Paid (Fully Collected)</option>
                  <option value="Pending">Pending (Unpaid)</option>
                </select>
              </div>
            </div>

            {/* Payment Mode & Transaction ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
                  Payment Mode *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    const method = e.target.value;
                    setPaymentMethod(method);
                    setReferenceId(`TXN/${method.toUpperCase().slice(0, 3)}/${Date.now().toString().slice(-6)}`);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT / IMPS / RTGS)</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>Transaction ID</span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="e.g. UPI/2026/89234"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Remarks / Audit Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Remarks / Audit Notes</span>
                <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Collected at front desk / Verified in bank"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Notice info */}
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                Recording this payment marks this cycle as Paid, stops reminders for this cycle, and automatically schedules the next billing cycle.
              </span>
            </div>

          </div>

          {/* Sticky Action Footer - Always visible at bottom */}
          <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50 border-t border-purple-100 flex items-center justify-end space-x-3 shrink-0 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Recording Payment...' : 'RECORD FEE PAYMENT'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
