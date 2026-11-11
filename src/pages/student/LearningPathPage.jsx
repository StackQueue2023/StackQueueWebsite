import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Map, CheckCircle2, ArrowRight, BookOpen, Clock, Gamepad2 } from 'lucide-react';

export default function LearningPathPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPath() {
      try {
        const res = await api.get('/student/learning-path');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load learning path:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPath();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const course = data?.course || {
    title: 'Full Stack Development Curriculum',
    description: 'Master Admin-assigned modules, practical coding tasks, and real industry projects.',
    durationWeeks: 12,
    totalHours: 120
  };

  const modules = data?.modules || [];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Course Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs uppercase tracking-wider font-mono">
          <Map className="w-4 h-4" />
          <span>Curriculum Learning Path Roadmap</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">{course.title}</h1>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">{course.description}</p>
        <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-slate-500">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Duration: {course.durationText || (course.durationWeeks ? `${course.durationWeeks} Weeks` : '12 Weeks')} ({course.totalHours || 120} Total Hours)</span>
          </span>
          <span className="flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>{modules.length} Modular Phases • Admin Verified Syllabus</span>
          </span>
        </div>
      </div>

      {/* Sequential Milestone Modules */}
      <div className="space-y-4">
        {modules.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 font-medium text-xs">
            No modules assigned yet for this course. Please contact your administrator.
          </div>
        )}
        {modules.map((mod, idx) => (
          <div
            key={mod._id || mod.id || idx}
            className={`p-5 rounded-2xl border transition-all shadow-sm ${
              mod.isCompleted
                ? 'bg-white border-emerald-200'
                : mod.isCurrent
                ? 'bg-white border-purple-300 ring-2 ring-purple-500/20'
                : 'bg-slate-50 border-slate-200 opacity-85'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  mod.isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : mod.isCurrent
                    ? 'bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] text-white shadow-sm'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {mod.isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : idx + 1}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900">{mod.title}</h3>
                    {mod.isCurrent ? (
                      <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 animate-pulse">
                        In Progress
                      </span>
                    ) : mod.isCompleted ? (
                      <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{mod.description}</p>

                  {/* Topics Pills */}
                  {mod.topics?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mod.topics.map((t, i) => (
                        <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button to View Tasks in Syllabus */}
              <div className="shrink-0 flex items-center md:flex-col md:items-end justify-between pt-2 md:pt-0">
                <Link
                  to="/student/course"
                  className="px-4 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-md shadow-purple-500/20"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Tasks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
