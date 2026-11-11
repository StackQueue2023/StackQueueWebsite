import React, { useState } from 'react';
import { CheckCircle2, Clock, Lock, ChevronDown, ChevronRight, BookOpen, Layers } from 'lucide-react';

export default function SyllabusRoadmap({ roadmap = [], onSelectConcept }) {
  const [expandedModules, setExpandedModules] = useState({});

  const toggleModule = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const getStatusBadge = (state) => {
    switch (state) {
      case 'COMPLETED':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed ✓</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>In Progress ◐</span>
          </span>
        );
      case 'UNLOCKED':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
            <span>○ Unlocked</span>
          </span>
        );
      case 'LOCKED':
      default:
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-full border border-slate-200">
            <Lock className="w-3.5 h-3.5" />
            <span>Locked 🔒</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            SYLLABUS ROADMAP
          </h3>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center space-x-1"><span className="text-emerald-600">✓</span> <span>Done</span></span>
          <span className="flex items-center space-x-1"><span className="text-amber-500">◐</span> <span>Active</span></span>
          <span className="flex items-center space-x-1"><span>🔒</span> <span>Locked</span></span>
        </div>
      </div>

      <div className="space-y-3">
        {roadmap.map((mod, index) => {
          const isExpanded = expandedModules[mod.id] !== undefined ? expandedModules[mod.id] : index <= 2;
          const concepts = mod.concepts || [];
          const allConceptsDone = concepts.length > 0 && concepts.every(c => c.state === 'COMPLETED');
          const hasActive = concepts.some(c => c.state === 'IN_PROGRESS' || c.state === 'UNLOCKED');

          return (
            <div
              key={mod.id}
              className="border border-slate-200 rounded-xl overflow-hidden transition"
            >
              {/* Module Header */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 transition text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-slate-400">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {mod.title}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {allConceptsDone ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Completed
                    </span>
                  ) : hasActive ? (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      ◐ In Progress
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      🔒 Locked
                    </span>
                  )}
                </div>
              </button>

              {/* Concepts List */}
              {isExpanded && (
                <div className="p-3 bg-white divide-y divide-slate-100">
                  {concepts.map(cpt => {
                    const isClickable = cpt.state !== 'LOCKED';

                    return (
                      <div
                        key={cpt.id}
                        onClick={() => isClickable && onSelectConcept && onSelectConcept(cpt.id)}
                        className={`py-2.5 px-3 rounded-lg flex items-center justify-between transition ${
                          isClickable
                            ? 'hover:bg-purple-50/60 cursor-pointer'
                            : 'opacity-60 cursor-not-allowed bg-slate-50/40'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <BookOpen className={`w-4 h-4 ${isClickable ? 'text-purple-600' : 'text-slate-400'}`} />
                          <div>
                            <span className="text-xs font-semibold text-slate-800">
                              {cpt.title}
                            </span>
                            {cpt.tasksTotal > 0 && (
                              <p className="text-[11px] text-slate-500 font-medium">
                                Tasks: {cpt.tasksCompleted} / {cpt.tasksTotal} ({cpt.tasksTotal > 0 ? Math.round((cpt.tasksCompleted / cpt.tasksTotal) * 100) : 0}%)
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          {getStatusBadge(cpt.state)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
