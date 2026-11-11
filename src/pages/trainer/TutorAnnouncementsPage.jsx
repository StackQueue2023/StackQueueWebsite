import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Megaphone, Clock, Sparkles } from 'lucide-react';

export default function TutorAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTutorAnnouncements() {
      try {
        const res = await api.get('/announcements/tutor');
        if (res.data.success) {
          setAnnouncements(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load tutor announcements:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTutorAnnouncements();
  }, []);

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto px-4">
      {/* Pink-to-Violet Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-50 via-fuchsia-50 to-purple-50 border border-pink-200/80 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase shadow-2xs">
            <Megaphone className="w-4 h-4 text-pink-600" />
            <span className="bg-gradient-to-r from-pink-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent font-extrabold">
              Tutor Notice Board
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
            Institute Announcements
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
            Important announcements, schedule changes, holiday updates, and training circulars broadcasted by Admin.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-2 shadow-sm">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Announcements Right Now</h3>
          <p className="text-xs text-slate-500">Official broadcast notices from Admin will be listed here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(item => (
            <div key={item._id} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold font-mono uppercase bg-pink-100 text-pink-800 border border-pink-200">
                    {item.type}
                  </span>
                  <span className="text-slate-400 font-mono text-xs font-bold">{item.announcementDate}</span>
                </div>
              </div>

              <h2 className="text-lg font-black text-slate-900">{item.title}</h2>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                {item.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
