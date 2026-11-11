import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Compass, Sparkles } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function LearningTimeline({ studentId }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const url = studentId ? `/sessions/curriculum/progress?studentId=${studentId}` : '/sessions/curriculum/progress';
        const res = await api.get(url);
        if (res.data.success) {
          setProgress(res.data.data);
        }
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error('Error fetching curriculum progress:', err);
        }
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      fetchProgress();
    }
  }, [studentId, user]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl flex justify-center py-6">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Curriculum Journey & Topic Progression</span>
        </div>
        <span className="text-xs font-mono font-bold text-purple-600">
          {progress.completedTopicsCount} / {progress.totalTopicsCount} Topics ({progress.overallPercentage}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div 
          className="h-full bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] rounded-full transition-all duration-500"
          style={{ width: `${progress.overallPercentage}%` }}
        />
      </div>

      {/* Next Up Recommendation Banner */}
      <div className="p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-1">
        <div className="flex items-center space-x-2 text-purple-800 font-bold text-[11px] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>What's Next In Your Syllabus:</span>
        </div>
        <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
          <span>{progress.nextSuggestedTopic}</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {progress.prerequisiteReason}
        </p>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-2 pt-1">
        <h4 className="text-xs font-bold text-slate-800">Topic Roadmap:</h4>
        <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {progress.allOrderedTopics?.slice(0, 7).map((topic, idx) => {
            const isCurrent = topic.title === progress.currentTopic;
            return (
              <div key={idx} className="relative flex items-start space-x-3 text-xs">
                {/* Dot */}
                <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                  topic.isCompleted 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                    : isCurrent
                    ? 'bg-purple-100 text-purple-700 border border-purple-400 animate-pulse'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  {topic.isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-2.5 h-2.5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <span className={`font-semibold ${
                      topic.isCompleted 
                        ? 'text-slate-400 line-through decoration-slate-300' 
                        : isCurrent
                        ? 'text-purple-700 font-bold'
                        : 'text-slate-700'
                    }`}>
                      {topic.title}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      ({topic.subjectTitle})
                    </span>
                  </div>

                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                      CURRENT
                    </span>
                  )}
                  {topic.isCompleted && (
                    <span className="text-[10px] font-mono font-semibold text-emerald-600 shrink-0">
                      Done
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
