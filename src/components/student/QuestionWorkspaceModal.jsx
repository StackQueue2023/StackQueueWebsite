import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';
import confetti from 'canvas-confetti';
import {
  X, CheckCircle2, XCircle,
  Clock, Zap, Terminal, BookOpen,
  ChevronLeft, ChevronRight, ArrowRight
} from 'lucide-react';
import InterviewCodeEditor from '../interview-game/InterviewCodeEditor';
import { MINIMAL_TEMPLATES, getStudentAllowedLanguages, DOMAIN_TO_LANG } from '../../utils/studentLanguages';

export default function QuestionWorkspaceModal({
  task,
  moduleTitle,
  domain = 'java',
  isCompletedCourse = false,
  onClose = () => {},
  onSuccess = () => {},
  onNextTask = null,
  hasNextTask = false,
  onPrevTask = null,
  hasPrevTask = false,
  currentIndex = 0,
  totalTasks = 1
}) {
  const taskDomain = (task?.domain || domain || 'java').toLowerCase();
  const targetLang = DOMAIN_TO_LANG[taskDomain] || (['python', 'java', 'cpp', 'javascript'].includes(taskDomain) ? taskDomain : 'java');

  const [availableLanguages, setAvailableLanguages] = useState([targetLang]);
  const [selectedLanguage, setSelectedLanguage] = useState(targetLang);
  
  const initialCode = task.submittedCode || MINIMAL_TEMPLATES[targetLang] || MINIMAL_TEMPLATES.java;
  const [code, setCode] = useState(initialCode);
  const [codeMap, setCodeMap] = useState({ [targetLang]: initialCode });

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [lastExecutedCode, setLastExecutedCode] = useState(null);
  const [lastExecutedLang, setLastExecutedLang] = useState(null);
  const [lastExecutedTaskId, setLastExecutedTaskId] = useState(null);
  const [submissionFeedback, setSubmissionFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' | 'results'
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);
  const autoAdvanceTimerRef = useRef(null);

  const isLocked = task.status === 'locked';
  const isCompleted = task.status === 'completed' || isCompletedCourse;

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  // Determine if current exact editor contents have executed successfully against all test cases
  const hasRunCurrentCode = Boolean(
    runResults &&
    runResults.allPassed &&
    lastExecutedCode === code &&
    lastExecutedLang === selectedLanguage &&
    lastExecutedTaskId === task?._id
  );

  // Eligible to submit only when current code has passed all tests (or challenge is already completed)
  const canSubmit = !isLocked && (hasRunCurrentCode || isCompleted);

  // Lock background scrolling while modal is open, and add Escape listener
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting && !isRunning) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, isSubmitting, isRunning]);

  // Ensure language is strictly locked to task's course domain
  useEffect(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setActiveTab('problem');
    setSelectedTestCaseIdx(0);
    setSelectedLanguage(targetLang);
    setAvailableLanguages([targetLang]);
    const langCode = task.submittedCode || MINIMAL_TEMPLATES[targetLang] || MINIMAL_TEMPLATES.java;
    setCode(langCode);
    setCodeMap({ [targetLang]: langCode });
    setLastExecutedCode(null);
    setLastExecutedLang(null);
    setLastExecutedTaskId(null);
    setRunResults(null);
    setSubmissionFeedback(null);
  }, [task, domain, targetLang]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setCodeMap(prev => ({ ...prev, [selectedLanguage]: newCode }));
    // If user modifies previously tested code, invalidate current execution verification
    if (lastExecutedCode !== null && newCode !== lastExecutedCode) {
      setLastExecutedCode(null);
    }
  };

  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    const existingCode = codeMap[newLang] || MINIMAL_TEMPLATES[newLang] || '';
    setCode(existingCode);
    setLastExecutedCode(null);
    setLastExecutedLang(null);
    setLastExecutedTaskId(null);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setSubmissionFeedback(null);
    try {
      const runUrl = task.isModuleQuestion
        ? `/domain/questions/${task._id}/run`
        : `/domain/tasks/${task._id}/run`;
      const res = await api.post(runUrl, {
        code,
        language: selectedLanguage
      });
      const dataPayload = res.data?.data || res.data;
      if (res.data.success && dataPayload) {
        setRunResults(dataPayload);
        setActiveTab('results');
        setSelectedTestCaseIdx(0);

        if (dataPayload.allPassed) {
          setLastExecutedCode(code);
          setLastExecutedLang(selectedLanguage);
          setLastExecutedTaskId(task._id);
        } else {
          setLastExecutedCode(null);
          setLastExecutedLang(null);
          setLastExecutedTaskId(null);
        }
      } else {
        setRunResults({
          allPassed: false,
          compilationError: res.data.message || 'Execution failed',
          testResults: []
        });
        setActiveTab('results');
        setLastExecutedCode(null);
        setLastExecutedLang(null);
        setLastExecutedTaskId(null);
      }
    } catch (err) {
      setRunResults({
        allPassed: false,
        compilationError: err.response?.data?.message || err.message || 'Execution error',
        testResults: []
      });
      setActiveTab('results');
      setLastExecutedCode(null);
      setLastExecutedLang(null);
      setLastExecutedTaskId(null);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit && !isCompleted) {
      setSubmissionFeedback({
        type: 'error',
        message: '⚠️ You must run your code and pass all test cases before submitting.'
      });
      setActiveTab('results');
      return;
    }

    setIsSubmitting(true);
    setSubmissionFeedback(null);
    try {
      const submitUrl = task.isModuleQuestion
        ? `/domain/questions/${task._id}/submit`
        : `/domain/tasks/${task._id}/submit`;
      const res = await api.post(submitUrl, {
        code,
        language: selectedLanguage
      });

      if (res.data.success) {
        if (res.data.data?.evaluation) {
          setRunResults(res.data.data.evaluation);
        }
        setActiveTab('results');

        if (res.data.data?.allPassed) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });

          if (hasNextTask && onNextTask) {
            setSubmissionFeedback({
              type: 'success',
              message: `🎉 Perfect! All test cases passed! +${task.points} pts awarded. Moving to next question in 2 seconds...`,
              hasNext: true
            });

            if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = setTimeout(() => {
              if (onNextTask) onNextTask();
            }, 1800);
          } else {
            setSubmissionFeedback({
              type: 'success',
              message: `🎉 Perfect! All test cases passed! +${task.points} pts awarded. You have completed all questions in this module! 🎉`,
              hasNext: false
            });
          }

          onSuccess();
        } else {
          setSubmissionFeedback({
            type: 'error',
            message: res.data.message || 'Some test cases failed. Review test outputs below and refine your code.'
          });
        }
      } else {
        setSubmissionFeedback({
          type: 'error',
          message: res.data.message || 'Submission failed. Please try again.'
        });
      }
    } catch (err) {
      setSubmissionFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Submission failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset code to minimal starter template?')) {
      const resetTpl = MINIMAL_TEMPLATES[selectedLanguage] || '';
      setCode(resetTpl);
      setCodeMap(prev => ({ ...prev, [selectedLanguage]: resetTpl }));
      setRunResults(null);
      setSubmissionFeedback(null);
      setLastExecutedCode(null);
      setLastExecutedLang(null);
      setLastExecutedTaskId(null);
    }
  };

  const difficultyColors = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Hard: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const effectiveTestCases = (Array.isArray(task?.testCases) && task.testCases.length > 0)
    ? task.testCases
    : [{
        input: task?.sampleInput || '',
        expectedOutput: task?.sampleOutput || task?.expectedOutput || '',
        isHidden: false
      }];

  const modalJSX = (
    <div
      className="fixed inset-0 w-screen h-[100dvh] z-[99999] bg-black/60 backdrop-blur-[5px] flex items-center justify-center p-2 sm:p-4"
      style={{
        position: 'fixed',
        inset: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        backgroundColor: 'rgba(0, 0, 0, 0.60)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 99999
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting && !isRunning) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[94vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ── HEADER BAR ── */}
        <div className="px-5 py-3.5 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8B2BE2] to-[#E02B91] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              Q{task.order}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {moduleTitle}
                </span>
                <span className={`px-2 py-0.2 rounded border text-[10px] font-bold ${difficultyColors[task.difficulty] || difficultyColors.Easy}`}>
                  {task.difficulty || 'Easy'}
                </span>
                <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-mono font-bold text-xs flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {task.points} pts
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black truncate text-slate-900 mt-0.5">
                {task.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {totalTasks > 1 && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={onPrevTask}
                  disabled={!hasPrevTask}
                  className="p-1 rounded-lg hover:bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Previous Question"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono font-bold px-1.5 text-slate-700 select-none">
                  {(currentIndex !== undefined && currentIndex >= 0) ? currentIndex + 1 : (task.order || 1)} / {totalTasks}
                </span>
                <button
                  type="button"
                  onClick={onNextTask}
                  disabled={!hasNextTask}
                  className="p-1 rounded-lg hover:bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Next Question"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {isCompleted && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Completed</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer border border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── WORKSPACE BODY: 2-COLUMN ON DESKTOP ── */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT COLUMN: Problem Details & Test Case Specs */}
          <div className="lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 overflow-hidden bg-slate-50/50">
            
            {/* Tab navigation on mobile/left pane */}
            <div className="flex items-center border-b border-slate-200 bg-white px-4">
              <button
                onClick={() => setActiveTab('problem')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'problem'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Problem Description</span>
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'results'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Execution Results</span>
                {runResults && (
                  <span className={`w-2 h-2 rounded-full ${runResults.allPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeTab === 'problem' ? (
                <>
                  {/* Problem Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Problem Statement
                    </h3>
                    <p className="text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                      {task.problemStatement || task.description}
                    </p>
                  </div>

                  {/* Input Format */}
                  {task.inputFormat && (
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Input Format
                      </h4>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono">
                        {task.inputFormat}
                      </div>
                    </div>
                  )}

                  {/* Output Format */}
                  {task.outputFormat && (
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Output Format
                      </h4>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono">
                        {task.outputFormat}
                      </div>
                    </div>
                  )}

                  {/* Constraints */}
                  {task.constraints && (
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Constraints
                      </h4>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono">
                        {task.constraints}
                      </div>
                    </div>
                  )}

                  {/* Examples / Sample Input & Output */}
                  {(() => {
                    const firstTc = Array.isArray(task.testCases) && task.testCases.length > 0 ? task.testCases[0] : null;
                    const secondTc = Array.isArray(task.testCases) && task.testCases.length > 1 ? task.testCases[1] : null;

                    const sampleInput1 = task.sampleInput || firstTc?.input || 'None';
                    const sampleOutput1 = task.sampleOutput || firstTc?.expectedOutput || task.expectedOutput || 'Output verified via test cases';

                    const sampleInput2 = task.sampleInput2 || secondTc?.input || 'None';
                    const sampleOutput2 = task.sampleOutput2 || secondTc?.expectedOutput || task.expectedOutput || 'Output verified via test cases';

                    const explanation1 = task.explanation || firstTc?.explanation || 'Sample execution test case 1.';
                    const explanation2 = secondTc?.explanation || 'Secondary execution branch verification.';

                    return (
                      <div className="space-y-3 pt-2">
                        {/* Example 1 */}
                        <div className="p-3.5 bg-purple-50/50 border border-purple-200/80 rounded-xl space-y-2">
                          <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">
                            Example 1
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Input:</span>
                              <pre className="p-2.5 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto whitespace-pre-wrap border border-slate-800">
                                {sampleInput1}
                              </pre>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Output:</span>
                              <pre className="p-2.5 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto whitespace-pre-wrap border border-slate-800">
                                {sampleOutput1}
                              </pre>
                            </div>
                          </div>
                          {explanation1 && (
                            <p className="text-[11px] text-slate-600 font-sans pt-1">
                              <strong>Explanation: </strong>{explanation1}
                            </p>
                          )}
                        </div>

                        {/* Example 2 */}
                        <div className="p-3.5 bg-purple-50/50 border border-purple-200/80 rounded-xl space-y-2">
                          <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">
                            Example 2
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Input:</span>
                              <pre className="p-2.5 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto whitespace-pre-wrap border border-slate-800">
                                {sampleInput2}
                              </pre>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Output:</span>
                              <pre className="p-2.5 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto whitespace-pre-wrap border border-slate-800">
                                {sampleOutput2}
                              </pre>
                            </div>
                          </div>
                          {explanation2 && (
                            <p className="text-[11px] text-slate-600 font-sans pt-1">
                              <strong>Explanation: </strong>{explanation2}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}


                  {/* Test Cases Count Info */}
                  <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900 font-medium">
                    <span>Configured Test Cases: <strong>{task.testCases?.length || 2} Cases</strong></span>
                    <span className="font-mono">Time Limit: {task.timeLimit || 2000}ms</span>
                  </div>
                </>
              ) : (
                /* RESULTS TAB */
                <div className="space-y-4">
                  {submissionFeedback && (
                    <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 ${
                      submissionFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        {submissionFeedback.type === 'success' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                        <span className="leading-relaxed">{submissionFeedback.message}</span>
                      </div>

                      {submissionFeedback.type === 'success' && hasNextTask && onNextTask && (
                        <button
                          type="button"
                          onClick={() => {
                            if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
                            onNextTask();
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shrink-0 flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          <span>Next Question</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {!runResults ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-semibold space-y-2">
                      <Terminal className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>Click "Run Code" to evaluate your solution against test cases.</p>
                      <p className="text-[11px] text-amber-600 font-medium">Note: You must run your code and pass all tests before submitting.</p>
                    </div>
                  ) : runResults.compilationError ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-wider">
                        <XCircle className="w-4 h-4" />
                        <span>Compilation / Runtime Error</span>
                      </div>
                      <pre className="p-4 bg-slate-900 text-rose-300 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-rose-900/50">
                        {runResults.compilationError}
                      </pre>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            runResults.allPassed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {runResults.allPassed ? '✓ All Tests Passed' : '✗ Tests Failed'}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            Passed: {runResults.passedTests} / {runResults.totalTests}
                          </span>
                        </div>
                        {runResults.executionTimeMs !== undefined && (
                          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {runResults.executionTimeMs}ms
                          </span>
                        )}
                      </div>

                      {/* Test Case Selection Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(runResults.testResults || []).map((tr, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTestCaseIdx(idx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer ${
                              selectedTestCaseIdx === idx
                                ? 'bg-slate-900 text-white shadow-xs'
                                : tr.passed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            <span>Case {idx + 1}</span>
                            {tr.passed ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-rose-500" />}
                          </button>
                        ))}
                      </div>

                      {/* Selected Test Case Details */}
                      {runResults.testResults && runResults.testResults[selectedTestCaseIdx] && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Input:</span>
                            <pre className="p-2.5 bg-slate-50 text-slate-800 rounded-lg text-xs font-mono whitespace-pre-wrap border border-slate-200">
                              {runResults.testResults[selectedTestCaseIdx].input || '(No input)'}
                            </pre>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expected Output:</span>
                            <pre className="p-2.5 bg-emerald-50/60 text-emerald-800 rounded-lg text-xs font-mono whitespace-pre-wrap border border-emerald-200">
                              {runResults.testResults[selectedTestCaseIdx].expected}
                            </pre>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Output:</span>
                            <pre className={`p-2.5 rounded-lg text-xs font-mono whitespace-pre-wrap border ${
                              runResults.testResults[selectedTestCaseIdx].passed
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                : 'bg-rose-50 text-rose-900 border-rose-200'
                            }`}>
                              {runResults.testResults[selectedTestCaseIdx].actual || '(Empty output)'}
                            </pre>
                          </div>

                          {runResults.testResults[selectedTestCaseIdx].error && (
                            <div className="space-y-1 pt-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Error Details:</span>
                              <pre className="p-2.5 bg-rose-50 text-rose-800 rounded-lg text-xs font-mono whitespace-pre-wrap border border-rose-200">
                                {runResults.testResults[selectedTestCaseIdx].error}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Code Editor */}
          <div className="lg:w-1/2 flex flex-col h-full bg-white overflow-hidden">
            <InterviewCodeEditor
              code={code}
              onChange={handleCodeChange}
              onReset={handleReset}
              onRun={handleRun}
              onSubmit={handleSubmit}
              language={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              canSubmit={canSubmit}
              runResult={
                runResults
                  ? {
                      ...runResults,
                      allPassed: hasRunCurrentCode
                    }
                  : null
              }
              testCases={effectiveTestCases}
              readOnly={isLocked}
              availableLanguages={availableLanguages}
              onNext={onNextTask}
              hasNext={hasNextTask}
            />
          </div>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalJSX, document.body)
    : modalJSX;
}
