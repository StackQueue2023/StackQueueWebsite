import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Timer,
  Play,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../../api/client';
import interviewApi from '../../api/interviewApi';
import InterviewTimer from '../../components/interview-game/InterviewTimer';
import InterviewCodeEditor from '../../components/interview-game/InterviewCodeEditor';
import TestCasePanel from '../../components/interview-game/TestCasePanel';
import QuestionDescriptionViewer from '../../components/interview-game/QuestionDescriptionViewer';
import ConfirmNotificationModal from '../../components/common/ConfirmNotificationModal';
import { useAuth } from '../../context/AuthContext';
import {
  getStudentAllowedLanguages,
  getDomainCompilerConfig,
  getDomainStarterCode,
  MINIMAL_TEMPLATES
} from '../../utils/studentLanguages';

const MOCK_DOMAINS = [
  { key: 'java', title: 'Java', icon: '☕', desc: 'Core Java, OOPs, Collections & Algorithms', count: '104 Qs' },
  { key: 'python', title: 'Python', icon: '🐍', desc: 'Pythonic Logic, Lists, Dicts & Scripts', count: '102 Qs' },
  { key: 'cpp', title: 'C++', icon: '⚡', desc: 'Pointers, References, Memory & Logic', count: '102 Qs' },
  { key: 'dsa', title: 'Data Structures', icon: '🧠', desc: 'Arrays, Trees, Graphs, DP & Stacks', count: '100 Qs' },
  { key: 'javascript', title: 'Web Development', icon: '🌐', desc: 'JavaScript Engine, Async, ES6+ & DOM', count: '102 Qs' },
  { key: 'fullstack', title: 'Java Full Stack', icon: '🚀', desc: 'Full Stack Architecture & Microservices', count: '0 Qs' },
  { key: 'sql', title: 'SQL', icon: '🗄️', desc: 'Database Queries, Joins & Schema Design', count: '0 Qs' },
  { key: 'cybersecurity', title: 'Cyber Security', icon: '🛡️', desc: 'Network Security, Auth & Vulnerabilities', count: '0 Qs' }
];

