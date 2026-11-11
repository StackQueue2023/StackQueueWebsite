import React from 'react';
import { BookOpen, CheckCircle2, Lock, Clock, ArrowRight } from 'lucide-react';

export default function CurrentLearningWidget({ currentLearning, onOpenTasks }) {
  if (!currentLearning) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Current Learning</h3>
        <p className="text-xs text-slate-600 mt-2">All enrolled modules have been completed! Check with your tutor for advanced topics.</p>
      </div>
    );
  }

  const {
    conceptId,
    conceptTitle,
    moduleTitle,
    tutorStatus,
    isLocked,
    tasksTotal,
    tasksCompleted,
    taskPercentage,
    message
  } = currentLearning;

  const isTutorCompleted = tutorStatus === 'COMPLETED';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
              Current Learning
            </span>
            <h3 className="text-base font-black text-slate-900">
              {moduleTitle} → {conceptTitle}
            </h3>
          </div>
        </div>

        {/* Tutor Concept Status Badge */}
        <div>
          {isTutorCompleted ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>✓ Concept Completed</span>
            </span>
          ) : tutorStatus === 'IN_PROGRESS' ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>🔄 Tutor In Progress</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
              <span>○ Not Started</span>
            </span>
          )}
        </div>
      </div>

      {/* Task Status & Progress */}
      {isLocked ? (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Tasks: 🔒 Locked</span>
          </div>
          <p className="text-xs text-amber-700 font-medium leading-relaxed">
            {message || 'Tutor is currently teaching this concept. Tasks will unlock after the tutor completes this concept.'}
          </p>
          <div className="pt-1">
            <button
              disabled
              className="px-4 py-2 bg-slate-200 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Locked until Tutor Completion</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">
              Tasks: <strong className="text-purple-600">{tasksCompleted} / {tasksTotal}</strong> Completed
            </span>
            <span className="font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              {taskPercentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] rounded-full transition-all duration-700"
              style={{ width: `${taskPercentage}%` }}
            ></div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => onOpenTasks(conceptId)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 hover:shadow transition flex items-center space-x-2"
            >
              <span>CONTINUE TASK</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-semibold text-slate-500">
              {tasksTotal - tasksCompleted} tasks remaining
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
