import React from 'react';
import { Video, MapPin, Calendar, Clock, ExternalLink, CalendarX, CheckCircle2 } from 'lucide-react';

export default function TodaysClassCard({ session, onRequestLeave }) {
  if (!session) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
            Today's Schedule
          </span>
          <h3 className="text-base font-bold text-slate-800 mt-2">No Classes Scheduled Today</h3>
          <p className="text-xs text-slate-500">Take this time to review unlocked concept tasks and practice!</p>
        </div>
      </div>
    );
  }

  const isOnline = session.sessionType === 'ONLINE';
  const isLive = session.status === 'LIVE' || session.isLive;
  const isCompleted = session.status === 'COMPLETED';

  return (
    <div className="bg-white rounded-2xl border-2 border-purple-600/20 shadow-sm hover:shadow-md transition overflow-hidden">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] px-6 py-3 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 relative">
            {isLive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? 'bg-red-500' : 'bg-emerald-400'}`}></span>
          </span>
          <h2 className="text-xs font-black uppercase tracking-wider">
            {isLive ? 'LIVE CLASS 🔴' : 'TODAY\'S CLASS'}
          </h2>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            {session.sessionType}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div>
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                {session.title || 'Java – Collections'}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {session.topic || 'HashMap'}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>{session.date}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{session.startTime} – {session.endTime}</span>
              </div>
              {isOnline ? (
                <div className="flex items-center space-x-1.5 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg font-semibold">
                  <Video className="w-3.5 h-3.5" />
                  <span>Online Lecture</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{session.classroom || 'Institute Classroom'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Area */}
          <div className="flex items-center space-x-3 shrink-0">
            {isOnline ? (
              isCompleted ? (
                <div className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Class Completed ✓</span>
                </div>
              ) : (
                <a
                  href={session.meetingLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 flex items-center space-x-2 transition ${
                    isLive
                      ? 'bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white animate-pulse'
                      : 'bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{isLive ? 'JOIN CLASS NOW' : 'JOIN CLASS'}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              )
            ) : (
              <div className="flex items-center space-x-2 px-4 py-2.5 bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span>Offline Campus Class</span>
              </div>
            )}

            {!isCompleted && onRequestLeave && (
              <button
                onClick={() => onRequestLeave(session)}
                className="px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl border border-slate-300 flex items-center space-x-1 transition"
                title="Request Leave for this class"
              >
                <CalendarX className="w-3.5 h-3.5 text-amber-500" />
                <span>Request Leave</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
