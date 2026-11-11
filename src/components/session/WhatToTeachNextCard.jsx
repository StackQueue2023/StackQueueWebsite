import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import api from '../../api/client';

export default function WhatToTeachNextCard({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendation() {
      try {
        const url = studentId ? `/sessions/curriculum/progress?studentId=${studentId}` : '/sessions/curriculum/progress';
        const res = await api.get(url);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching curriculum recommendation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecommendation();
  }, [studentId]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200/90 shadow-sm p-5 rounded-2xl flex justify-center py-6">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white border border-slate-200/90 shadow-sm p-5 rounded-2xl space-y-3 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Curriculum Engine: What To Teach Next</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
          Deterministic
        </span>
      </div>

      <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-xl space-y-2">
        <div className="text-[11px] text-slate-500">
          Recommended Next Topic for Batch / Student:
        </div>
        <h3 className="text-base font-black text-slate-900">
          {data.nextSuggestedTopic}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          💡 <strong className="text-slate-800">Prerequisite Rationale:</strong> {data.prerequisiteReason}
        </p>

        <div className="pt-2 flex items-center justify-between border-t border-purple-100 text-xs">
          <span className="text-slate-500">
            Current Module: <strong className="text-slate-700">{data.currentModule}</strong>
          </span>
          <span className="text-emerald-600 font-bold">
            {data.completedTopicsCount} / {data.totalTopicsCount} Topics Mastered
          </span>
        </div>
      </div>
    </div>
  );
}
