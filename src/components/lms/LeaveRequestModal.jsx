import React, { useState } from 'react';
import api from '../../api/client';
import { X, CalendarX, Send } from 'lucide-react';

export default function LeaveRequestModal({ session, onClose, onRequestSubmitted }) {
  const [reason, setReason] = useState('Personal Reason');
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
      setError('Description is required when "Other" is selected.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/lms/leave-requests', {
        sessionId: session.sessionId,
        reason,
        description
      });

      if (res.data.success) {
        if (onRequestSubmitted) {
          onRequestSubmitted();
        }
        onClose();
      }
    } catch (err) {
      console.error('Leave request error:', err);
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
              <CalendarX className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                CLASS LEAVE APPLICATION
              </span>
              <h3 className="text-sm font-black text-slate-900">
                Request Upcoming Leave
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-amber-200/60 rounded-lg text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-800 block">{session?.title}</span>
            <span className="text-slate-500 text-[11px] block">{session?.date} ({session?.startTime} - {session?.endTime})</span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Reason</label>
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
              Description {reason === 'Other' && <span className="text-red-500">* (Required)</span>}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required={reason === 'Other'}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Reason for taking leave ahead of class..."
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
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'SUBMIT LEAVE REQUEST'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
