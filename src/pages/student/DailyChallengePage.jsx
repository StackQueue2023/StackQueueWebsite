import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import interviewApi from '../../api/interviewApi';
import { Calendar, RefreshCw, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const DOMAIN_META = {
  java:       { label:'Java',       icon:'☕', color:'from-orange-500 to-red-500',    light:'bg-orange-50',  text:'text-orange-700',  border:'border-orange-200' },
  python:     { label:'Python',     icon:'🐍', color:'from-violet-500 to-indigo-500', light:'bg-violet-50',  text:'text-violet-700',  border:'border-violet-200' },
  cpp:        { label:'C++',        icon:'⚡', color:'from-purple-500 to-indigo-500', light:'bg-purple-50',  text:'text-purple-700',  border:'border-purple-200' },
  react:      { label:'React',      icon:'⚛️', color:'from-cyan-500 to-teal-500',     light:'bg-cyan-50',    text:'text-cyan-700',    border:'border-cyan-200'   },
  javascript: { label:'JavaScript', icon:'📜', color:'from-yellow-500 to-amber-500', light:'bg-amber-50',   text:'text-amber-700',   border:'border-amber-200'  }
};

export default function DailyChallengePage() {
  const navigate = useNavigate();
  const [dailyCodingQuestion, setDailyCodingQuestion] = useState(null);
  const [domain, setDomain] = useState('java');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [noNewAvailable, setNoNewAvailable] = useState(false);

  const fetchChallengeData = useCallback(async () => {
    setLoading(true);
    setNoNewAvailable(false);
    try {
      const [domainRes, dailyCodingRes] = await Promise.all([
        api.get('/domain/my').catch(() => ({ data: { success: false } })),
        interviewApi.getDailyChallenge().catch(() => ({ data: { success: false } }))
      ]);

      if (domainRes.data?.success && domainRes.data.data?.domain) {
        setDomain(domainRes.data.data.domain);
      }

      if (dailyCodingRes.data?.success) {
        if (dailyCodingRes.data.available === false) {
          setNoNewAvailable(true);
          setDailyCodingQuestion(null);
        } else if (dailyCodingRes.data.data) {
          setDailyCodingQuestion(dailyCodingRes.data.data);
        }
      }
    } catch (e) {
      console.error('Failed to load daily challenge data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallengeData();
  }, [fetchChallengeData]);

  const handleRefresh = async (e) => {
    if (e) e.stopPropagation();
    setRefreshing(true);
    setNoNewAvailable(false);
    try {
      const currentQId = dailyCodingQuestion?.question?._id;
      const res = await interviewApi.refreshDailyChallenge({ currentQuestionId: currentQId });
      if (res.data?.success) {
        if (res.data.available === false || !res.data.data) {
          setNoNewAvailable(true);
          setDailyCodingQuestion(null);
        } else {
          setDailyCodingQuestion(res.data.data);
        }
      }
    } catch (e) {
      console.error('Refresh failed:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const meta = DOMAIN_META[domain] || DOMAIN_META.java;
  const questionData = dailyCodingQuestion?.question;

  const handleSolveClick = (e) => {
    if (e) e.stopPropagation();
    if (questionData?._id) {
      navigate(`/interview-game/question/${questionData._id}`);
    } else {
      navigate('/interview-game');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
        <div className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-5 pointer-events-none`}/>
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${meta.color} shadow text-white`}>
              <Calendar className="w-6 h-6"/>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Daily Challenge</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg">{meta.icon}</span>
                <span className={`text-xs font-bold ${meta.text}`}>{meta.label} Domain</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-semibold">Questions never repeat</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-slate-600 cursor-pointer disabled:opacity-50"
            title="Load next unique question"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-600' : ''}`}/>
          </button>
        </div>
      </div>

      {/* No New Questions Banner */}
      {noNewAvailable ? (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 shadow-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Daily Challenges Complete!</h3>
          <p className="text-xs text-slate-500 font-semibold">
            No new Daily Challenge questions are currently available. Check back tomorrow!
          </p>
        </div>
      ) : (
        /* Daily Coding Challenge Spotlight Banner (Green Protected Area - Unchanged Layout & Styling) */
        <div
          onClick={handleSolveClick}
          className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md hover:border-amber-300 transition cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-amber-100/90 text-amber-700 border border-amber-200/80 shrink-0 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                  DAILY CODING CHALLENGE
                </span>
                <span className="px-2 py-0.5 bg-amber-100/90 text-amber-800 text-[10px] font-extrabold rounded-full border border-amber-200">
                  +20 Bonus XP
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {questionData ? `Q${questionData.questionNumber}: ${questionData.title}` : 'Q25: First Non-Repeating Character'}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                {questionData?.problemStatement || 'Find first character that occurs only once. Return "$" if none.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSolveClick}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
          >
            <span>Solve Daily Question</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
