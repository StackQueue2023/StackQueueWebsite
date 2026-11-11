import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { FileText, Send, Clock, CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function StudentLeavePage() {
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveType, setLeaveType] = useState('Full Day');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    loadMyLeaves();
  }, []);

  const loadMyLeaves = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/attendance/my-leaves');
      if (res.data.success) {
        setLeaveHistory(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load leave history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!reason || !reason.trim()) {
      alert('Please provide a reason for your leave request.');
      return;
    }

    setSubmitting(true);
    setSuccessMsg(null);
    try {
      const res = await api.post('/attendance/student-leave', {
        leaveDate,
        leaveType,
        reason: reason.trim()
      });

      if (res.data.success) {
        setSuccessMsg('✓ Leave request submitted successfully! Pending tutor review.');
        setReason('');
        loadMyLeaves();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto px-4">
      {/* Pink-to-Violet Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-50 via-fuchsia-50 to-purple-50 border border-pink-200/80 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase shadow-2xs">
            <FileText className="w-4 h-4 text-pink-600" />
            <span className="bg-gradient-to-r from-pink-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent font-extrabold">
              Student Leave System
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
            Submit Leave Request
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
            Submit a leave request when you are unable to attend scheduled sessions. Your tutor will review and provide approval status with remarks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leave Form */}
        <div className="md:col-span-1 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5 h-fit">
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Send className="w-4 h-4 text-pink-600" />
            <span>New Leave Form</span>
          </h2>

          <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">Leave Date *</label>
              <input
                type="date"
                required
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 font-mono shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">Leave Type *</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 bg-white"
              >
                <option value="Full Day">Full Day</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">Reason *</label>
              <textarea
                rows={4}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State your reason for leave (e.g. Medical emergency, college event...)"
                className="w-full p-3 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-pink-500 font-medium"
              />
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold text-xs rounded-2xl shadow-md transition cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Leave Request'}</span>
            </button>
          </form>
        </div>

        {/* Leave History Table */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-pink-600" />
              <span>My Leave History ({leaveHistory.length})</span>
            </h2>
          </div>

          {loadingHistory ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : leaveHistory.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2 shadow-sm">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Leave History</h3>
              <p className="text-xs text-slate-500">Your submitted leave requests will be listed here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaveHistory.map(item => (
                <div key={item._id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-slate-900 text-sm">{item.leaveDate}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {item.leaveType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{item.reason}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase ${
                      item.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      item.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {item.approvalReason && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-purple-700 uppercase block">
                        Tutor Response {item.approvedBy?.name ? `(${item.approvedBy.name})` : ''}:
                      </span>
                      <p className="text-slate-800 font-semibold">"{item.approvalReason}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
