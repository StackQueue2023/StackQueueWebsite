import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  XCircle,
  Trophy,
  Sparkles,
  ArrowRight,
  Unlock,
  HelpCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function SubmissionResultModal({
  isOpen,
  onClose,
  result,
  onNextQuestion,
  hasNextQuestion = false,
  onOpenHints
}) {
  const [countdown, setCountdown] = useState(2);
  const autoNavTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const hasNavigatedRef = useRef(false);

  // Confetti effect on success
  useEffect(() => {
    if (isOpen && result?.allPassed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback gracefully
      }
    }
  }, [isOpen, result]);

  // Exact 2-second auto-navigation timer after successful submission
  useEffect(() => {
    hasNavigatedRef.current = false;

    if (isOpen && result?.allPassed && hasNextQuestion && result?.nextQuestion && !result?.isTrackCompleted) {
      setCountdown(2);

      // Countdown ticker for smooth UI display
      const startTime = Date.now();
      countdownIntervalRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, 2 - elapsedSeconds);
        setCountdown(remaining);
      }, 500);

      // Exact 2000ms auto navigation trigger
      autoNavTimerRef.current = setTimeout(() => {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          onClose();
          if (onNextQuestion) {
            onNextQuestion(result.nextQuestion);
          }
        }
      }, 2000);

      return () => {
        if (autoNavTimerRef.current) clearTimeout(autoNavTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      };
    } else {
      if (autoNavTimerRef.current) clearTimeout(autoNavTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
  }, [isOpen, result, hasNextQuestion]);

  if (!isOpen || !result) return null;

  const isPassed = result.allPassed;
  const isTrackCompleted = result.isTrackCompleted || (!hasNextQuestion && isPassed);

  const handleManualNext = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    if (autoNavTimerRef.current) clearTimeout(autoNavTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    onClose();
    if (onNextQuestion) {
      onNextQuestion(result.nextQuestion);
    }
  };

  const handleStayOnQuestion = () => {
    hasNavigatedRef.current = true;
    if (autoNavTimerRef.current) clearTimeout(autoNavTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden text-center animate-in zoom-in-95 duration-150">
        
        {/* Animated Icon & Status Header */}
        <div className="mb-4 flex justify-center">
          {isPassed ? (
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-400 flex items-center justify-center text-rose-600">
              <XCircle className="w-8 h-8" />
            </div>
          )}
        </div>

        <h2 className={`text-2xl font-black ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
          {isPassed ? 'Solution Accepted!' : 'Test Cases Failed'}
        </h2>

        <p className="text-xs text-slate-600 mt-1 mb-4">
          {isPassed
            ? 'Outstanding work! All test cases passed.'
            : `${result.passedTests} of ${result.totalTests} test cases passed. Debug your code and try again.`}
        </p>

        {/* Unlocked Next Level Notification */}
        {result.unlockedNextLevel && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center space-x-2 text-amber-800 text-xs font-semibold animate-pulse">
            <Unlock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>🎉 Congratulations! Next Level Unlocked!</span>
          </div>
        )}

        {/* Score & XP Card */}
        {isPassed && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 mb-4 space-y-2 text-left">
            <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Total XP Earned:</span>
              </span>
              <span className="text-base font-bold text-amber-700 font-mono">
                +{result.xpAwarded || 0} XP
              </span>
            </div>

            <div className="text-[11px] text-slate-500 flex justify-between border-t border-amber-200/80 pt-2 font-mono">
              <span>Attempt #{result.attemptNumber || 1}</span>
              {result.executionTimeMs !== undefined && (
                <span>Runtime: {result.executionTimeMs}ms</span>
              )}
            </div>
          </div>
        )}

        {/* Track Completion Banner (When last question is completed) */}
        {isPassed && isTrackCompleted && (
          <div className="mb-4 p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs font-bold text-purple-900 flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Track Completed! You have solved all questions in this domain!</span>
          </div>
        )}

        {/* Automatic Navigation 2-Second Countdown Progress Pill */}
        {isPassed && hasNextQuestion && result?.nextQuestion && !isTrackCompleted && (
          <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
            <span>
              Loading next question: <strong>Q{result.nextQuestion.questionNumber}</strong> in {countdown}s...
            </span>
          </div>
        )}

        {/* Failed Details Card */}
        {!isPassed && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-left space-y-3">
            <div className="text-xs text-slate-800 font-medium">
              Debugging Checklist:
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Check boundary limits (0, negative numbers, maximum constraints).</li>
              <li>Verify string casing or whitespace formatting.</li>
              <li>Handle empty arrays or single-element inputs.</li>
            </ul>

            {onOpenHints && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHints();
                }}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Need a hint? View Guided Hints</span>
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* If failed, back to editor */}
          {!isPassed && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Back to Editor
            </button>
          )}

          {/* If track completed */}
          {isPassed && isTrackCompleted && (
            <button
              type="button"
              onClick={handleStayOnQuestion}
              className="w-full py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:opacity-95 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
            >
              Review My Solutions
            </button>
          )}

          {/* If next question available: Manual shortcut or Stay on Question */}
          {isPassed && hasNextQuestion && !isTrackCompleted && (
            <>
              <button
                type="button"
                onClick={handleStayOnQuestion}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium transition cursor-pointer"
                title="Pause auto-navigation"
              >
                Stay on Question
              </button>
              <button
                type="button"
                onClick={handleManualNext}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
