import React, { useState, useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function TutorGuidanceNotes() {
  const { user } = useAuth();
  const [guidanceList, setGuidanceList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGuidance = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/guidance');
      if (res.data.success) {
        setGuidanceList(res.data.data);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Error fetching guidance:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGuidance();
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.patch(`/guidance/${id}/read`);
      if (res.data.success) {
        setGuidanceList(prev => prev.map(g => g._id === id ? { ...g, readStatus: true } : g));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  if (loading) return null;
  if (guidanceList.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Tutor Guidance & Mentor Notes</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
          Direct Guidance
        </span>
      </div>

      <div className="space-y-2.5">
        {guidanceList.map((g) => {
          const isHigh = g.priority === 'HIGH';
          const isMedium = g.priority === 'MEDIUM';

          return (
            <div 
              key={g._id}
              className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 text-xs ${
                g.readStatus
                  ? 'bg-slate-50/70 border-slate-200 opacity-75'
                  : isHigh
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    isHigh 
                      ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                      : isMedium
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}>
                    {g.priority} Priority
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    from <strong className="text-slate-800">{g.tutorId?.name || 'Tutor'}</strong>
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    • {new Date(g.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-slate-800 text-xs leading-relaxed">
                  {g.message}
                </p>
              </div>

              {!g.readStatus && (
                <button
                  onClick={() => handleMarkAsRead(g._id)}
                  title="Mark as Acknowledged"
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-[11px] font-medium border border-slate-200 shadow-xs flex items-center space-x-1 shrink-0 transition"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Acknowledge</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
