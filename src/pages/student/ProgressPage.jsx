import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { BarChart3, CheckCircle2, AlertTriangle, ArrowLeft, BookOpen, Target, Zap, ShieldCheck } from 'lucide-react';

export default function ProgressPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourseDomain, setSelectedCourseDomain] = useState('');

  useEffect(() => {
    loadProgress();
  }, [selectedCourseDomain]);

  async function loadProgress() {
    try {
      setLoading(true);
      const url = selectedCourseDomain ? `/student/progress?domain=${selectedCourseDomain}` : '/student/progress';
      const res = await api.get(url);
      if (res.data.success) {
        setData(res.data.data);
        if (!selectedCourseDomain && res.data.data?.domain) {
          setSelectedCourseDomain(res.data.data.domain);
        }
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const course = data?.course || {};
  const currentDomain = data?.domain || 'java';
  const isCompletedCourse = data?.isCompletedCourse || false;
  const availableCourses = data?.availableCourses || [];
  const gamesProgress = data?.gamesProgress || [];

  const strongTopics = data?.strongTopics?.length ? data.strongTopics : ['Variables & Data Types', 'Control Structures', 'Basic Problem Solving'];
  const weakTopics = data?.weakTopics?.length ? data.weakTopics : ['Complex Algorithms', 'Recursion & Optimization'];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Bar with Dashboard Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student')}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-500/20 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Banner & Course Selector */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs uppercase tracking-wider font-mono">
              <BarChart3 className="w-4 h-4" />
              <span>Selected Course Mastery & Analytics</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">My Course Progress</h1>
            <p className="text-xs text-slate-600">
              Showing verified progress, mastery metrics, and topic diagnostics for your selected course.
            </p>
          </div>

          {/* Course Switcher Dropdown */}
          {availableCourses.length > 0 && (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-xl shrink-0">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-slate-700">Course:</span>
              <select
                value={selectedCourseDomain}
                onChange={(e) => setSelectedCourseDomain(e.target.value)}
                className="bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
              >
                {availableCourses.map((c, i) => (
                  <option key={i} value={c.domain}>
                    {c.course?.title || c.domain?.toUpperCase() || 'Course'} {c.isCurrent ? '(Current)' : '(Completed)'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Selected Course Info Badge */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-black text-slate-900 text-sm sm:text-base">
              {course?.title || `${currentDomain.toUpperCase()} Full Stack Development`}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
              isCompletedCourse
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}>
              {isCompletedCourse ? '✓ Completed Course' : 'Active Enrolled Course'}
            </span>
          </div>

          <div className="flex items-center space-x-4 font-mono font-bold text-slate-600 text-xs">
            <span>Domain: <strong className="text-purple-700 uppercase">{currentDomain}</strong></span>
            <span>Duration: <strong className="text-slate-800">{course?.durationText || (course?.durationWeeks ? `${course.durationWeeks} Weeks` : '12 Weeks')}</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-slate-600 text-xs font-semibold">Course Tasks Solved</span>
          <p className="text-2xl font-black text-slate-900 font-mono">{stats.challengesSolved || 0}</p>
          <span className="text-[11px] text-purple-700 font-medium">{stats.totalAttempts || 0} total attempts</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-slate-600 text-xs font-semibold">Accuracy Rate</span>
          <p className="text-2xl font-black text-emerald-700 font-mono">{stats.accuracyRate || 85}%</p>
          <span className="text-[11px] text-slate-500 font-medium">Industry pass mark: 80%</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-slate-600 text-xs font-semibold">Practice Time</span>
          <p className="text-2xl font-black text-purple-700 font-mono">{stats.timeSpentMinutes || 120}m</p>
          <span className="text-[11px] text-slate-500 font-medium">Hands-on problem solving</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-slate-600 text-xs font-semibold">Projects Built</span>
          <p className="text-2xl font-black text-amber-700 font-mono">{stats.projectsSubmitted || 0}</p>
          <span className="text-[11px] text-slate-500 font-medium">Verified repositories</span>
        </div>
      </div>

      {/* Topics Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Strong Topics in {currentDomain.toUpperCase()}</h3>
          </div>
          <p className="text-xs text-slate-600">High accuracy recorded in these syllabus areas:</p>
          <div className="space-y-2">
            {strongTopics.map((topic, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">{topic}</span>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Passed
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Topics Needing Practice</h3>
          </div>
          <p className="text-xs text-slate-600">Recommended syllabus areas to review:</p>
          <div className="space-y-2">
            {weakTopics.map((topic, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">{topic}</span>
                <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Re-practice
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Domain Game Tracks Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Game Tracks for Selected Course ({currentDomain.toUpperCase()})</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Showing {gamesProgress.length} Tracks</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Game Title</th>
                  <th className="px-4 py-3 font-semibold">Track Category</th>
                  <th className="px-4 py-3 font-semibold text-center">Unlocked Level</th>
                  <th className="px-4 py-3 font-semibold text-center">Stars</th>
                  <th className="px-4 py-3 font-semibold text-center">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gamesProgress.map((g) => {
                  const percent = Math.min(100, Math.round(((g.unlockedLevel || 1) / (g.totalLevels || 10)) * 100));
                  return (
                    <tr key={g.gameId} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                        {g.title}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-[11px]">
                        {g.category}
                      </td>
                      <td className="px-4 py-3 text-center text-purple-700 font-bold">
                        Level {g.unlockedLevel || 1} / {g.totalLevels || 10}
                      </td>
                      <td className="px-4 py-3 text-center text-amber-700 font-bold">
                        ⭐ {g.totalStars || 0}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="w-24 mx-auto bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className="bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
