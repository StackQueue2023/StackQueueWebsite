import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Briefcase, CheckCircle2, Lock, BookOpen, Code2, Play,
  ChevronRight, Award, FileText, Check, AlertCircle, Loader2,
  Calendar, Sparkles, Layers, ArrowRight
} from 'lucide-react';

export default function StudentInternshipDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);

  // Question submission states
  const [answers, setAnswers] = useState({});
  const [submittingQId, setSubmittingQId] = useState(null);
  const [submissionResults, setSubmissionResults] = useState({});
  const [completingDay, setCompletingDay] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/internship/student/dashboard');
      if (res.data?.success) {
        setDashboardData(res.data.data);
        const current = res.data.data.student?.currentDay || 1;
        setSelectedDay(current);
      } else {
        setError(res.data?.message || 'Failed to load internship dashboard.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error connecting to internship server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const student = dashboardData?.student;
  const batch = dashboardData?.batch;
  const modules = dashboardData?.modules || [];
  const completedDays = student?.completedDays || [];
  const currentDay = student?.currentDay || 1;

  // Selected Day Module & Progress
  const activeModule = modules.find((m) => m.dayNumber === selectedDay);
  const activeDayQuestions = activeModule?.questions || [];
  const activeDayProgress = dashboardData?.progressRecords?.find((p) => p.dayNumber === selectedDay);
  const completedQuestionIds = activeDayProgress?.completedQuestions || [];

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleTextAnswerChange = (questionId, text) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmitQuestion = async (questionId) => {
    const studentAnswer = answers[questionId];
    if (studentAnswer === undefined || studentAnswer === '') {
      alert('Please select or enter an answer before submitting.');
      return;
    }

    setSubmittingQId(questionId);
    try {
      const res = await api.post(`/api/internship/student/questions/${questionId}/submit`, {
        answer: studentAnswer
      });

      if (res.data?.success) {
        setSubmissionResults((prev) => ({
          ...prev,
          [questionId]: res.data
        }));

        if (res.data.dayCompleted) {
          fetchDashboard();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting question answer.');
    } finally {
      setSubmittingQId(null);
    }
  };

  const handleCompleteDay = async () => {
    setCompletingDay(true);
    try {
      const res = await api.post(`/api/internship/student/days/${selectedDay}/complete`);
      if (res.data?.success) {
        await fetchDashboard();
        if (selectedDay < 15) {
          setSelectedDay(selectedDay + 1);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete day.');
    } finally {
      setCompletingDay(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
          Loading Internship Workspace...
        </p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 sm:p-12 max-w-2xl mx-auto flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center">
          <Briefcase className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Internship Enrollment Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error || "You are not currently enrolled in any active 15-Day Internship Batch. Please contact the administrator or verify your student login credentials."}
        </p>
        <button
          onClick={fetchDashboard}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner Card */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-mono">
                15-Day Practical Internship
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-400/30 text-emerald-200 px-3 py-1 rounded-full font-mono">
                Batch: {student.batchCode}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {student.courseName} Internship Workspace
            </h1>
            <p className="text-xs text-emerald-100 font-medium">
              Welcome back, <strong>{student.studentName}</strong> ({student.username}). Complete day-by-day practical tasks and questions to finish your certification!
            </p>
          </div>

          {/* Progress Pill / Meter */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 flex flex-col justify-center min-w-[220px] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Overall Progress</span>
              <span className="font-mono text-emerald-300 text-sm">{student.overallProgress}%</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                style={{ width: `${student.overallProgress}%` }}
                className="h-full bg-emerald-300 rounded-full transition-all duration-700"
              />
            </div>
            <span className="text-[11px] text-emerald-100 font-medium flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-300" />
              <span>{completedDays.length} of 15 Days Completed</span>
            </span>
          </div>
        </div>
      </div>

      {/* 15-DAY PROGRESSION STEPPER */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>15-Day Progression Timeline</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">Sequential Unlock: Complete Day N to unlock Day N+1</span>
        </div>

        {/* Stepper Scroll Container */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2.5 min-w-max">
            {Array.from({ length: 15 }, (_, i) => i + 1).map((dayNum) => {
              const isDone = completedDays.includes(dayNum);
              const isCurrent = dayNum === currentDay;
              const isSelected = dayNum === selectedDay;
              const isLocked = dayNum > currentDay && !isDone;

              let btnStyle = 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';
              if (isDone) {
                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
              } else if (isCurrent) {
                btnStyle = 'border-purple-500 bg-purple-50 text-purple-900 font-bold ring-2 ring-purple-500/30';
              } else if (isLocked) {
                btnStyle = 'border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60';
              }

              if (isSelected) {
                btnStyle += ' ring-2 ring-emerald-600 shadow-sm';
              }

              return (
                <button
                  key={dayNum}
                  type="button"
                  disabled={isLocked}
                  onClick={() => !isLocked && setSelectedDay(dayNum)}
                  className={`flex flex-col items-center justify-center w-16 h-20 rounded-2xl border-2 transition p-2 cursor-pointer ${btnStyle}`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Day
                  </span>
                  <span className="text-lg font-black font-mono">
                    {dayNum}
                  </span>
                  <div className="mt-1">
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-purple-600 inline-block animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SELECTED DAY WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Learning Content & Practical Exercises */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Day Title & Topics Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-mono">
                Day {selectedDay} Curriculum
              </span>
              {completedDays.includes(selectedDay) && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Day Completed</span>
                </span>
              )}
            </div>

            <h2 className="text-xl font-black text-slate-900">
              {activeModule?.dayTitle || `Day ${selectedDay}: Core Practical Implementation`}
            </h2>

            {/* Topics Pills */}
            {activeModule?.topics && activeModule.topics.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Topics Covered Today:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeModule.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold bg-slate-100 text-slate-800 px-3 py-1 rounded-xl border border-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subtopics & Learning Content */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>Subtopics & Learning Guide</span>
            </h3>

            {activeModule?.subtopics && activeModule.subtopics.length > 0 ? (
              <ul className="space-y-2">
                {activeModule.subtopics.map((st, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">Curriculum topics mapped for Day {selectedDay}.</p>
            )}

            {activeModule?.learningContent && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {activeModule.learningContent}
              </div>
            )}
          </div>

          {/* Practical Exercises & Tasks */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>Practical Hands-On Exercises</span>
            </h3>

            {activeModule?.practicalExercises && activeModule.practicalExercises.length > 0 ? (
              <div className="space-y-3">
                {activeModule.practicalExercises.map((ex, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-emerald-950">
                        {typeof ex === 'string' ? ex : ex.title || 'Hands-on Exercise'}
                      </span>
                    </div>
                    {typeof ex === 'object' && ex.description && (
                      <p className="text-xs text-emerald-800 pl-7">{ex.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Follow the trainer instructions and practical code exercises for Day {selectedDay}.</p>
            )}
          </div>

        </div>

        {/* Right Col: Day Questions & Completion */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Day {selectedDay} Practice Questions</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {activeDayQuestions.length} Questions
              </span>
            </div>

            {activeDayQuestions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                No interactive questions configured for Day {selectedDay} yet.
              </div>
            ) : (
              <div className="space-y-5">
                {activeDayQuestions.map((q, idx) => {
                  const isDone = completedQuestionIds.includes(q._id.toString());
                  const result = submissionResults[q._id];

                  return (
                    <div
                      key={q._id}
                      className={`p-4 rounded-2xl border transition space-y-3 ${
                        isDone
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-slate-200 bg-slate-50/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Q{idx + 1}. {q.title || q.question}
                        </span>
                        {isDone && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                      </div>

                      {q.options && q.options.length > 0 ? (
                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-2.5 p-2 rounded-xl text-xs border cursor-pointer transition ${
                                answers[q._id] === optIdx
                                  ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${q._id}`}
                                checked={answers[q._id] === optIdx}
                                onChange={() => handleSelectOption(q._id, optIdx)}
                                className="accent-emerald-600"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          rows={3}
                          value={answers[q._id] || ''}
                          onChange={(e) => handleTextAnswerChange(q._id, e.target.value)}
                          placeholder="Type your explanation or solution here..."
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      )}

                      {/* Submit Question Button */}
                      <button
                        type="button"
                        onClick={() => handleSubmitQuestion(q._id)}
                        disabled={submittingQId === q._id}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {submittingQId === q._id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Validating...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Submit Answer</span>
                          </>
                        )}
                      </button>

                      {/* Submission Feedback */}
                      {result && (
                        <div
                          className={`p-3 rounded-xl text-xs font-medium ${
                            result.isCorrect
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          <p>{result.feedback}</p>
                          {result.explanation && (
                            <p className="mt-1 text-[11px] text-slate-600 font-normal">
                              {result.explanation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Complete Day Action */}
            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleCompleteDay}
                disabled={completingDay}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {completingDay ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Completing Day {selectedDay}...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Day {selectedDay} & Unlock Next</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
