import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { triggerConfetti } from '../components/gamification/Confetti';
import CSSEnginePreview from './renderers/CSSEnginePreview';
import SQLResultsTable from './renderers/SQLResultsTable';
import DSAVisualizer from './renderers/DSAVisualizer';
import GitTerminalMission from './renderers/GitTerminalMission';
import CloudArchCanvas from './renderers/CloudArchCanvas';
import CodeEditor from './renderers/CodeEditor';
import {
  ArrowLeft,
  Clock,
  Zap,
  HelpCircle,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Star,
  Trophy,
  ArrowRight,
  EyeOff,
  Terminal
} from 'lucide-react';

export default function ChallengeEngine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Student inputs
  const [code, setCode] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [orderedBlocks, setOrderedBlocks] = useState([]);
  const [selectedConnections, setSelectedConnections] = useState([]);

  // Hints
  const [revealedHints, setRevealedHints] = useState([]);

  // Execution & Test Case State Machine
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [resultModal, setResultModal] = useState(null);
  const [sqlResults, setSqlResults] = useState(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState(120);

  // Fetch challenge details
  useEffect(() => {
    async function loadChallenge() {
      setLoading(true);
      setError('');
      setAllTestsPassed(false);
      setExecutionResult(null);
      try {
        const res = await api.get(`/challenges/${id}`);
        if (res.data.success) {
          const ch = res.data.data;
          setChallenge(ch);
          setCode(ch.starterCode || '');
          setTimeLeft(ch.timeLimitSeconds || 120);

          if (ch.codeBlocks && ch.codeBlocks.length > 0) {
            const shuffled = [...ch.codeBlocks].sort(() => Math.random() - 0.5);
            setOrderedBlocks(shuffled);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load challenge');
      } finally {
        setLoading(false);
      }
    }
    loadChallenge();
  }, [id]);

  // Countdown Timer
  useEffect(() => {
    if (!challenge || timeLeft <= 0 || resultModal) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [challenge, timeLeft, resultModal]);

  // Handle Code Change (resets allTestsPassed so Submit button disappears on code edit)
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (allTestsPassed) {
      setAllTestsPassed(false);
    }
  };

  const handleRevealHint = (hintIndex) => {
    if (!revealedHints.includes(hintIndex)) {
      setRevealedHints([...revealedHints, hintIndex]);
    }
  };

  const handleResetCode = () => {
    if (challenge) {
      setCode(challenge.starterCode || '');
      setAllTestsPassed(false);
      setExecutionResult(null);
    }
  };

  // 1. RUN Code & Test Cases
  const handleRun = async () => {
    if (!challenge || isRunning || isSubmitting) return;
    setIsRunning(true);
    setExecutionResult(null);

    try {
      const payload = {
        submittedCode: code,
        selectedOption,
        orderedBlocks: orderedBlocks.map(b => b.id),
        selectedConnections
      };

      const res = await api.post(`/challenges/${challenge._id}/run`, payload);
      if (res.data.success) {
        setExecutionResult(res.data);
        if (res.data.allTestsPassed) {
          setAllTestsPassed(true);
        } else {
          setAllTestsPassed(false);
        }

        if (challenge.type === 'sql_query' && res.data.details) {
          setSqlResults(res.data.details);
        }
      }
    } catch (err) {
      setExecutionResult({
        allTestsPassed: false,
        compilationError: err.response?.data?.message || 'Execution error encountered.',
        testCaseResults: []
      });
      setAllTestsPassed(false);
    } finally {
      setIsRunning(false);
    }
  };

  // 2. SUBMIT Challenge Solution (Server-Side Re-validation)
  const handleSubmit = async () => {
    if (!challenge || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload = {
        submittedCode: code,
        selectedOption,
        orderedBlocks: orderedBlocks.map(b => b.id),
        selectedConnections,
        hintsUsed: revealedHints.length
      };

      const res = await api.post(`/challenges/${challenge._id}/submit`, payload);
      if (res.data.success && res.data.passed) {
        setResultModal(res.data);
        triggerConfetti();
        await refreshProfile();
      } else {
        setAllTestsPassed(false);
        alert(res.data.message || 'Submission validation failed.');
      }
    } catch (err) {
      setAllTestsPassed(false);
      alert(err.response?.data?.message || 'Submission validation error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-mono text-xs">Initializing STACK QUEUE Sandbox Engine...</p>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-6 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Challenge Unavailable</h2>
        <p className="text-sm text-slate-600">{error || 'Challenge could not be loaded.'}</p>
        <button
          onClick={() => navigate('/games')}
          className="px-4 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 transition"
        >
          Return to Game Hub
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4.2rem)] overflow-hidden bg-[#F8FAFC]">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center space-x-3">
          <Link
            to={`/games/${challenge.gameSlug}`}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            title="Back to Game"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {challenge.gameSlug.replace('-', ' ')}
              </span>
              <span className="text-xs text-slate-300">|</span>
              <span className="text-xs font-semibold text-slate-900">
                Level {challenge.levelNumber}: {challenge.title}
              </span>
            </div>
          </div>
        </div>

        {/* Gamified HUD: Timer, Lives, XP */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
            <Clock className={`w-3.5 h-3.5 ${timeLeft < 30 ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`} />
            <span className={timeLeft < 30 ? 'text-rose-600 font-bold' : 'text-slate-700 font-medium'}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg text-xs font-semibold text-amber-800">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>+{challenge.xpReward} XP</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Briefing, Instructions & Hints (4 Cols) */}
        <div className="lg:col-span-4 bg-white border-r border-slate-200 p-4 overflow-y-auto space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Mission Briefing Card */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Mission Target</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  challenge.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  challenge.difficulty === 'Intermediate' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  challenge.difficulty === 'Advanced' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {challenge.targetDescription || challenge.title}
              </p>
            </div>

            {/* Detailed Instructions */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Instructions</h3>
              <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono">
                {challenge.instructions}
              </div>
            </div>

            {/* Test Cases (Public vs Hidden) */}
            {challenge.testCases && challenge.testCases.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Assertions & Test Cases</h3>
                <div className="space-y-1.5">
                  {challenge.testCases.map((tc, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between text-slate-600 text-[11px]">
                        <span>Input:</span>
                        <span className="text-slate-800 font-semibold">{tc.input || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-purple-700 text-[11px]">
                        <span>Expected Output:</span>
                        <span className="font-bold">{tc.expectedOutput}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hints Accordion */}
          {challenge.hints && challenge.hints.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Tactical Hints</span>
              </h3>
              <div className="space-y-2">
                {challenge.hints.map((hint, idx) => {
                  const isUnlocked = revealedHints.includes(idx);
                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                      {isUnlocked ? (
                        <p className="text-amber-800 text-xs font-medium">{hint.hintText}</p>
                      ) : (
                        <button
                          onClick={() => handleRevealHint(idx)}
                          className="w-full text-left text-slate-600 hover:text-amber-700 text-xs flex items-center justify-between font-medium transition"
                        >
                          <span>Reveal Hint #{idx + 1}</span>
                          <span className="text-[10px] text-rose-600 font-mono font-bold">-{hint.xpPenalty || 5} XP</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Stage & Code Workspace (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#F8FAFC] p-4 overflow-hidden">
          <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
            {challenge.type === 'css_rendering' ? (
              <div className="grid grid-rows-2 h-full gap-3 overflow-hidden">
                <div className="h-full overflow-hidden">
                  <CSSEnginePreview cssCode={code} challenge={challenge} />
                </div>
                <div className="h-full overflow-hidden">
                  <CodeEditor
                    code={code}
                    onChange={handleCodeChange}
                    onReset={handleResetCode}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                    isRunning={isRunning}
                    isSubmitting={isSubmitting}
                    allTestsPassed={allTestsPassed}
                    language="css_rendering"
                  />
                </div>
              </div>
            ) : challenge.type === 'sql_query' ? (
              <div className="grid grid-rows-2 h-full gap-3 overflow-hidden">
                <div className="h-full overflow-hidden">
                  <SQLResultsTable results={sqlResults} />
                </div>
                <div className="h-full overflow-hidden">
                  <CodeEditor
                    code={code}
                    onChange={handleCodeChange}
                    onReset={handleResetCode}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                    isRunning={isRunning}
                    isSubmitting={isSubmitting}
                    allTestsPassed={allTestsPassed}
                    language="sql_query"
                  />
                </div>
              </div>
            ) : challenge.type === 'visual_dsa' ? (
              <div className="flex flex-col h-full space-y-3 overflow-hidden">
                <div className="flex-1 overflow-hidden">
                  <DSAVisualizer challenge={challenge} />
                </div>
                {challenge.mcqOptions && challenge.mcqOptions.length > 0 && (
                  <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-sm">
                    <p className="text-xs font-bold text-slate-800">Select Your Answer:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {challenge.mcqOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setSelectedOption(opt.id); setAllTestsPassed(false); }}
                          className={`p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                            selectedOption === opt.id
                              ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold ring-1 ring-purple-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span>{opt.text}</span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">[{opt.id}]</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={handleRun}
                        disabled={!selectedOption || isRunning}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
                      >
                        {isRunning ? 'Checking...' : 'RUN'}
                      </button>
                      {allTestsPassed && (
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="px-5 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition"
                        >
                          {isSubmitting ? 'Submitting...' : 'SUBMIT'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : challenge.type === 'mcq' || challenge.type === 'output_prediction' ? (
              <div className="flex flex-col h-full space-y-4 justify-center max-w-2xl mx-auto w-full">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900">Choose the Correct Prediction:</h3>
                  <div className="space-y-2.5">
                    {challenge.mcqOptions?.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => { setSelectedOption(opt.id); setAllTestsPassed(false); }}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          selectedOption === opt.id
                            ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold ring-1 ring-purple-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-medium">{opt.text}</span>
                        <span className="text-[11px] font-mono text-slate-500 uppercase">Option {opt.id}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-2 pt-3">
                    <button
                      onClick={handleRun}
                      disabled={!selectedOption || isRunning}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      {isRunning ? 'Checking...' : 'RUN'}
                    </button>
                    {allTestsPassed && (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition"
                      >
                        {isSubmitting ? 'Submitting...' : 'SUBMIT'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Code Editor + Output Panel */
              <div className="flex flex-col h-full space-y-3 overflow-hidden">
                <div className="flex-1 overflow-hidden">
                  <CodeEditor
                    code={code}
                    onChange={handleCodeChange}
                    onReset={handleResetCode}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                    isRunning={isRunning}
                    isSubmitting={isSubmitting}
                    allTestsPassed={allTestsPassed}
                    language={challenge.language || challenge.gameSlug}
                  />
                </div>

                {/* RUN Output Panel */}
                {executionResult && (
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 max-h-56 overflow-y-auto shadow-sm text-xs font-mono">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center space-x-2">
                        <Terminal className="w-4 h-4 text-slate-500" />
                        <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Execution Output</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        executionResult.allTestsPassed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {executionResult.allTestsPassed ? '✓ All Tests Passed' : '✗ Execution Failed'}
                      </span>
                    </div>

                    {/* Compilation or Runtime Error */}
                    {(executionResult.compilationError || executionResult.runtimeError) && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
                        <span className="font-bold block mb-1">Error:</span>
                        <pre className="whitespace-pre-wrap">{executionResult.compilationError || executionResult.runtimeError}</pre>
                      </div>
                    )}

                    {/* Test Case Results Table */}
                    {executionResult.testCaseResults && executionResult.testCaseResults.length > 0 && (
                      <div className="space-y-1.5">
                        {executionResult.testCaseResults.map((tc, idx) => (
                          <div key={idx} className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                            tc.passed ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-red-50/60 border-red-200 text-red-900'
                          }`}>
                            <div className="space-y-0.5">
                              <span className="font-bold block">
                                Test Case #{tc.id || idx + 1}
                              </span>
                              <div className="text-[11px] text-slate-600 space-x-3">
                                <span>Input: <strong className="font-mono text-slate-800">{tc.input || '—'}</strong></span>
                                <span>Expected: <strong className="font-mono text-purple-700">{tc.expectedOutput}</strong></span>
                                <span>Output: <strong className="font-mono text-slate-900">{tc.actualOutput}</strong></span>
                              </div>
                            </div>
                            <span className={`text-[11px] font-bold shrink-0 px-2 py-0.5 rounded ${
                              tc.passed ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                              {tc.passed ? '✓ Passed' : '✗ Failed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* STDOUT Log */}
                    {executionResult.stdout && (
                      <div className="p-2 bg-slate-900 text-emerald-400 rounded-lg text-[11px] overflow-x-auto">
                        <span className="text-slate-400 block text-[10px] mb-0.5">// Console STDOUT Output</span>
                        <pre>{executionResult.stdout}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Victory Modal */}
      {resultModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <Trophy className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">Challenge Completed!</h2>
                <p className="text-xs text-slate-600 mt-1">{resultModal.feedback || 'All test cases passed and submission verified.'}</p>
              </div>

              {/* Stars */}
              <div className="flex justify-center space-x-2 py-1">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-7 h-7 ${
                      star <= (resultModal.stars || 3)
                        ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* XP Breakdown Box */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span>Total XP Awarded:</span>
                  <span className="text-amber-700 font-bold text-sm">+{resultModal.xpEarned} XP</span>
                </div>
                {resultModal.levelInfo?.leveledUp && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-purple-700 font-bold">
                    <span>Level Up!</span>
                    <span>Level {resultModal.levelInfo.level.level}: {resultModal.levelInfo.level.title}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => navigate(`/games/${challenge.gameSlug}`)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition"
                >
                  Game Levels
                </button>
                {resultModal.nextChallengeId ? (
                  <button
                    onClick={() => {
                      setResultModal(null);
                      navigate(`/challenges/${resultModal.nextChallengeId}`);
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 flex items-center justify-center space-x-1 transition"
                  >
                    <span>Next Level</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/games')}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    Explore Games
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
