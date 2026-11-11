import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle2,
  ArrowLeft,
  Layers,
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import interviewApi from '../../api/interviewApi';

const CATEGORY_LIST = [
  'Programming Basics',
  'Number Logic',
  'Strings',
  'Arrays',
  'Searching and Sorting',
  'Hashing',
  'Two Pointer',
  'Stack',
  'Linked List',
  'Binary Tree'
];

export default function InterviewProgressPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const res = await interviewApi.getInterviewProgress();
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading interview progress analytics...</p>
      </div>
    );
  }

  const progress = data?.progress || {
    unlockedLevel: 1,
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    totalInterviewXp: 0,
    solvedQuestions: [],
    categoryProgress: {}
  };

  const catMap = progress.categoryProgress || {};
  const accuracy = data?.accuracy || 0;
  const totalAttempts = progress.totalAttempts || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/interview-game')}
          className="flex items-center space-x-2 text-xs text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Arena</span>
        </button>
      </div>

      {/* Hero Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-purple-700 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Interview Mastery Analytics</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">Your Coding Progress</h1>
            <p className="text-xs text-slate-500 max-w-lg">
              Detailed tracking of your topic proficiencies, difficulty distribution, and submission accuracy.
            </p>
          </div>

          <div className="flex items-center space-x-4 shrink-0">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center min-w-[110px]">
              <div className="text-2xl font-black text-amber-600 font-mono">
                {progress.totalInterviewXp}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Total XP Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Solved Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Problems Solved
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-slate-900 font-mono">
              {progress.totalSolved || 0}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100 total</span>
          </div>

          {/* Difficulty progress bar */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-700">Easy: {progress.easySolved || 0}</span>
              <span className="text-amber-700">Medium: {progress.mediumSolved || 0}</span>
              <span className="text-rose-700">Hard: {progress.hardSolved || 0}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 flex overflow-hidden">
              <div
                style={{ width: `${(progress.easySolved / 100) * 100}%` }}
                className="bg-emerald-500"
              ></div>
              <div
                style={{ width: `${(progress.mediumSolved / 100) * 100}%` }}
                className="bg-amber-500"
              ></div>
              <div
                style={{ width: `${(progress.hardSolved / 100) * 100}%` }}
                className="bg-rose-500"
              ></div>
            </div>
          </div>
        </div>

        {/* Level Progression */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Progression Level
            </span>
            <Layers className="w-5 h-5 text-purple-600" />
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-purple-700 font-mono">
              Level {progress.unlockedLevel || 1}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 10 Levels</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-2">
            Solve at least 6 questions in your current level to unlock the next advanced topic level.
          </p>
        </div>

        {/* Submission Accuracy */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Accuracy Rate
            </span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-slate-900 font-mono">
              {accuracy}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({totalAttempts} attempts)
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-2">
            Ratio of accepted solutions across all interactive test runs and official submissions.
          </p>
        </div>
      </div>

      {/* Category Mastery Progress Grid */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-purple-600" />
          <span>Category Mastery</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORY_LIST.map((cat, idx) => {
            const solved = catMap[cat] || 0;
            const target = 10;
            const pct = Math.min(100, Math.round((solved / target) * 100));

            return (
              <div
                key={cat}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    Lvl {idx + 1}: {cat}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {solved}/{target}
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct === 100
                        ? 'bg-emerald-500'
                        : pct >= 50
                        ? 'bg-gradient-to-r from-[#8B2BE2] to-[#E02B91]'
                        : 'bg-amber-500'
                    }`}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{pct}% Mastered</span>
                  {pct === 100 && (
                    <span className="text-emerald-600 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Complete</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Solved Questions History Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Solved Questions History ({progress.solvedQuestions?.length || 0})</span>
        </h3>

        {progress.solvedQuestions?.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No questions solved yet. Start practicing in the arena!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {progress.solvedQuestions.map((sq, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-purple-700">
                      Q{sq.questionNumber}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-800">{sq.category}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                          sq.difficulty === 'Easy'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : sq.difficulty === 'Medium'
                            ? 'text-amber-700 bg-amber-50 border border-amber-200'
                            : 'text-rose-700 bg-rose-50 border border-rose-200'
                        }`}
                      >
                        {sq.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase text-slate-500">{sq.language}</td>
                    <td className="py-3 px-4 text-slate-500">{sq.attempts}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/interview-game/question/${sq.questionId}`)}
                        className="text-xs text-purple-600 hover:text-purple-800 font-sans font-semibold flex items-center justify-end space-x-1 ml-auto cursor-pointer"
                      >
                        <span>Re-Solve</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
