import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  Terminal,
  Zap
} from 'lucide-react';
import interviewApi from '../../api/interviewApi';
import InterviewCodeEditor, { MINIMAL_TEMPLATES } from '../../components/interview-game/InterviewCodeEditor';
import SubmissionResultModal from '../../components/interview-game/SubmissionResultModal';
import QuestionDescriptionViewer from '../../components/interview-game/QuestionDescriptionViewer';
import ConfirmNotificationModal from '../../components/common/ConfirmNotificationModal';
import {
  getDomainCompilerConfig,
  getDomainStarterCode
} from '../../utils/studentLanguages';

function getQuestionLanguage(q) {
  if (!q) return 'java';
  if (q.programmingLanguage) {
    const l = q.programmingLanguage.toLowerCase();
    if (['java', 'python', 'javascript', 'cpp'].includes(l)) return l;
  }
  if (q.language) {
    const l = q.language.toLowerCase();
    if (['java', 'python', 'javascript', 'cpp'].includes(l)) return l;
  }

  const dom = (q.domain || '').toLowerCase();
  if (dom.includes('java') && !dom.includes('script')) return 'java';
  if (dom.includes('python')) return 'python';
  if (dom.includes('javascript') || dom.includes('js') || dom.includes('web') || dom.includes('react')) return 'javascript';
  if (dom.includes('cpp') || dom.includes('c++')) return 'cpp';

  const cat = (q.category || '').toLowerCase();
  if (cat.includes('java') && !cat.includes('script')) return 'java';
  if (cat.includes('python')) return 'python';
  if (cat.includes('javascript') || cat.includes('js')) return 'javascript';
  if (cat.includes('cpp') || cat.includes('c++')) return 'cpp';

  if (Array.isArray(q.tags)) {
    const tagsStr = q.tags.join(' ').toLowerCase();
    if (tagsStr.includes('java') && !tagsStr.includes('script')) return 'java';
    if (tagsStr.includes('python')) return 'python';
    if (tagsStr.includes('javascript') || tagsStr.includes('js')) return 'javascript';
    if (tagsStr.includes('cpp') || tagsStr.includes('c++')) return 'cpp';
  }

  const title = (q.title || '').toLowerCase();
  if (title.includes('java') && !title.includes('script')) return 'java';
  if (title.includes('python')) return 'python';
  if (title.includes('javascript') || title.includes('js')) return 'javascript';
  if (title.includes('cpp') || title.includes('c++')) return 'cpp';

  return 'java';
}

