import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { CalendarCheck2 } from 'lucide-react';

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, percentage: 100 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const res = await api.get('/attendance');
        if (res.data.success) {
          setRecords(res.data.data.records || []);
          setSummary(res.data.data.summary || { total: 0, present: 0, absent: 0, late: 0, percentage: 100 });
        }
      } catch (err) {
        console.error('Failed to load attendance:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Present</span>;
      case 'Absent':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Absent</span>;
      case 'Late':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Late</span>;
      case 'Leave':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Leave</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs uppercase tracking-wider font-mono">
            <CalendarCheck2 className="w-4 h-4" />
            <span>Institute Session Records</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Attendance & Participation</h1>
          <p className="text-xs text-slate-600">
            Maintain high attendance to stay eligible for institute placement drives and certification.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl text-center shrink-0">
          <p className="text-[10px] uppercase font-bold text-slate-500">Attendance Rate</p>
          <p className="text-2xl font-black text-emerald-700 font-mono">
            {summary.percentage}%
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-slate-600 text-xs font-semibold">Total Sessions</span>
          <p className="text-2xl font-black text-slate-900 font-mono">{summary.total || 1}</p>
          <span className="text-[11px] text-slate-500 font-medium">Logged classes</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-slate-600 text-xs font-semibold">Sessions Present</span>
          <p className="text-2xl font-black text-emerald-700 font-mono">{summary.present || 1}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Full attendance</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-slate-600 text-xs font-semibold">Late Arrivals</span>
          <p className="text-2xl font-black text-amber-700 font-mono">{summary.late || 0}</p>
          <span className="text-[11px] text-amber-700 font-medium">Grace margin</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-slate-600 text-xs font-semibold">Unexcused Absences</span>
          <p className="text-2xl font-black text-rose-700 font-mono">{summary.absent || 0}</p>
          <span className="text-[11px] text-rose-700 font-medium">Zero tolerance &lt; 85%</span>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wider">Attendance Log History</span>
          <span className="text-slate-500 font-mono text-[11px]">{records.length} Entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Batch</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold">Remarks</th>
                <th className="px-4 py-3 font-semibold text-right">Instructor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">
                    No attendance records found yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-900 font-bold">
                      {r.date}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[11px]">
                      {r.batchId?.name || 'Batch 2026-Alpha'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(r.status)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs font-sans">
                      {r.remarks || 'Regular laboratory attendance recorded.'}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 font-sans">
                      {r.markedBy?.name || 'Prof. Marcus Miller'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
