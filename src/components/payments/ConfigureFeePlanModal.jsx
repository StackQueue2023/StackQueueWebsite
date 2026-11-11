import React, { useState, useEffect } from 'react';
import { X, Settings, CheckCircle2 } from 'lucide-react';
import paymentApi from '../../api/paymentApi';

export default function ConfigureFeePlanModal({ isOpen, onClose, onSuccess, initialCategory = 'Courses' }) {
  const [studentName, setStudentName] = useState('');
  const [studentCode, setStudentCode] = useState(`STU-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [studentEmail, setStudentEmail] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [programName, setProgramName] = useState('');
  const [totalAgreedFee, setTotalAgreedFee] = useState(24000);
  const [monthlyInstallmentAmount, setMonthlyInstallmentAmount] = useState(2000);
  const [monthlyDueDay, setMonthlyDueDay] = useState(3);
  const [gracePeriodDays, setGracePeriodDays] = useState(5);
  const [dailyLateFeeRate, setDailyLateFeeRate] = useState(0); // Late fee removed
  const [assignedTutorName, setAssignedTutorName] = useState('BALAJI S');
  const [submitting, setSubmitting] = useState(false);

  // Lock body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key
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
    if (!studentName || !programName) {
      alert('Student Name and Program Name are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await paymentApi.configureFeePlan({
        studentName,
        studentCode,
        studentEmail: studentEmail || `${studentCode.toLowerCase()}@stackqueue.demo`,
        category,
        programName,
        totalAgreedFee: Number(totalAgreedFee),
        monthlyInstallmentAmount: Number(monthlyInstallmentAmount),
        monthlyDueDay: Number(monthlyDueDay),
        gracePeriodDays: Number(gracePeriodDays),
        dailyLateFeeRate: Number(dailyLateFeeRate),
        assignedTutorName
      });
      if (res.data.success) {
        alert(res.data.message || 'Fee plan configured successfully!');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to configure fee plan');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedInstallments = Math.ceil(Number(totalAgreedFee) / Number(monthlyInstallmentAmount || 2000));

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] shadow-2xl border border-purple-100 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Fixed & always visible at top */}
        <div className="bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] px-5 py-4 sm:px-6 sm:py-5 text-white flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">Configure Student Fee Plan</h3>
              <p className="text-xs text-purple-100">Setup billing agreement & installment schedule</p>
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
          
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-purple-50/30 border border-purple-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
                  Student ID / Code *
                </label>
                <input
                  type="text"
                  required
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full px-3 py-2 bg-purple-50/30 border border-purple-200 rounded-xl text-xs font-mono font-bold text-purple-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
                  Academic Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-purple-50/30 border border-purple-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Courses">Courses</option>
                  <option value="College Training">College Training</option>
                  <option value="Internships">Internships</option>
                  <option value="Projects">Projects</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
                  Program Name *
                </label>
                <input
                  type="text"
                  required
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="e.g. Full Stack MERN Architecture"
                  className="w-full px-3 py-2 bg-purple-50/30 border border-purple-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
                  Total Agreed Fee (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={totalAgreedFee}
                  onChange={(e) => setTotalAgreedFee(e.target.value)}
                  className="w-full px-3 py-2 bg-purple-50/30 border border-purple-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
                  Monthly Installment (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={monthlyInstallmentAmount}
                  onChange={(e) => setMonthlyInstallmentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-purple-50/30 border border-purple-200 rounded-xl text-xs font-mono font-bold text-purple-700 focus:outline-none"
                />
              </div>
            </div>

            {/* Configurable Policies */}
            <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2 text-xs">
              <div className="font-bold text-slate-900 font-mono text-[11px] uppercase tracking-wider">
                Installment Policy & Billing Schedule
              </div>
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2 bg-white rounded-xl border border-purple-100">
                  <span className="text-[10px] text-slate-400 block font-mono">Due Day</span>
                  <strong className="text-slate-900 font-bold">{monthlyDueDay}rd / month</strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-purple-100">
                  <span className="text-[10px] text-slate-400 block font-mono">Billing Frequency</span>
                  <strong className="text-purple-700 font-bold">Monthly (Fixed ₹{monthlyInstallmentAmount || 2000})</strong>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 text-center font-medium">
                Will automatically generate <strong className="text-purple-700">{calculatedInstallments} monthly installments</strong> of ₹{monthlyInstallmentAmount}/mo.
              </div>
            </div>
          </div>

          {/* Sticky Actions Footer */}
          <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50 border-t border-purple-100 flex items-center justify-end gap-3 shrink-0 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Generating Plan...' : 'Generate Plan & Installments'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
