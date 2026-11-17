import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Plus,
  Trash2,
  Shield,
  FileCheck,
  HelpCircle
} from 'lucide-react';
import api from '../../api/client';

export default function QuestionEvaluationConfigModal({
  question,
  isOpen,
  onClose,
  onSaved
}) {
  if (!isOpen || !question) return null;

  const [evaluationMethod, setEvaluationMethod] = useState(question.evaluationMethod || question.questionType || 'descriptive');
  const [expectedAnswer, setExpectedAnswer] = useState(question.expectedAnswer || '');
  const [explanation, setExplanation] = useState(question.explanation || question.theoryAnswer || '');
  const [mandatoryConcepts, setMandatoryConcepts] = useState(question.mandatoryConcepts || []);
  const [acceptedAlternatives, setAcceptedAlternatives] = useState(question.acceptedAlternatives || []);
  const [negativeConcepts, setNegativeConcepts] = useState(question.negativeConcepts || []);
  const [passingThreshold, setPassingThreshold] = useState(question.passingThreshold || 70);
  const [maxMarks, setMaxMarks] = useState(question.maxMarks || question.points || 10);
  const [reviewMode, setReviewMode] = useState(question.reviewMode || 'automatic');
  const [rubrics, setRubrics] = useState(question.evaluationRubric || []);

  const [conceptInput, setConceptInput] = useState('');
  const [altInput, setAltInput] = useState('');
  const [negInput, setNegInput] = useState('');

  const [batteryResults, setBatteryResults] = useState(question.testBatteryResults || null);
  const [isRunningBattery, setIsRunningBattery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Add Tag Handlers
  const handleAddConcept = () => {
    if (conceptInput.trim() && !mandatoryConcepts.includes(conceptInput.trim())) {
      setMandatoryConcepts([...mandatoryConcepts, conceptInput.trim()]);
      setConceptInput('');
    }
  };

  const handleAddAlt = () => {
    if (altInput.trim() && !acceptedAlternatives.includes(altInput.trim())) {
      setAcceptedAlternatives([...acceptedAlternatives, altInput.trim()]);
      setAltInput('');
    }
  };

  const handleAddNeg = () => {
    if (negInput.trim() && !negativeConcepts.includes(negInput.trim())) {
      setNegativeConcepts([...negativeConcepts, negInput.trim()]);
      setNegInput('');
    }
  };

  // Add Rubric Criterion
  const handleAddRubric = () => {
    setRubrics([
      ...rubrics,
      { criterion: 'New Criterion', weight: 1, maxScore: 10, description: '' }
    ]);
  };

  // Save Configuration
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await api.put(`/adaptive-questions/admin/questions/${question._id}/evaluation-config`, {
        evaluationMethod,
        expectedAnswer,
        explanation,
        mandatoryConcepts,
        acceptedAlternatives,
        negativeConcepts,
        passingThreshold: Number(passingThreshold),
        maxMarks: Number(maxMarks),
        reviewMode,
        evaluationRubric: rubrics
      });
      if (res.data?.success) {
        onSaved && onSaved(res.data.question);
        onClose();
      }
    } catch (e) {
      console.error('Failed to save evaluation config:', e);
      alert(e.response?.data?.message || 'Failed to save evaluation configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  // Run 6-Case Accuracy Test Battery
  const handleRunBattery = async () => {
    try {
      setIsRunningBattery(true);
      // Save first
      await api.put(`/adaptive-questions/admin/questions/${question._id}/evaluation-config`, {
        evaluationMethod,
        expectedAnswer,
        explanation,
        mandatoryConcepts,
        acceptedAlternatives,
        negativeConcepts,
        passingThreshold: Number(passingThreshold),
        maxMarks: Number(maxMarks),
        reviewMode,
        evaluationRubric: rubrics
      });

      const res = await api.post(`/adaptive-questions/admin/test-battery/${question._id}`);
      if (res.data?.success) {
        setBatteryResults(res.data.results);
      }
    } catch (e) {
      console.error('Failed to run test battery:', e);
      alert('Error running accuracy test battery.');
    } finally {
      setIsRunningBattery(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="font-bold text-sm text-white">Non-Coding Question Evaluation Engine Config</h2>
              <p className="text-[11px] text-slate-400 truncate max-w-md">{question.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Method and Review Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Evaluation Method</label>
              <select
                value={evaluationMethod}
                onChange={(e) => setEvaluationMethod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
              >
                <option value="descriptive">Descriptive Semantic</option>
                <option value="scenario">Scenario 3-Tier</option>
                <option value="objective">Objective Exact/Alternative</option>
                <option value="practical">Practical Workspace</option>
                <option value="subjective_rubric">Subjective Rubric</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Review Mode</label>
              <select
                value={reviewMode}
                onChange={(e) => setReviewMode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
              >
                <option value="automatic">Automatic Evaluation</option>
                <option value="instructor_review">Instructor Review Required</option>
                <option value="hybrid_uncertain">Hybrid (Review on Borderline)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Passing Threshold (%)</label>
              <input
                type="number"
                min="30"
                max="100"
                value={passingThreshold}
                onChange={(e) => setPassingThreshold(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          {/* Expected Answer */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Expected Canonical Answer (Required)
            </label>
            <textarea
              rows={3}
              value={expectedAnswer}
              onChange={(e) => setExpectedAnswer(e.target.value)}
              placeholder="Enter canonical complete solution..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          {/* Mandatory Concepts */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Mandatory Concepts (Every answer MUST address these)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={conceptInput}
                onChange={(e) => setConceptInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddConcept())}
                placeholder="e.g., asymmetric encryption, public key..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
              />
              <button
                type="button"
                onClick={handleAddConcept}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {mandatoryConcepts.map((c, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono text-[11px] flex items-center space-x-1">
                  <span>{c}</span>
                  <button onClick={() => setMandatoryConcepts(mandatoryConcepts.filter((_, idx) => idx !== i))} className="hover:text-rose-400">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Accepted Alternative Formulations */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Accepted Alternative Answers (Semantic Equivalents)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={altInput}
                onChange={(e) => setAltInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAlt())}
                placeholder="Approved alternative phrase..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
              />
              <button
                type="button"
                onClick={handleAddAlt}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {acceptedAlternatives.map((alt, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono text-[11px] flex items-center space-x-1">
                  <span className="truncate max-w-xs">{alt}</span>
                  <button onClick={() => setAcceptedAlternatives(acceptedAlternatives.filter((_, idx) => idx !== i))} className="hover:text-rose-400">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Negative Concepts / Anti-Concepts */}
          <div>
            <label className="text-[11px] font-bold text-rose-400 block mb-1">
              Negative Concepts / Misconceptions (Penalize if asserted as fact)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={negInput}
                onChange={(e) => setNegInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNeg())}
                placeholder="e.g. symmetric key, single shared secret..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
              />
              <button
                type="button"
                onClick={handleAddNeg}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {negativeConcepts.map((neg, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-700/60 text-rose-300 font-mono text-[11px] flex items-center space-x-1">
                  <span>{neg}</span>
                  <button onClick={() => setNegativeConcepts(negativeConcepts.filter((_, idx) => idx !== i))} className="hover:text-rose-400">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Section G: 6-Case Accuracy Test Battery Display */}
          <div className="p-4 bg-slate-900/90 border border-indigo-900/50 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Pre-Publishing 6-Case Accuracy Verification</span>
                <span className="text-[11px] text-slate-400">Tests canonical, differently worded, partial, incorrect, fluff, and ambiguous answers.</span>
              </div>
              <button
                type="button"
                onClick={handleRunBattery}
                disabled={isRunningBattery || !expectedAnswer.trim()}
                className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRunningBattery ? 'Running Battery...' : 'Run Test Battery'}</span>
              </button>
            </div>

            {batteryResults && (
              <div className="space-y-2 mt-2 pt-2 border-t border-slate-800 font-mono text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded font-bold ${batteryResults.allPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
                    {batteryResults.casesPassed} / {batteryResults.totalCases} Cases Passed
                  </span>
                  <span className="text-slate-400">
                    {batteryResults.allPassed ? '✓ Verified for Publishing' : '✗ Adjust configuration to pass all cases'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {batteryResults.cases?.map((c, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="truncate mr-2">
                        <span className="text-slate-300 font-bold block truncate">{c.testCase}</span>
                        <span className="text-[10px] text-slate-500">Exp: {c.expectedStatus} → Got: {c.actualStatus}</span>
                      </div>
                      <span className={c.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {c.passed ? '✓ PASS' : '✗ FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
