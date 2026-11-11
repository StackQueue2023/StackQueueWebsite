import React, { useState, useEffect } from 'react';
import { Video, Clock, User, Calendar, ExternalLink, CheckCircle2, Radio } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function LiveClassCard() {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [canJoin, setCanJoin] = useState(false);

  const fetchSession = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/sessions/student/today');
      if (res.data.success && res.data.data) {
        const s = res.data.data.session || res.data.data;
        setSession(s);
        if (res.data.data.canJoin !== undefined) {
          setCanJoin(res.data.data.canJoin);
        }
      } else {
        setSession(null);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Error fetching today\'s class:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSession();
      const interval = setInterval(fetchSession, 30000); // Poll status every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  // Calculate countdown and join eligibility
  useEffect(() => {
    if (!session) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const scheduledStart = new Date(session.scheduledStartDateTime).getTime();
      const scheduledEnd = new Date(session.scheduledEndDateTime).getTime();
      const diff = scheduledStart - now;

      // Eligible to join if LIVE, or within 10 mins before start until end of session
      const isImminent = diff <= 10 * 60 * 1000;
      const hasEnded = now > scheduledEnd;
      const isSessionLive = session.status === 'LIVE' || (isImminent && !hasEnded && session.status !== 'COMPLETED');

      setCanJoin(isSessionLive && session.status !== 'COMPLETED');

      if (hasEnded || session.status === 'COMPLETED') {
        setTimeLeft('Session concluded');
      } else if (session.status === 'LIVE') {
        setTimeLeft('Session is LIVE now!');
      } else if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`Starts in ${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('Starting any moment...');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl flex items-center justify-center min-h-[160px]">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No Live Classes Scheduled Today</h3>
            <p className="text-xs text-slate-500">Review your homework tasks or solve practice challenges in the Game Hub.</p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
          All Caught Up
        </span>
      </div>
    );
  }

  const isLive = session.status === 'LIVE';
  const isCompleted = session.status === 'COMPLETED';

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 transition-all shadow-sm ${
      isLive 
        ? 'bg-rose-50/80 border-rose-300 shadow-rose-100' 
        : 'bg-white border-slate-200'
    }`}>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {isLive ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                <Radio className="w-3.5 h-3.5 text-rose-600" />
                <span>Class is In-Progress</span>
              </span>
            ) : isCompleted ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Session Completed</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Upcoming Class</span>
              </span>
            )}

            <span className="text-xs font-mono text-slate-500">
              {session.startTime} - {session.endTime}
            </span>
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900 transition">
              {session.title || session.topic}
            </h2>
            <p className="text-xs text-slate-600 max-w-xl line-clamp-1 mt-0.5">
              {session.description || `Live masterclass covering ${session.topic} with real-time Q&A.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <div className="flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-purple-600" />
              <span>Tutor: <strong className="text-slate-800">{session.tutorId?.name || 'Prof. Marcus Miller'}</strong></span>
            </div>
            {session.courseId?.title && (
              <span className="text-slate-400">• {session.courseId.title}</span>
            )}
            <div className="flex items-center space-x-1 text-amber-700 font-mono text-[11px]">
              <Clock className="w-3 h-3" />
              <span>{timeLeft}</span>
            </div>
          </div>
        </div>

        {/* Right: Join Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {canJoin ? (
            <a
              href={session.meetingLink || 'https://meet.google.com/cq-live-class'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center space-x-2 transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Video className="w-4 h-4" />
              <span>JOIN LIVE CLASS</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          ) : (
            <button
              disabled
              title="Class link activates 10 minutes before scheduled start"
              className="px-6 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs border border-slate-200 cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Video className="w-4 h-4 opacity-40" />
              <span>{isCompleted ? 'CLASS CONCLUDED' : 'JOIN CLASS (LOCKED)'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
