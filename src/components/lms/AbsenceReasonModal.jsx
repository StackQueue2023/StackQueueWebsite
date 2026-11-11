import React, { useState } from 'react';
import api from '../../api/client';
import { X, AlertTriangle, Send } from 'lucide-react';

export default function AbsenceReasonModal({ session, onClose, onReasonSubmitted }) {
  const [reason, setReason] = useState('Medical Leave');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const reasonOptions = [
    'Medical Leave',
    'Personal Reason',
    'College Work',
    'Travel',
    'Emergency',
    'Technical Issue',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reason === 'Other' && !description.trim()) {
      setError('Reason Description is strictly required when "Other" is selected.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post(`/lms/attendance/${session.sessionId}/absence-reason`, {
        reason,
        description
      });

      if (res.data.success) {
        if (onReasonSubmitted) {
          onReasonSubmitted();
        }
        onClose();
      }
    } catch (err) {
      console.error('Submit absence reason error:', err);
      setError(err.response?.data?.message || 'Failed to submit absence reason.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-red-50/80 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-red-100 text-red-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                CLASS ATTENDANCE
              </span>
              <h3 className="text-sm font-black text-slate-900">
                Provide Absence Reason
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-red-200/60 rounded-lg text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-700 block">{session?.title || 'Class Session'}</span>
            <span className="text-slate-500 block text-[11px]">{session?.date} ({session?.startTime} - {session?.endTime})</span>
            <p className="text-red-600 font-semibold mt-1">
              You were marked absent from this class. Please provide your reason:
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Select Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {reasonOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Reason Description {reason === 'Other' && <span className="text-red-500">* (Required)</span>}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required={reason === 'Other'}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder={reason === 'Other' ? 'Please describe your reason in detail...' : 'Optional details or note...'}
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'SUBMIT REASON'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
