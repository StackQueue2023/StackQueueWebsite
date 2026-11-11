import React, { useState, useEffect } from 'react';
import { Video, Play, Square, CheckCircle2, Send, Calendar } from 'lucide-react';
import api from '../../api/client';
import SessionTaskCheckModal from './SessionTaskCheckModal';

export default function TutorSessionsToday() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEndSession, setActiveEndSession] = useState(null);
  const [digestStatus, setDigestStatus] = useState('');

  const fetchTodaySessions = async () => {
    try {
      const res = await api.get('/sessions/today');
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching today\'s sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySessions();
    const timer = setInterval(fetchTodaySessions, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleStartSession = async (sessionId) => {
    try {
      const res = await api.post(`/sessions/${sessionId}/start`);
      if (res.data.success) {
        fetchTodaySessions();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start session');
    }
  };

  const handleSendMorningDigest = async () => {
    setDigestStatus('Sending...');
    try {
      const res = await api.post('/sessions/tutor/morning-digest');
      if (res.data.success) {
        setDigestStatus('Morning SMS Digest Sent!');
        setTimeout(() => setDigestStatus(''), 4000);
      }
    } catch (err) {
      setDigestStatus('Error sending digest');
      setTimeout(() => setDigestStatus(''), 4000);
    }
  };

  const getStatusChip = (s) => {
    const status = s.dynamicStatus || s.status;
    switch (status) {
      case 'LIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200 animate-pulse">
            LIVE NOW
          </span>
        );
      case 'DELAYED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            DELAYED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            COMPLETED
          </span>
        );
      case 'MISSED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            MISSED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
            UPCOMING
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 shadow-sm p-5 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          <span>Today's Teaching Sessions ({sessions.length})</span>
        </div>

        <button
          onClick={handleSendMorningDigest}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
        >
          <Send className="w-3.5 h-3.5 text-purple-600" />
          <span>{digestStatus || 'Send Morning SMS Digest'}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600">No live classes scheduled for today.</p>
          <p className="text-xs text-slate-400 mt-1">Check back later or contact administration for schedule updates.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const isLive = s.status === 'LIVE';
            const isCompleted = s.status === 'COMPLETED';
            const isOnline = s.sessionType !== 'OFFLINE';
            const isBatch = s.isBatch || !!s.batchId || (s.studentIds && s.studentIds.length > 1);

            // Calculate student display label
            let targetStudentName = '';
            if (s.studentIds && s.studentIds.length > 0) {
              const firstSt = s.studentIds[0];
              targetStudentName = typeof firstSt === 'object' ? (firstSt.name || firstSt.email || 'Student') : 'Student';
            }

            return (
              <div
                key={s._id}
                className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isLive
                    ? 'bg-red-50/70 border-red-200 shadow-sm'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                {/* Session Info */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusChip(s)}
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {s.startTime} - {s.endTime}
                    </span>

                    {/* Online vs Offline Badge */}
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      isOnline
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {isOnline ? '🌐 ONLINE' : '📍 OFFLINE'}
                    </span>

                    {/* Single Student vs Batch Badge */}
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      isBatch
                        ? 'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {isBatch
                        ? (s.batchId?.name ? `🎓 Batch: ${s.batchId.name}` : `🎓 Batch (${s.studentIds?.length || 0} Students)`)
                        : (targetStudentName ? `👤 Single Student: ${targetStudentName}` : '👤 Single Student')
                      }
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{s.title || s.topic}</h3>
                  {s.courseId?.title && (
                    <p className="text-xs text-purple-600 font-semibold">Course: {s.courseId.title}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    <span>Assigned: <strong className="text-slate-700">{s.studentIds?.length || 0} Student(s)</strong></span>
                    {!isOnline && (
                      <span>Location: <strong className="text-emerald-700">{s.classroom || 'Institute Classroom'}</strong></span>
                    )}
                    {s.taskAssigned && (
                      <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Task Assigned</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Session Action Controls */}
                <div className="flex items-center space-x-2 shrink-0">
                  {/* Join Button for Online classes */}
                  {isOnline && s.meetingLink && (
                    <a
                      href={s.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition shadow-sm"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Live Class</span>
                    </a>
                  )}

                  {/* Start / End Session Controls */}
                  {!isLive && !isCompleted && (
                    <button
                      onClick={() => handleStartSession(s._id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>START SESSION</span>
                    </button>
                  )}

                  {isLive && (
                    <button
                      onClick={() => setActiveEndSession(s)}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>END SESSION</span>
                    </button>
                  )}

                  {isCompleted && (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold flex items-center space-x-1 border border-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Concluded ({s.actualDurationMinutes || 60}m)</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mandatory Task Check Modal */}
      {activeEndSession && (
        <SessionTaskCheckModal
          session={activeEndSession}
          onClose={() => setActiveEndSession(null)}
          onSessionEnded={fetchTodaySessions}
        />
      )}
    </div>
  );
}