export default function InterviewModePage() {
  const navigate = useNavigate();
  const { user, quickDemoSwitch } = useAuth();

  // Modal notification states
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [notificationError, setNotificationError] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Setup options
  const [inSession, setInSession] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('java');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState(30); // minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic student allowed languages & active compiler state
  const [availableLanguages, setAvailableLanguages] = useState(['java']);
  const [activeCompilerLang, setActiveCompilerLang] = useState(null);
  const [dynamicMockDomains, setDynamicMockDomains] = useState(MOCK_DOMAINS);

  const getDomainIcon = (domKey = '') => {
    const k = domKey.toLowerCase();
    if (k.includes('java') && !k.includes('javascript')) return '☕';
    if (k.includes('python')) return '🐍';
    if (k.includes('cpp') || k.includes('c++') || k === 'c') return '⚡';
    if (k.includes('react') || k.includes('web') || k.includes('javascript')) return '🌐';
    if (k.includes('data') || k.includes('analytics')) return '📊';
    if (k.includes('cloud') || k.includes('aws') || k.includes('azure')) return '☁️';
    if (k.includes('cyber') || k.includes('security')) return '🛡️';
    if (k.includes('ai') || k.includes('intelligence') || k.includes('learning')) return '🤖';
    return '🎓';
  };

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await interviewApi.getDomains();
        if (res.data?.success && Array.isArray(res.data.domains)) {
          const map = new Map();
          res.data.domains.forEach(d => {
            const rawKey = d.key || d.title || '';
            const normKey = rawKey.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
            if (!normKey) return;

            const mCount = d.mockQuestionsCount || 0;
            if (!map.has(normKey)) {
              map.set(normKey, {
                key: normKey,
                title: d.label || d.title || normKey.toUpperCase(),
                icon: getDomainIcon(normKey),
                desc: d.category ? `${d.category} Interview Track` : `Syllabus track for ${d.label || normKey}`,
                count: `${mCount} Qs`,
                mockQuestionsCount: mCount
              });
            } else {
              const existing = map.get(normKey);
              existing.mockQuestionsCount += mCount;
              existing.count = `${existing.mockQuestionsCount} Qs`;
              if (d.label && (!existing.title || d.label.length > existing.title.length)) {
                existing.title = d.label;
              }
            }
          });
          const loaded = Array.from(map.values());
          setDynamicMockDomains(loaded);
          const studentDom = res.data.studentDomain ? res.data.studentDomain.toLowerCase().replace(/[^a-z0-9]/g, '') : null;
          if (studentDom) {
            setSelectedDomain(studentDom);
          } else if (loaded.length > 0) {
            const withMock = loaded.find(l => l.mockQuestionsCount > 0);
            setSelectedDomain(withMock ? withMock.key : loaded[0].key);
          }
        }
      } catch (e) {
        console.error('Failed to load mock domains:', e);
      }
    };
    fetchDomains();
  }, []);

  // Active Session State
  const [sessionData, setSessionData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: { code, language, isSolved } }
  const [runResults, setRunResults] = useState({}); // { [qId]: result }
  const [isRunning, setIsRunning] = useState(false);

  // Finished Session Report
  const [isFinished, setIsFinished] = useState(false);
  const [reportData, setReportData] = useState(null);

  // When domain changes, configure compiler options and reset session
  const handleDomainChange = (newDomain) => {
    setSelectedDomain(newDomain);
    const domainCfg = getDomainCompilerConfig(newDomain);
    setAvailableLanguages(domainCfg.allowedLanguages);
    setActiveCompilerLang(domainCfg.defaultLanguage);
    setError(null);
    setSessionData(null);
    setAnswers({});
    setRunResults({});
  };

  const handleSelectQuestion = (newIdx) => {
    const targetQ = sessionData?.questions?.[newIdx];
    if (targetQ && activeCompilerLang) {
      const qAllowed = targetQ.allowedLanguages || availableLanguages;
      if (qAllowed.includes(activeCompilerLang)) {
        setAnswers(prev => {
          const currentAns = prev[targetQ._id];
          if (currentAns && currentAns.language !== activeCompilerLang) {
            const starter = (targetQ.starterCode && targetQ.starterCode[activeCompilerLang])
              ? targetQ.starterCode[activeCompilerLang]
              : getDomainStarterCode(selectedDomain, activeCompilerLang, targetQ.title);
            return {
              ...prev,
              [targetQ._id]: {
                ...currentAns,
                language: activeCompilerLang,
                code: (currentAns.code && currentAns.code !== MINIMAL_TEMPLATES[currentAns.language])
                  ? currentAns.code
                  : starter
              }
            };
          }
          return prev;
        });
      }
    }
    setCurrentIdx(newIdx);
  };

  const startSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // If user is not authenticated, seamlessly switch to student01 so XP & progress are recorded
      if (!user) {
        try {
          await quickDemoSwitch('student');
        } catch (authErr) {
          console.warn('Auto demo switch warning:', authErr);
        }
      }

      const res = await interviewApi.startMockInterview({
        domain: selectedDomain,
        difficulty,
        duration
      });

      if (res.data?.success) {
        // If domain has 0 questions, display required message
        if (!res.data.data?.questions || res.data.data.questions.length === 0 || res.data.count === 0) {
          setError(res.data.message || 'No questions available for this domain');
          setSessionData(null);
          return;
        }

        const data = res.data.data;
        setSessionData(data);

        const domainCfg = getDomainCompilerConfig(selectedDomain);
        const allowedLangs = data.domainConfig?.allowedLanguages || domainCfg.allowedLanguages || ['java'];
        const defLang = activeCompilerLang && allowedLangs.includes(activeCompilerLang)
          ? activeCompilerLang
          : (data.domainConfig?.defaultLanguage || domainCfg.defaultLanguage || allowedLangs[0]);

        setAvailableLanguages(allowedLangs);
        setActiveCompilerLang(defLang);

        // Prepopulate answers with domain-appropriate minimal starter code
        const initialAnswers = {};
        data.questions.forEach((q) => {
          const qLangs = q.allowedLanguages || allowedLangs;
          const qLang = (activeCompilerLang && qLangs.includes(activeCompilerLang))
            ? activeCompilerLang
            : (qLangs.includes(defLang) ? defLang : qLangs[0]);

          const questionStarter = (q.starterCode && q.starterCode[qLang])
            ? q.starterCode[qLang]
            : getDomainStarterCode(selectedDomain, qLang, q.title);

          initialAnswers[q._id] = {
            code: questionStarter,
            language: qLang,
            isSolved: false
          };
        });
        setAnswers(initialAnswers);
        setInSession(true);
        setCurrentIdx(0);
      }
    } catch (err) {
      console.error('Failed to start mock interview:', err);
      setError(err.response?.data?.message || err.message || 'Could not start mock interview session. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = sessionData?.questions?.[currentIdx];
  const currentAnswer = currentQuestion ? answers[currentQuestion._id] : null;

  const handleCodeChange = (newCode) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: {
        ...prev[currentQuestion._id],
        code: newCode
      }
    }));
  };

  const handleLanguageChange = (newLang) => {
    if (!currentQuestion) return;
    const qLangs = currentQuestion.allowedLanguages || availableLanguages;
    if (!qLangs.includes(newLang)) return;

    setActiveCompilerLang(newLang);

    const starter = (currentQuestion.starterCode && currentQuestion.starterCode[newLang])
      ? currentQuestion.starterCode[newLang]
      : getDomainStarterCode(selectedDomain, newLang, currentQuestion.title);

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: {
        ...prev[currentQuestion._id],
        language: newLang,
        code: starter
      }
    }));
  };

  const handleRun = async () => {
    if (!currentQuestion || !currentAnswer) return;
    try {
      setIsRunning(true);
      const res = await interviewApi.runCode({
        questionId: currentQuestion._id,
        code: currentAnswer.code,
        language: currentAnswer.language
      });

      if (res.data?.success) {
        const resData = res.data.data;
        setRunResults((prev) => ({ ...prev, [currentQuestion._id]: resData }));
        if (resData.allPassed) {
          setAnswers((prev) => ({
            ...prev,
            [currentQuestion._id]: {
              ...prev[currentQuestion._id],
              isSolved: true
            }
          }));
        }
      }
    } catch (err) {
      console.error('Run failed in mock interview:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const finishSession = () => {
    if (!sessionData) return;
    setEndModalOpen(true);
  };

  const submitFinal = async () => {
    try {
      setLoading(true);
      const submissionsPayload = sessionData.questions.map((q) => {
        const ans = answers[q._id];
        return {
          questionId: q._id,
          code: ans?.code || '',
          language: ans?.language || 'javascript'
        };
      });

      const res = await interviewApi.submitMockInterview({
        sessionId: sessionData.sessionId,
        submissions: submissionsPayload
      });

      if (res.data?.success) {
        setReportData(res.data.data);
        setIsFinished(true);
        setInSession(false);
      }
    } catch (err) {
      console.error('Submit mock interview failed:', err);
      const isAuthErr = err.response?.status === 401 ||
        (err.response?.data?.message || '').toLowerCase().includes('token') ||
        (err.response?.data?.message || '').toLowerCase().includes('auth') ||
        (err.response?.data?.message || '').toLowerCase().includes('login');

      if (isAuthErr) {
        setAuthModalOpen(true);
      } else {
        setNotificationError('Could not submit interview session.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 1. SETUP VIEW (Before starting)
  // 1. SETUP VIEW (Before interview begins)
  if (!inSession && !isFinished) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-6 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/interview-game')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-500/20 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Interview Arena</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-purple-700 text-xs font-semibold">
                <Timer className="w-3.5 h-3.5" />
                <span>Real-Time Mock Interview Simulation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Mock Technical Interview
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Test your coding speed, accuracy, and algorithmic problem-solving under real interview conditions. You will face 5 curated questions with an active countdown timer.
              </p>
            </div>
          </div>

          {/* Configuration Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Interview Configuration</h3>

            {/* Domain Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Select Domain / Course:</label>
                <span className="text-[11px] text-purple-600 font-bold hidden sm:inline">
                  Questions will belong exclusively to this domain
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {dynamicMockDomains.map((dom) => {
                  const isSelected = selectedDomain === dom.key;
                  return (
                    <button
                      key={dom.key}
                      type="button"
                      onClick={() => handleDomainChange(dom.key)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] text-white border-purple-600 shadow-md ring-2 ring-purple-500/30'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-purple-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xl">{dom.icon}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {dom.count}
                        </span>
                      </div>
                      <div className="font-bold text-xs">{dom.title}</div>
                      <div className={`text-[10px] leading-tight line-clamp-1 mt-0.5 ${
                        isSelected ? 'text-white/80' : 'text-slate-500'
                      }`}>
                        {dom.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Target Difficulty:</label>
              <div className="grid grid-cols-3 gap-3">
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      difficulty === d
                        ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Interview Duration:</label>
              <div className="grid grid-cols-3 gap-3">
                {[15, 30, 45].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDuration(m)}
                    className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      duration === m
                        ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m} Minutes
                  </button>
                ))}
              </div>
            </div>

            {/* Rules Checklist */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="text-slate-800 font-semibold">Rules & Information:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>5 coding questions randomly selected to match your chosen difficulty.</li>
                <li>Questions belong exclusively to your chosen domain track.</li>
                <li>You can switch between questions freely at any point.</li>
                <li>Visible test cases are available to run and debug.</li>
                <li>Timer runs continuously; interview submits automatically at 00:00.</li>
              </ul>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={startSession}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold text-sm rounded-xl shadow-md shadow-purple-500/20 transition transform active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>Begin Mock Interview</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. REPORT VIEW (After completion)
  if (isFinished && reportData) {
    return (
      <div className="h-full overflow-y-auto bg-[#F8FAFC]">
        {/* Top Header Navigation Bar */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => navigate('/interview-game')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Interview Arena</span>
            </button>
            <button
              onClick={() => navigate('/student')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-500/20 cursor-pointer"
            >
              <span>Dashboard</span>
            </button>
          </div>
          <button
            onClick={() => {
              setIsFinished(false);
              setInSession(false);
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            Take Another Interview
          </button>
        </div>

        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-fade-in pb-16">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 mx-auto animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Interview Performance Summary</h1>
            <p className="text-xs text-slate-500">
              Factual evaluation of your mock interview session
            </p>
          </div>

          {/* Score Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
              <div className="text-2xl font-black text-slate-900 font-mono">
                {reportData.score} / 100
              </div>
              <div className="text-xs text-slate-500 mt-1">Total Score</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
              <div className="text-2xl font-black text-emerald-600 font-mono">
                {reportData.passedCount} / {reportData.totalQuestions}
              </div>
              <div className="text-xs text-slate-500 mt-1">Questions Solved</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
              <div className="text-2xl font-black text-amber-600 font-mono">
                {reportData.accuracy}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Accuracy</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
              <div className="text-2xl font-black text-purple-700 font-mono">
                {Math.round((reportData.timeSpentSeconds || 0) / 60)}m
              </div>
              <div className="text-xs text-slate-500 mt-1">Time Elapsed</div>
            </div>
          </div>

          {/* Question Results Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Question Breakdown</h3>
              <span className="text-xs font-semibold text-slate-500">
                Total Questions: {reportData.totalQuestions || reportData.results?.length || 0}
              </span>
            </div>

            <div className="space-y-3">
              {reportData.results?.map((res, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                >
                  <div className="flex items-center space-x-3">
                    {res.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <div>
                      <span className="font-bold text-slate-900 font-sans">
                        Q{res.questionNumber || i + 1}: {res.title}
                      </span>
                      <div className="text-[11px] text-slate-500">
                        Category: {res.category || 'Programming'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-slate-500">
                      Tests: {res.passedTests}/{res.totalTests}
                    </span>
                    <span
                      className={`font-bold font-sans px-2 py-0.5 rounded ${
                        res.passed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {res.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex justify-center space-x-4 pt-4">
            <button
              onClick={() => navigate('/student')}
              className="px-6 py-3 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-500/20 cursor-pointer flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => {
                setIsFinished(false);
                setInSession(false);
              }}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Take Another Interview
            </button>
            <button
              onClick={() => navigate('/interview-game')}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200 cursor-pointer"
            >
              Back to Interview Arena
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. LIVE INTERVIEW SESSION VIEW
  return (
    <div className="h-full max-h-full flex flex-col bg-[#F8FAFC] text-slate-900 overflow-hidden relative">
      {/* Top Session Header Bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 text-xs shadow-sm z-10 h-12">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            type="button"
            onClick={() => setExitModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-500/20 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Interview Arena</span>
          </button>

          {/* Back & Next Question Navigation Buttons */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => handleSelectQuestion(Math.max(0, currentIdx - 1))}
              title="Previous Question"
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 font-bold transition flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentIdx === (sessionData?.questions?.length || 1) - 1}
              onClick={() => handleSelectQuestion(Math.min((sessionData?.questions?.length || 1) - 1, currentIdx + 1))}
              title="Next Question"
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 font-bold transition flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="font-bold text-slate-900 flex items-center space-x-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>MOCK INTERVIEW ({difficulty})</span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md font-bold text-[11px] border border-purple-200">
              {dynamicMockDomains.find(d => d.key === selectedDomain)?.title || selectedDomain} Domain
            </span>
          </div>

          {/* Question Nav Pills */}
          <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-3 min-w-0 overflow-x-auto">
            {sessionData?.questions?.map((q, idx) => {
              const isQSolved = answers[q._id]?.isSolved;
              const isCurrent = currentIdx === idx;

              return (
                <button
                  key={q._id}
                  onClick={() => handleSelectQuestion(idx)}
                  className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] text-white shadow-xs'
                      : isQSolved
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4 shrink-0">
          <InterviewTimer
            initialSeconds={duration * 60}
            onTimeUp={submitFinal}
          />

          <button
            onClick={finishSession}
            disabled={loading}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition text-xs shadow-sm cursor-pointer"
          >
            End Interview
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden h-[calc(100%-3rem)]">
        {/* Left Column: Question Details */}
        <div className="lg:col-span-5 bg-white border-r border-slate-200 p-5 overflow-y-auto h-full scrollbar-thin space-y-4">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
            <span className="font-mono text-purple-700 font-bold">
              Question {currentIdx + 1} of {sessionData?.questions?.length}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] border border-slate-200 font-medium">
              {currentQuestion?.category || 'Mock Interview Track'}
            </span>
          </div>

          <QuestionDescriptionViewer question={currentQuestion} />
        </div>

        {/* Right Column: Code Editor & Output Tabbed Workspace OR Theory Architecture Workspace */}
        <div className="lg:col-span-7 flex flex-col h-full p-3 bg-[#F8FAFC] overflow-hidden">
          {(currentQuestion?.questionType === 'conceptual' || currentQuestion?.questionType === 'scenario') ? (
            <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-700 font-bold rounded-lg text-xs">
                    {currentQuestion?.questionType === 'scenario' ? 'Enterprise Scenario Assessment' : 'Conceptual & Architectural Analysis'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Domain: {currentQuestion?.domain}</span>
                </div>
                <span className="text-xs text-slate-500">
                  Words: {((currentAnswer?.code || '').trim().split(/\s+/).filter(Boolean).length)}
                </span>
              </div>

              {currentQuestion?.evaluationCriteria && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <div className="font-bold mb-1">Evaluation Focus:</div>
                  <div>{currentQuestion.evaluationCriteria}</div>
                </div>
              )}

              <div className="flex-1 flex flex-col space-y-2 min-h-[220px]">
                <label className="text-xs font-bold text-slate-700">Your Technical Response & Architectural Rationale:</label>
                <textarea
                  value={currentAnswer?.code || ''}
                  onChange={(e) => {
                    const text = e.target.value;
                    handleCodeChange(text);
                    setAnswers(prev => ({
                      ...prev,
                      [currentQuestion._id]: {
                        code: text,
                        answer: text,
                        language: 'theory',
                        isSolved: text.trim().split(/\s+/).filter(Boolean).length >= 10
                      }
                    }));
                  }}
                  placeholder="Detail your architecture, component interactions, trade-offs, and error-handling strategies here..."
                  className="flex-1 w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  {(currentAnswer?.code || '').length >= 30 ? '✅ Response draft saved' : '✍️ Write at least 10 words to answer'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (currentIdx < (sessionData?.questions?.length || 1) - 1) {
                      setCurrentIdx(prev => prev + 1);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-[#8B2BE2] to-[#B829B6] text-white font-bold text-xs rounded-xl shadow-xs transition hover:opacity-90"
                >
                  Save & Next Question →
                </button>
              </div>
            </div>
          ) : (
            <InterviewCodeEditor
              code={currentAnswer?.code || ''}
              onChange={handleCodeChange}
              language={currentAnswer?.language || availableLanguages[0] || 'java'}
              onLanguageChange={handleLanguageChange}
              onRun={handleRun}
              onSubmit={handleRun}
              isRunning={isRunning}
              isSubmitting={false}
              availableLanguages={availableLanguages}
              testCases={currentQuestion?.testCases || []}
              runResult={runResults[currentQuestion?._id]}
            />
          )}
        </div>
      </div>

      {/* Confirm Exit Modal */}
      <ConfirmNotificationModal
        isOpen={exitModalOpen}
        title="Exit Interview Session?"
        message="Are you sure you want to exit the mock interview session? Your current progress will be lost."
        confirmText="Exit Session"
        cancelText="Cancel"
        type="danger"
        onConfirm={() => {
          setExitModalOpen(false);
          navigate('/interview-game');
        }}
        onCancel={() => setExitModalOpen(false)}
      />

      {/* Confirm End Interview Modal */}
      <ConfirmNotificationModal
        isOpen={endModalOpen}
        title="Finish Mock Interview?"
        message="Are you sure you want to finish and submit your mock interview session now?"
        confirmText="Submit Interview"
        cancelText="Keep Working"
        type="warning"
        onConfirm={() => {
          setEndModalOpen(false);
          submitFinal();
        }}
        onCancel={() => setEndModalOpen(false)}
      />

      {/* Error Notification Modal */}
      <ConfirmNotificationModal
        isOpen={!!notificationError}
        title="Session Error"
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
        message="You must be logged in to submit your solution, record your progress, and earn XP. Please login to save your achievement."
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
