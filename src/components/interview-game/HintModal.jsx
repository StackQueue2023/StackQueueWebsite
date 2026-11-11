import React from 'react';
import { Lightbulb, Lock, Unlock, Eye, X, AlertCircle } from 'lucide-react';

export default function HintModal({
  isOpen,
  onClose,
  hints = [],
  unlockedHintCount,
  onUnlockHint
}) {
  if (!isOpen) return null;

  const hintLabels = [
    { title: 'Hint 1: Conceptual Direction', desc: 'High-level intuition on how to approach the problem.' },
    { title: 'Hint 2: Algorithmic Approach', desc: 'Pattern, data structures, or technique to consider.' },
    { title: 'Hint 3: Logical Breakdown', desc: 'Step-by-step reasoning (strictly without solution code).' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Progressive Hints</h3>
              <p className="text-xs text-slate-500">Unlock hints step-by-step to guide your solution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bonus alert */}
        <div className="flex items-center space-x-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl mb-5">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <strong>Pro Tip:</strong> Solving this question with <strong>0 hints used</strong> awards a <strong>+5 XP No-Hint Bonus</strong>!
          </span>
        </div>

        {/* Hints List */}
        <div className="space-y-4">
          {hints.map((hintText, idx) => {
            const isUnlocked = idx < unlockedHintCount;
            const canUnlock = idx === unlockedHintCount;
            const meta = hintLabels[idx] || { title: `Hint ${idx + 1}`, desc: 'Guidance' };

            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all p-4 ${
                  isUnlocked
                    ? 'bg-purple-50/40 border-purple-200 shadow-xs'
                    : canUnlock
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-50/50 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {isUnlocked ? (
                      <Unlock className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-xs font-bold text-slate-800">{meta.title}</span>
                  </div>

                  {!isUnlocked && canUnlock && (
                    <button
                      onClick={() => onUnlockHint(idx + 1)}
                      className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition active:scale-95 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Reveal Hint {idx + 1}</span>
                    </button>
                  )}
                </div>

                {isUnlocked ? (
                  <p className="text-xs text-slate-800 leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-200">
                    {hintText}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    {canUnlock ? meta.desc : `Unlock Hint ${idx} first.`}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {unlockedHintCount} of {hints.length} hints unlocked
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Back to Editor
          </button>
        </div>
      </div>
    </div>
  );
}
