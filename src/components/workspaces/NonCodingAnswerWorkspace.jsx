import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Shield,
  HelpCircle,
  Clock,
  ListOrdered
} from 'lucide-react';
import api from '../../api/client';

export default function NonCodingAnswerWorkspace({
  courseId,
  question,
  onSubmitNonCoding,
  isSubmitting,
  submissionFeedback,
  onRetry
}) {
  const isScenario = (question?.questionType === 'scenario' || question?.evaluationMethod === 'scenario');

  // Descriptive state
  const [answer, setAnswer] = useState(
    question?.savedAnswer || ''
  );

  // Scenario 3-tier state
  const [problemId, setProblemId] = useState(
    question?.savedScenario?.problemIdentification || ''
  );
  const [reasoning, setReasoning] = useState(
    question?.savedScenario?.reasoning || ''
  );
  const [proposedSolution, setProposedSolution] = useState(
    question?.savedScenario?.proposedSolution || ''
  );

  const [saveStatus, setSaveStatus] = useState('saved');
  const saveTimeoutRef = useRef(null);

  // Auto-save debouncer
  const triggerAutoSave = (dataToSave) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.post(`/workspace/state/${courseId}/${question._id}`, {
          environmentType: isScenario ? 'scenario' : 'descriptive',
          stateData: dataToSave
        });
        setSaveStatus('saved');
      } catch (e) {
        console.error('Non-coding workspace auto-save error:', e);
        setSaveStatus('saved');
      }
    }, 1200);
  };

  const handleAnswerChange = (val) => {
    setAnswer(val);
    triggerAutoSave({ submittedAnswer: val });
  };

  const handleScenarioChange = (field, val) => {
    let updated;
    if (field === 'prob') {
      setProblemId(val);
      updated = { problemIdentification: val, reasoning, proposedSolution };
    } else if (field === 'reason') {
      setReasoning(val);
      updated = { problemIdentification: problemId, reasoning: val, proposedSolution };
    } else {
      setProposedSolution(val);
      updated = { problemIdentification: problemId, reasoning, proposedSolution: val };
    }
    triggerAutoSave({ scenarioResponse: updated });
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    if (isScenario) {
      onSubmitNonCoding({
        scenarioResponse: {
          problemIdentification: problemId,
          reasoning,
          proposedSolution
        }
      });
    } else {
      onSubmitNonCoding({
        submittedAnswer: answer
      });
    }
  };

  const wordCount = (isScenario ? `${problemId} ${reasoning} ${proposedSolution}` : answer)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Workspace Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-slate-100 flex flex-col">
        {/* Workspace Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-200">
              {isScenario ? 'Structured Scenario Assessment Studio' : 'Descriptive Answer Studio'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px] font-mono text-slate-400">{wordCount} words written</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
              <span className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <span>{saveStatus === 'saving' ? 'Auto-saving...' : 'Auto-saved'}</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-mono text-[11px] font-bold">
              Passing: {question?.passingThreshold || 70}%
            </span>
          </div>
        </div>

        {/* Input Forms */}
        <div className="p-5 space-y-4">
          {isScenario ? (
            /* 3-Tier Scenario Response */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">1</span>
                  <span>Problem Identification (What is the core issue or defect?)</span>
                </label>
                <textarea
                  rows={2}
                  value={problemId}
                  onChange={(e) => handleScenarioChange('prob', e.target.value)}
                  placeholder="Identify what specific fault, vulnerability, or failure has occurred..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-sky-400 flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px]">2</span>
                  <span>Root Cause Reasoning (Why does this happen?)</span>
                </label>
                <textarea
                  rows={3}
                  value={reasoning}
                  onChange={(e) => handleScenarioChange('reason', e.target.value)}
                  placeholder="Explain the underlying technical mechanism or operational reason..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 outline-none focus:border-sky-400 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                  <span>Proposed Solution & Remediation (How should this be fixed?)</span>
                </label>
                <textarea
                  rows={3}
                  value={proposedSolution}
                  onChange={(e) => handleScenarioChange('sol', e.target.value)}
                  placeholder="Describe the concrete actions, code changes, or architectural fixes to mitigate this..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-400 font-sans"
                />
              </div>
            </div>
          ) : (
            /* Comprehensive Descriptive Answer Form */
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Your Technical Explanation</span>
                <span className="text-[11px] font-normal text-slate-400">Semantic & Conceptual Evaluation Active</span>
              </label>
              <textarea
                rows={8}
                value={answer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Write your explanation here. Clearly cover key definitions, working principles, advantages/disadvantages, and relevant concepts..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 font-sans leading-relaxed resize-y min-h-[180px]"
              />
            </div>
          )}

          {/* Rubric Preview if configured */}
          {question?.evaluationRubric && question.evaluationRubric.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Evaluation Rubric
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                {question.evaluationRubric.map((r, i) => (
                  <div key={i} className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300 font-medium">{r.criterion}</span>
                    <span className="text-indigo-400 font-mono font-bold">{r.maxScore} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <p className="text-[11px] text-slate-500">
              Evaluated on meaning, mandatory concept coverage, and factual accuracy.
            </p>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || wordCount < 3}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Response...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit for Evaluation</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Evaluation Feedback Display */}
      {submissionFeedback && (
        <div
          className={`p-5 rounded-2xl border text-xs space-y-3 shadow-lg transition-all ${
            submissionFeedback.status === 'Passed'
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
              : submissionFeedback.status === 'Partially Correct'
              ? 'bg-amber-950/20 border-amber-500/40 text-amber-100'
              : submissionFeedback.status === 'Instructor Review Required'
              ? 'bg-sky-950/20 border-sky-500/40 text-sky-100'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-100'
          }`}
        >
          {/* Header Status Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {submissionFeedback.status === 'Passed' && (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {submissionFeedback.status === 'Partially Correct' && (
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              {submissionFeedback.status === 'Failed' && (
                <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
              )}
              {submissionFeedback.status === 'Instructor Review Required' && (
                <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              )}

              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px] uppercase tracking-wider ${
                    submissionFeedback.status === 'Passed' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' :
                    submissionFeedback.status === 'Partially Correct' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' :
                    submissionFeedback.status === 'Instructor Review Required' ? 'bg-sky-500/30 text-sky-300 border border-sky-500/50' :
                    'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                  }`}>
                    {submissionFeedback.status}
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {submissionFeedback.marksAwarded} / {submissionFeedback.maxMarks} Marks ({submissionFeedback.percentage}%)
                  </span>
                </div>
                <p className="font-semibold text-sm mt-1 text-white">
                  {submissionFeedback.feedback || submissionFeedback.message}
                </p>
              </div>
            </div>

            {submissionFeedback.status !== 'Passed' && submissionFeedback.status !== 'Instructor Review Required' && (
              <button
                onClick={onRetry}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Question</span>
              </button>
            )}
          </div>

          {/* Missing Requirements & Correction Guidance */}
          {submissionFeedback.correctionGuidance && (
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Correction Guidance:
              </span>
              <p className="text-slate-300 font-medium">
                {submissionFeedback.correctionGuidance}
              </p>
            </div>
          )}

          {/* Concepts Checklist Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
            {submissionFeedback.identifiedConcepts && submissionFeedback.identifiedConcepts.length > 0 && (
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                <span className="text-emerald-400 font-bold block text-[10px] uppercase">Identified Concepts</span>
                {submissionFeedback.identifiedConcepts.map((c, i) => (
                  <div key={i} className="flex items-center space-x-1.5 text-emerald-200">
                    <span>✓</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            )}

            {submissionFeedback.missingConcepts && submissionFeedback.missingConcepts.length > 0 && (
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 space-y-1">
                <span className="text-rose-400 font-bold block text-[10px] uppercase">Missing Required Concepts</span>
                {submissionFeedback.missingConcepts.map((c, i) => (
                  <div key={i} className="flex items-center space-x-1.5 text-rose-300">
                    <span>✗</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
