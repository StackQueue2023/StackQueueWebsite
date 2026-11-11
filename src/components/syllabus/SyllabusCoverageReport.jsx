import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Filter,
  BarChart2,
  FileText,
  AlertCircle
} from 'lucide-react';
import api from '../../api/client';

export default function SyllabusCoverageReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCoverageReport = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get('/admin/syllabus/coverage-report');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load syllabus coverage report:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoverageReport();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchCoverageReport(false);
  };

  const handleSyncCoverage = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/admin/syllabus/sync-coverage', {});
      if (res.data?.success) {
        setNotification({
          type: 'success',
          text: res.data.message || 'Syllabus questions synchronized across all topics!'
        });
        if (res.data.data?.report) {
          setData(res.data.data.report);
        } else {
          fetchCoverageReport(true);
        }
      }
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to sync syllabus questions.'
      });
    } finally {
      setSyncing(false);
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const summary = data?.summary || {
    totalCourses: 0,
    totalModules: 0,
    totalTopics: 0,
    arenaQuestions: 0,
    moduleQuestions: 0,
    mockQuestions: 0,
    totalQuestions: 0,
    coveragePercentage: 100
  };

  const rows = data?.rows || [];

  // Distinct courses and domains for filter dropdowns
  const availableCourses = useMemo(() => {
    return Array.from(new Set(rows.map(r => r.courseName))).filter(Boolean);
  }, [rows]);

  const availableDomains = useMemo(() => {
    return Array.from(new Set(rows.map(r => r.domain))).filter(Boolean);
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      if (selectedCourse !== 'ALL' && r.courseName !== selectedCourse) return false;
      if (selectedDomain !== 'ALL' && r.domain !== selectedDomain) return false;
      if (selectedStatus !== 'ALL' && r.validationStatus !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTopic = (r.topic || '').toLowerCase().includes(q);
        const matchesModule = (r.moduleTitle || '').toLowerCase().includes(q);
        const matchesCourse = (r.courseName || '').toLowerCase().includes(q);
        return matchesTopic || matchesModule || matchesCourse;
      }
      return true;
    });
  }, [rows, selectedCourse, selectedDomain, selectedStatus, searchQuery]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Generating Syllabus Coverage Report from Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-purple-200 font-mono text-xs uppercase tracking-widest font-bold bg-white/10 px-3 py-1 rounded-full border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Single Source of Truth • Syllabus Driven</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <span>Syllabus Coverage & Question Bank Audit</span>
            </h2>
            <p className="text-xs md:text-sm text-purple-200/80 max-w-2xl leading-relaxed">
              Real-time audit tracking question generation strictly topic-by-topic across Interview Arena, Module Questions, and Mock Interview banks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSyncCoverage}
              disabled={syncing}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-500/20"
              title="Automatically scan syllabus topics and generate any missing questions"
            >
              <Sparkles className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Synchronizing Questions...' : 'Sync Missing Syllabus Qs'}</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-white/15 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-2xl text-xs font-bold border shadow-xs flex items-center space-x-2 ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white border border-purple-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Syllabus Topics</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {summary.totalTopics}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Across {summary.totalModules} modules</p>
        </div>

        <div className="bg-white border border-purple-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">Interview Arena</span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono mt-1">
            {summary.arenaQuestions}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Coding & interview problems</p>
        </div>

        <div className="bg-white border border-purple-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700">Module Questions</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-700 font-mono mt-1">
            {summary.moduleQuestions}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Curriculum assessments</p>
        </div>

        <div className="bg-white border border-purple-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-700">Mock Interview</span>
            <span className="w-2 h-2 rounded-full bg-pink-500" />
          </div>
          <div className="text-2xl font-black text-pink-700 font-mono mt-1">
            {summary.mockQuestions}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Architectural scenarios</p>
        </div>

        <div className="bg-white border border-emerald-200 bg-emerald-50/30 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Coverage Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {summary.coveragePercentage}%
          </div>
          <p className="text-[10px] text-emerald-600 mt-0.5">{summary.totalQuestions} total syllabus Qs</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic name, module title, or course..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Course Filter */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Courses ({availableCourses.length})</option>
              {availableCourses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Domain Filter */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Domains ({availableDomains.length})</option>
              {availableDomains.map(d => (
                <option key={d} value={d}>{d.toUpperCase()}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coverage Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-black text-slate-900">Topic-by-Topic Syllabus Coverage</h3>
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              {filteredRows.length} Topics
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Strictly mapped to actual uploaded syllabus</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-mono uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-bold">Course / Domain</th>
                <th className="py-3.5 px-4 font-bold">Module</th>
                <th className="py-3.5 px-4 font-bold">Syllabus Topic</th>
                <th className="py-3.5 px-3 font-bold text-center">Interview Arena</th>
                <th className="py-3.5 px-3 font-bold text-center">Module Qs</th>
                <th className="py-3.5 px-3 font-bold text-center">Mock Interview</th>
                <th className="py-3.5 px-3 font-bold text-center">Total Qs</th>
                <th className="py-3.5 px-4 font-bold">Difficulty Spread</th>
                <th className="py-3.5 px-4 font-bold text-right">Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <p className="font-bold text-xs text-slate-600">No syllabus topics matching filters.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try clearing filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const diffs = row.difficultyDistribution || { Easy: 0, Medium: 0, Hard: 0 };
                  return (
                    <tr key={`${row.moduleId}-${row.topic}-${idx}`} className="hover:bg-purple-50/30 transition">
                      {/* Course / Domain */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900">{row.courseName}</div>
                        <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 uppercase font-semibold">
                          {row.domain}
                        </span>
                      </td>

                      {/* Module */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 line-clamp-1" title={row.moduleTitle}>
                          Mod {row.moduleOrder}: {row.moduleTitle}
                        </div>
                      </td>

                      {/* Syllabus Topic */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-bold text-slate-900 line-clamp-1" title={row.topic}>
                          {row.topic}
                        </div>
                      </td>

                      {/* Arena Count */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          row.arenaCount > 0 ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {row.arenaCount} Qs
                        </span>
                      </td>

                      {/* Module Count */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          row.moduleCount > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {row.moduleCount} Qs
                        </span>
                      </td>

                      {/* Mock Count */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          row.mockCount > 0 ? 'bg-pink-100 text-pink-800' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {row.mockCount} Qs
                        </span>
                      </td>

                      {/* Total Count */}
                      <td className="py-3 px-3 text-center font-mono font-extrabold text-slate-900">
                        {row.totalCount}
                      </td>

                      {/* Difficulty Spread */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200" title="Easy questions">
                            E: {diffs.Easy || 0}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200" title="Medium questions">
                            M: {diffs.Medium || 0}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200" title="Hard questions">
                            H: {diffs.Hard || 0}
                          </span>
                        </div>
                      </td>

                      {/* Validation Status */}
                      <td className="py-3 px-4 text-right">
                        {row.validationStatus === 'verified' ? (
                          <span className="inline-flex items-center space-x-1 font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