export default function QuestionWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationError, setNotificationError] = useState(null);

  // Allowed languages dynamically fetched for logged in student
  const [availableLanguages, setAvailableLanguages] = useState(['java', 'python', 'javascript', 'cpp']);
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState(MINIMAL_TEMPLATES['java']);

  // Runner & Submit states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    loadQuestion();
  }, [id]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      setRunResult(null);
      setCanSubmit(false);
      setCustomInput('');

      const res = await interviewApi.getQuestionById(id);
      if (res.data?.success) {
        const q = res.data.data;
        setQuestion(q);

        const domainCfg = getDomainCompilerConfig(q.domain || q.category || q.programmingLanguage);
        const allowed = (q.allowedLanguages && q.allowedLanguages.length > 0)
          ? q.allowedLanguages
          : domainCfg.allowedLanguages;
        const targetLang = (q.defaultLanguage && allowed.includes(q.defaultLanguage))
          ? q.defaultLanguage
          : (allowed.includes(domainCfg.defaultLanguage) ? domainCfg.defaultLanguage : allowed[0]);

        setAvailableLanguages(allowed);
        setLanguage(targetLang);

        const initialCode = q.submittedCode ||
          (q.starterCode && q.starterCode[targetLang]) ||
          getDomainStarterCode(q.domain, targetLang, q.title);
        setCode(initialCode);
      }
    } catch (err) {
      console.error('Failed to load question:', err);
      setError('Could not load question details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setCanSubmit(false);
    setRunResult(null);
  };

  const handleLanguageChange = (newLang) => {
    if (!availableLanguages.includes(newLang)) return;
    setLanguage(newLang);
    setCanSubmit(false);
    setRunResult(null);

    const starter = (question?.starterCode && question.starterCode[newLang]) ||
      getDomainStarterCode(question?.domain, newLang, question?.title);
    setCode(starter);
  };

  const handleRun = async () => {
    if (!question) return;
    try {
      setIsRunning(true);
      setRunResult(null);
      setCanSubmit(false);

      const res = await interviewApi.runCode({
        questionId: question._id,
        code,
        language
      });

      if (res.data?.success) {
        const resultData = res.data.data;
        setRunResult(resultData);

        // Enable Submit ONLY if all required test cases passed!
        if (resultData && resultData.allPassed === true) {
          setCanSubmit(true);
        } else {
          setCanSubmit(false);
        }
      }
    } catch (err) {
      console.error('Error running code:', err);
      setCanSubmit(false);
      setRunResult({
        status: 'RUNTIME_ERROR',
        allPassed: false,
        passedTests: 0,
        totalTests: question.testCases?.length || 1,
        error: err.response?.data?.message || err.message || 'Execution error',
        testResults: [
          {
            caseNumber: 1,
            passed: false,
            error: err.response?.data?.message || err.message || 'Execution error'
          }
        ]
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCustom = async () => {
    if (!question || !customInput.trim()) return;
    try {
      setIsRunning(true);
      setRunResult(null);

      const res = await interviewApi.runCode({
        questionId: question._id,
        code,
        language,
        customInput: customInput.trim()
      });

      if (res.data?.success) {
        setRunResult(res.data.data);
      }
    } catch (err) {
      console.error('Error running custom input:', err);
      setRunResult({
        status: 'RUNTIME_ERROR',
        allPassed: false,
        passedTests: 0,
        totalTests: 1,
        error: err.response?.data?.message || err.message || 'Custom execution error',
        testResults: [
          {
            caseNumber: 1,
            passed: false,
            error: err.response?.data?.message || err.message || 'Custom execution error'
          }
        ]
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!question || isSubmitting || isSubmittingRef.current || !code || !code.trim()) return;
    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      const res = await interviewApi.submitSolution({
        questionId: question._id,
        code,
        language
      });

      if (res.data?.success) {
        const subData = res.data.data;
        setSubmissionResult(subData);
        setSubmissionModalOpen(true);
        setRunResult({
          allPassed: subData.allPassed,
          passedTests: subData.passedTests,
          totalTests: subData.totalTests,
          executionTimeMs: subData.executionTimeMs,
          testResults: subData.testResults
        });

        if (subData.allPassed) {
          setQuestion((prev) => ({ ...prev, isSolved: true }));
        }
      }
    } catch (err) {
      console.error('Submission failed:', err);
      const isAuthErr = err.response?.status === 401 ||
        (err.response?.data?.message || '').toLowerCase().includes('token') ||
        (err.response?.data?.message || '').toLowerCase().includes('auth') ||
        (err.response?.data?.message || '').toLowerCase().includes('login');

      if (isAuthErr) {
        setAuthModalOpen(true);
      } else {
        setNotificationError(err.response?.data?.message || 'Submission failed. Check network or server.');
      }
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-semibold">Loading programming task environment...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center max-w-md p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">{error || 'Question not found'}</h2>
          <button
            onClick={() => navigate('/student')}
            className="px-4 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-purple-500/20"
          >
            Back to Student Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full max-h-full flex flex-col bg-[#F8FAFC] text-slate-900 overflow-hidden relative">
      
      {/* ── TOP NAVBAR: Dashboard back button + Title + Status ── */}
      <header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 text-xs shadow-sm z-10 h-12">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => navigate('/interview-game')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-500/20 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Interview Arena</span>
          </button>

          {/* Back & Next Question Navigation Buttons */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => navigate(`/interview-game/question/${Number(question.questionNumber) - 1}`)}
              disabled={question.questionNumber <= 1}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 font-bold transition flex items-center justify-center cursor-pointer shadow-2xs"
              title="Previous Question"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/interview-game/question/${Number(question.questionNumber) + 1}`)}
              disabled={question.questionNumber >= 100}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 font-bold transition flex items-center justify-center cursor-pointer shadow-2xs"
              title="Next Question"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2 min-w-0">
            <span className="font-mono font-bold text-purple-700 text-xs shrink-0">
              Q{question.questionNumber}
            </span>
            <h1 className="font-black text-slate-900 truncate text-xs sm:text-sm">
              {question.title}
            </h1>
            {question.isSolved && (
              <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Completed</span>
              </span>
            )}
          </div>
        </div>

        {/* Difficulty & Next/Prev */}
        <div className="flex items-center space-x-3 shrink-0">
          <span
            className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] border ${
              question.difficulty === 'Easy'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : question.difficulty === 'Medium'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {question.difficulty}
          </span>

          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[10px] font-bold">
            +{question.xp || 10} XP
          </span>

          <div className="flex items-center space-x-1 border-l border-slate-200 pl-3">
            <button
              onClick={() => navigate(`/interview-game/question/${Number(question.questionNumber) - 1}`)}
              disabled={question.questionNumber <= 1}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Question"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/interview-game/question/${Number(question.questionNumber) + 1}`)}
              disabled={question.questionNumber >= 100}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Next Question"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE SPLIT GRID ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden h-[calc(100%-3rem)]">
        
        {/* LEFT COLUMN: Problem Description & Execution Feedback */}
        <div className="lg:col-span-5 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
          
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-600">
            <FileCode className="w-4 h-4 text-purple-600" />
            <span>Problem Description</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin space-y-4">
            <QuestionDescriptionViewer question={question} />

            {/* Execution Result Feedback Card */}
            {runResult && (
              <div className="space-y-2.5 pt-2 border-t border-slate-200">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Execution Result</span>
                </h3>

                {runResult.allPassed ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold space-y-1">
                    <div className="flex items-center gap-2 font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>✓ All test cases passed! You can now submit your solution.</span>
                    </div>
                    <p className="text-[11px] text-emerald-600 pl-6 font-mono">
                      Passed {runResult.passedTests} / {runResult.totalTests} tests in {runResult.executionTimeMs || 0}ms.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-semibold space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-rose-700">
                      <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>⚠️ Some test cases failed. Fix your code and run again.</span>
                    </div>
                    {runResult.compilationError ? (
                      <pre className="p-2.5 bg-slate-900 text-rose-300 rounded-lg text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                        {runResult.compilationError}
                      </pre>
                    ) : (
                      <p className="text-[11px] text-rose-600 pl-6 font-mono">
                        Passed {runResult.passedTests || 0} / {runResult.totalTests || 1} tests.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden p-3 bg-[#F8FAFC]">
          <InterviewCodeEditor
            code={code}
            onChange={handleCodeChange}
            language={language}
            onLanguageChange={handleLanguageChange}
            onRun={handleRun}
            onSubmit={handleSubmit}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            availableLanguages={availableLanguages}
            testCases={question.testCases || []}
            runResult={runResult}
            customInput={customInput}
            onCustomInputChange={setCustomInput}
            onRunCustom={handleRunCustom}
          />
        </div>

      </div>

      {/* Submission Result Celebration Modal */}
      <SubmissionResultModal
        isOpen={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
        result={submissionResult}
        hasNextQuestion={Boolean(submissionResult?.nextQuestion && !submissionResult?.isTrackCompleted)}
        onNextQuestion={(nextQ) => {
          setSubmissionModalOpen(false);
          const target = nextQ?._id || nextQ?.questionNumber;
          if (target) {
            navigate(`/interview-game/question/${target}`);
          }
        }}
      />

      {/* Error Notification Modal */}
      <ConfirmNotificationModal
        isOpen={!!notificationError}
        title="Submission Error"
        message={notificationError || ''}
        confirmText="OK"
        showCancel={false}
        type="danger"
        onConfirm={() => setNotificationError(null)}
      />

      {/* Login Required Modal */}
      <ConfirmNotificationModal
        isOpen={authModalOpen}
        title="Login Required"
        message="You must be logged in to submit your solution, record your progress, and earn XP. Please login to save your solution."
        confirmText="Login Now"
        cancelText="Cancel"
        showCancel={true}
        type="info"
        onConfirm={() => {
          setAuthModalOpen(false);
          navigate('/login');
        }}
        onCancel={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
