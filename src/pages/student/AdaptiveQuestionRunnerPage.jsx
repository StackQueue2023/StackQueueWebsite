import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  Award,
  Zap,
  Clock,
  Sparkles,
  ChevronRight,
  Code2,
  BookOpen,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import InterviewCodeEditor, { MINIMAL_TEMPLATES } from '../../components/interview-game/InterviewCodeEditor';
import InteractiveWorkspaceContainer from '../../components/workspaces/InteractiveWorkspaceContainer';
import NonCodingAnswerWorkspace from '../../components/workspaces/NonCodingAnswerWorkspace';

export default function AdaptiveQuestionRunnerPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { applyXpUpdate } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // MCQ Selection State
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null); // { isCorrect: Boolean, message: String, pointsAwarded: Number }
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);

  // Coding Question State
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [runResult, setRunResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Load current question
  const loadCurrentQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      setSubmissionFeedback(null);
      setSelectedOption(null);
      setRunResult(null);

      const res = await api.get(`/adaptive-questions/course/${courseId}/current`);
      if (res.data?.success) {
        setData(res.data);

        // If it's a coding question, initialize starter code
        if (!res.data.completed && res.data.question?.questionType === 'coding') {
          const q = res.data.question;
          const lang = q.programmingLanguage || 'java';
          setLanguage(lang);
          const initialCode = q.savedCode || (q.starterCode && q.starterCode[lang]) || MINIMAL_TEMPLATES[lang] || '';
          setCode(initialCode);
        }
      } else {
        setError(res.data?.message || 'Could not load question.');
      }
    } catch (err) {
      console.error('Failed to load current question:', err);
      setError(err.response?.data?.message || 'Failed to connect to question server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      loadCurrentQuestion();
    }
    return () => {
      if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    };
  }, [courseId]);

  // Handle MCQ Option Selection (Only ONE option allowed)
  const handleSelectOption = (optionId) => {
    if (submissionFeedback || isSubmitting) return; // Locked once submitted
    setSelectedOption(optionId);
  };

  // Submit MCQ Answer
  const handleSubmitMcq = async () => {
    if (!selectedOption || isSubmitting || submissionFeedback) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/adaptive-questions/submit-mcq', {
        courseId,
        questionId: data.question._id,
        selectedOption
      });

      if (res.data?.success) {
        const result = res.data;
        setSubmissionFeedback({
          isCorrect: result.isCorrect,
          message: result.message,
          pointsAwarded: result.pointsAwarded || 0,
          totalPoints: result.totalPoints
        });

        // Update auth state points if correct
        if (result.isCorrect && applyXpUpdate) {
          applyXpUpdate({
            totalXp: result.totalPoints,
            xpAwarded: result.pointsAwarded || 10
          });
        }

        // Auto Advance to Next Question after brief evaluation display
        const delayMs = result.isCorrect ? 1500 : 2000;
        const timer = setTimeout(() => {
          loadCurrentQuestion();
        }, delayMs);
        setAutoAdvanceTimer(timer);
      }
    } catch (err) {
      console.error('Error submitting MCQ answer:', err);
      if (err.response?.status === 409) {
        setSubmissionFeedback({
          isCorrect: err.response.data?.isCorrect || false,
          message: err.response.data?.message || 'Already submitted.',
          pointsAwarded: 0
        });
        setTimeout(loadCurrentQuestion, 1800);
      } else {
        alert(err.response?.data?.message || 'Failed to submit answer.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Coding Solution
  const handleSubmitCode = async () => {
    if (!code || isSubmitting || submissionFeedback) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/adaptive-questions/submit-code', {
        courseId,
        questionId: data.question._id,
        code,
        language
      });

      if (res.data?.success) {
        const result = res.data;
        setSubmissionFeedback({
          isCorrect: result.isCorrect,
          message: result.message,
          pointsAwarded: result.pointsAwarded || 0,
          totalPoints: result.totalPoints
        });

        if (result.isCorrect && applyXpUpdate) {
          applyXpUpdate({
            totalXp: result.totalPoints,
            xpAwarded: result.pointsAwarded || 15
          });
        }

        if (result.isCorrect) {
          const timer = setTimeout(() => {
            loadCurrentQuestion();
          }, 2000);
          setAutoAdvanceTimer(timer);
        }
      }
    } catch (err) {
      console.error('Error submitting code solution:', err);
      alert(err.response?.data?.message || 'Code evaluation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Practical Non-Coding Workspace Solution
  const handleSubmitPractical = async (envType, stateData) => {
    if (isSubmitting || submissionFeedback) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/adaptive-questions/submit-practical', {
        courseId,
        questionId: data.question._id,
        environmentType: envType,
        stateData
      });

      if (res.data?.success) {
        const result = res.data;
        setSubmissionFeedback({
          isCorrect: result.isCorrect,
          message: result.message,
          pointsAwarded: result.pointsAwarded || 0,
          totalPoints: result.totalPoints,
          checks: result.checks
        });

        if (result.isCorrect && applyXpUpdate) {
          applyXpUpdate({
            totalXp: result.totalPoints,
            xpAwarded: result.pointsAwarded || 20
          });
        }

        if (result.isCorrect) {
          const timer = setTimeout(() => {
            loadCurrentQuestion();
          }, 2200);
          setAutoAdvanceTimer(timer);
        }
      }
    } catch (err) {
      console.error('Error submitting practical solution:', err);
      alert(err.response?.data?.message || 'Practical task validation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Non-Coding Answer (Descriptive / Scenario / Objective)
  const handleSubmitNonCoding = async (payload) => {
    if (isSubmitting || (submissionFeedback && submissionFeedback.status === 'Passed')) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/adaptive-questions/submit-non-coding', {
        courseId,
        questionId: data.question._id,
        ...payload
      });

      if (res.data?.success) {
        const result = res.data;
        setSubmissionFeedback({
          status: result.status,
          isCorrect: result.isCorrect,
          marksAwarded: result.marksAwarded,
          maxMarks: result.maxMarks,
          percentage: result.percentage,
          message: result.message,
          feedback: result.feedback,
          missingConcepts: result.missingConcepts || [],
          identifiedConcepts: result.identifiedConcepts || [],
          correctionGuidance: result.correctionGuidance || '',
          pointsAwarded: result.pointsAwarded || 0,
          totalPoints: result.totalPoints
        });

        if (result.isCorrect && applyXpUpdate) {
          applyXpUpdate({
            totalXp: result.totalPoints,
            xpAwarded: result.pointsAwarded || 10
          });
        }

        if (result.isCorrect) {
          const timer = setTimeout(() => {
            loadCurrentQuestion();
          }, 2500);
          setAutoAdvanceTimer(timer);
        }
      }
    } catch (err) {
      console.error('Error submitting non-coding answer:', err);
      alert(err.response?.data?.message || 'Answer evaluation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryQuestion = () => {
    setSubmissionFeedback(null);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading course assessment question...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white border border-rose-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Assessment Error</h2>
        <p className="text-xs text-slate-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
        >
          Return Back
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // COMPLETION SCREEN: ALL QUESTIONS ANSWERED
  // ─────────────────────────────────────────────────────────────
  if (data?.completed) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden space-y-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-500/30">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Assessment Completed
            </span>
            <h1 className="text-3xl font-black text-slate-900">
              {data.courseTitle || 'Course'} Assessment Complete!
            </h1>
            <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto">
              You have completed all configured questions for this course. Your performance points have been permanently recorded.
            </p>
          </div>

          {/* Performance Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Questions</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{data.totalQuestions}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-emerald-600 uppercase">Correct</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{data.correctCount}</p>
            </div>
            <div className="bg-rose-50 border border-rose-200/60 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-rose-600 uppercase">Wrong</span>
              <p className="text-2xl font-black text-rose-700 mt-1">{data.wrongCount}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200/60 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-indigo-600 uppercase">Points Won</span>
              <p className="text-2xl font-black text-indigo-700 mt-1">+{data.totalPointsEarned}</p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/admin/courses')}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md shadow-slate-900/10 cursor-pointer"
            >
              Browse More Courses
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // ACTIVE QUESTION SCREEN (ONE QUESTION AT A TIME)
  // ─────────────────────────────────────────────────────────────
  const q = data?.question;
  const isMcq = (q?.questionType === 'mcq');
  const isNonCodingText = Boolean(
    ['descriptive', 'scenario', 'conceptual', 'objective', 'subjective_rubric'].includes(q?.questionType) ||
    ['descriptive', 'scenario', 'objective', 'subjective_rubric'].includes(q?.evaluationMethod)
  );
  const isPractical = !isNonCodingText && (
    q?.questionType === 'practical' ||
    Boolean(
      q?.environmentType &&
      q.environmentType !== 'standard_coding' &&
      !['java_programming', 'python_programming', 'c_programming', 'cpp_programming'].includes(q.environmentType) &&
      !isMcq
    )
  );
  const progressPercent = data?.totalQuestions > 0
    ? Math.round(((data.questionIndex - 1) / data.totalQuestions) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 pt-4">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                {data.courseTitle}
              </span>
              <span className="text-xs font-bold text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">
                {isMcq
                  ? 'Multiple Choice (MCQ)'
                  : isNonCodingText
                  ? (q?.questionType === 'scenario' ? 'Scenario-Based Evaluation' : 'Descriptive Technical Evaluation')
                  : isPractical
                  ? `Interactive Workspace (${data.environment?.environmentName || q.environmentType || 'Studio'})`
                  : `Practical Coding (${q.programmingLanguage?.toUpperCase() || 'JAVA'})`}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              Question {data.questionIndex} of {data.totalQuestions}
            </h2>
          </div>
        </div>

        {/* Student Points Badge */}
        <div className="flex items-center space-x-3">
          <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl flex items-center space-x-2 shadow-2xs">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <div className="text-left">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block leading-none">Your Points</span>
              <span className="text-sm font-black text-amber-900 font-mono">{data.studentTotalPoints} PTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        {/* Meta Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
              q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
              'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {q.difficulty}
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
              {q.topic || 'Core Concept'}
            </span>
          </div>

          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            +{q.points} Points Available
          </span>
        </div>

        {/* Question Title & Problem Statement */}
        <div className="space-y-3">
          <h3 className="text-xl font-black text-slate-900 leading-snug">
            {q.title}
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium bg-slate-50/70 p-4 rounded-2xl border border-slate-200/50">
            {q.problemStatement}
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            CASE B: MULTIPLE-CHOICE OPTIONS (EXACTLY FOUR OPTIONS)
            ───────────────────────────────────────────────────────────── */}
        {isMcq ? (
          <div className="space-y-4 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Select ONE Option:
            </span>

            <div className="grid grid-cols-1 gap-3">
              {(q.options || []).map((opt) => {
                const isSelected = (selectedOption === opt.optionId);
                const isLocked = Boolean(submissionFeedback);

                return (
                  <div
                    key={opt.optionId}
                    onClick={() => handleSelectOption(opt.optionId)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center space-x-4 select-none ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                    } ${isLocked ? 'cursor-not-allowed opacity-90' : ''}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {opt.optionId}
                    </div>

                    <div className="flex-1 text-sm font-semibold text-slate-800">
                      {opt.text}
                    </div>

                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                      {isSelected ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submission Feedback Banner */}
            {submissionFeedback && (
              <div
                className={`p-4 rounded-2xl border font-bold text-sm flex items-center justify-between transition-all animate-in fade-in zoom-in-95 ${
                  submissionFeedback.isCorrect
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {submissionFeedback.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-base font-black">{submissionFeedback.message}</p>
                    <p className="text-xs font-normal opacity-90">
                      {submissionFeedback.isCorrect
                        ? `+${submissionFeedback.pointsAwarded} points permanently awarded to your profile!`
                        : 'No points awarded. Advancing to next question...'}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-white/70">
                  Auto Next →
                </div>
              </div>
            )}

            {/* Action Button */}
            {!submissionFeedback && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedOption || isSubmitting}
                  onClick={handleSubmitMcq}
                  className={`px-7 py-3 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-md cursor-pointer ${
                    !selectedOption || isSubmitting
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Evaluating Answer...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Answer</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : isNonCodingText ? (
          /* ─────────────────────────────────────────────────────────────
             CASE B: NON-CODING DESCRIPTIVE / SCENARIO EVALUATION
             ───────────────────────────────────────────────────────────── */
          <div className="pt-2">
            <NonCodingAnswerWorkspace
              courseId={courseId}
              question={q}
              onSubmitNonCoding={handleSubmitNonCoding}
              isSubmitting={isSubmitting}
              submissionFeedback={submissionFeedback}
              onRetry={handleRetryQuestion}
            />
          </div>
        ) : isPractical ? (
          /* ─────────────────────────────────────────────────────────────
             CASE C: INTERACTIVE WORKSPACE (UI/UX, 3D CAD, CLOUD, QA, RPA, SQL)
             ───────────────────────────────────────────────────────────── */
          <div className="space-y-4 pt-2">
            <div className="h-[540px] rounded-2xl overflow-hidden shadow-sm">
              <InteractiveWorkspaceContainer
                courseId={courseId}
                question={q}
                environment={data.environment}
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                onSubmitCode={handleSubmitCode}
                onSubmitPractical={handleSubmitPractical}
                isSubmitting={isSubmitting}
                runResult={runResult}
                isRunning={isRunning}
              />
            </div>

            {/* Submission Feedback Banner */}
            {submissionFeedback && (
              <div
                className={`p-4 rounded-2xl border font-bold text-sm space-y-2 transition-all ${
                  submissionFeedback.isCorrect
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {submissionFeedback.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-base font-black">{submissionFeedback.message}</p>
                    <p className="text-xs font-normal opacity-90">
                      {submissionFeedback.isCorrect
                        ? `+${submissionFeedback.pointsAwarded} points permanently awarded to your profile!`
                        : 'Some criteria were not fully satisfied. Review the rubric checks below and adjust your workspace.'}
                    </p>
                  </div>
                </div>

                {submissionFeedback.checks && submissionFeedback.checks.length > 0 && (
                  <div className="mt-2 space-y-1 bg-white/70 rounded-xl p-3 text-xs">
                    {submissionFeedback.checks.map((chk, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <span className={chk.passed ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                          {chk.passed ? '✓' : '✗'}
                        </span>
                        <span className="text-slate-700">{chk.criterion}</span>
                        {chk.detail && <span className="text-slate-500 font-mono text-[10px]">({chk.detail})</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
             CASE A: CODING PROBLEM EDITOR WITH COMPILER
             ───────────────────────────────────────────────────────────── */
          <div className="space-y-4 pt-2">
            {/* Input/Output/Constraints Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/60 font-mono">
              <div>
                <span className="font-bold text-slate-600 block mb-1 uppercase text-[10px]">Input Format</span>
                <p className="text-slate-800 whitespace-pre-line">{q.inputFormat || 'Read from standard input.'}</p>
              </div>
              <div>
                <span className="font-bold text-slate-600 block mb-1 uppercase text-[10px]">Output Format</span>
                <p className="text-slate-800 whitespace-pre-line">{q.outputFormat || 'Print to standard output.'}</p>
              </div>
              {q.constraints && (
                <div className="col-span-1 md:col-span-2 border-t border-slate-200 pt-2 mt-1">
                  <span className="font-bold text-slate-600 block mb-1 uppercase text-[10px]">Constraints</span>
                  <p className="text-slate-800 whitespace-pre-line">{q.constraints}</p>
                </div>
              )}
            </div>

            {/* Sample Examples */}
            {q.examples && q.examples.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sample Test Cases</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="bg-slate-900 text-slate-100 p-3 rounded-xl">
                    <span className="text-slate-400 text-[10px] block mb-1 uppercase">Sample Input</span>
                    <pre className="whitespace-pre-wrap">{q.examples[0].input || '(None)'}</pre>
                  </div>
                  <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl">
                    <span className="text-slate-400 text-[10px] block mb-1 uppercase">Sample Expected Output</span>
                    <pre className="whitespace-pre-wrap">{q.examples[0].output}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Code Editor */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 flex items-center space-x-1.5">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span>Code Editor ({language.toUpperCase()})</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">Compiler: {q.compiler || 'Active'}</span>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <InterviewCodeEditor
                  language={language}
                  code={code}
                  onChange={(newCode) => setCode(newCode)}
                />
              </div>
            </div>

            {/* Submission Feedback Banner */}
            {submissionFeedback && (
              <div
                className={`p-4 rounded-2xl border font-bold text-sm flex items-center justify-between transition-all ${
                  submissionFeedback.isCorrect
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {submissionFeedback.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-base font-black">{submissionFeedback.message}</p>
                    <p className="text-xs font-normal opacity-90">
                      {submissionFeedback.isCorrect
                        ? `+${submissionFeedback.pointsAwarded} points permanently awarded!`
                        : 'Some test cases failed. Review constraints and resubmit.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                disabled={isSubmitting || !code.trim()}
                onClick={handleSubmitCode}
                className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating with Compiler...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Code</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
