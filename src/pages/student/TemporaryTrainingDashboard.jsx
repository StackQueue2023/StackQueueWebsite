import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  ListChecks,
  Calendar,
  TrendingUp,
  Building2,
  BookOpen,
  RefreshCw,
  Layers,
  Code2,
  HelpCircle,
  Bug,
  ChevronRight,
  Sparkles,
  Check,
  X,
  Play,
  Award,
  AlertCircle
} from 'lucide-react';

export default function TemporaryTrainingDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [error, setError] = useState('');

  // Syllabus Modules & Practice Questions state
  const [modulesData, setModulesData] = useState(null);
  const [loadingModules, setLoadingModules] = useState(true);
  const [activeModuleModal, setActiveModuleModal] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [codeAnswer, setCodeAnswer] = useState('');
  const [selectedMcqOption, setSelectedMcqOption] = useState('');
  const [submitFeedback, setSubmitFeedback] = useState(null);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/training-management/my-dashboard');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load training dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssignedModules = useCallback(async () => {
    setLoadingModules(true);
    try {
      const res = await api.get('/student/college-training/my-modules');
      if (res.data?.success) {
        setModulesData(res.data);
      }
    } catch (err) {
      console.error('Error fetching assigned training modules:', err);
    } finally {
      setLoadingModules(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchAssignedModules();
  }, [fetchDashboard, fetchAssignedModules]);

  const handleCompleteTask = async (taskId) => {
    setCompletingId(taskId);
    try {
      const res = await api.post(`/training-management/tasks/${taskId}/complete`);
      if (res.data?.success && res.data?.dashboard) {
        setData(res.data.dashboard);
      } else {
        await fetchDashboard();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not complete task');
    } finally {
      setCompletingId(null);
    }
  };

  // Open Module Tasks Modal
  const handleOpenModuleModal = (moduleItem) => {
    setActiveModuleModal(moduleItem);
    const questions = moduleItem.questions || [];
    if (questions.length > 0) {
      const firstUncompleted = questions.find(q => !q.isCompleted) || questions[0];
      handleSelectQuestion(firstUncompleted);
    } else {
      setSelectedQuestion(null);
    }
  };

  // Select Question inside Workspace
  const handleSelectQuestion = (q) => {
    setSelectedQuestion(q);
    setCodeAnswer(q.starterCode || '');
    setSelectedMcqOption('');
    setSubmitFeedback(null);
  };

  // Submit Answer (Coding or MCQ)
  const handleSubmitAnswer = async () => {
    if (!selectedQuestion || !activeModuleModal) return;

    if (selectedQuestion.type === 'mcq' && !selectedMcqOption) {
      setSubmitFeedback({ passed: false, text: 'Please select one option before submitting.' });
      return;
    }

    if (selectedQuestion.type !== 'mcq' && !codeAnswer.trim()) {
      setSubmitFeedback({ passed: false, text: 'Code cannot be empty.' });
      return;
    }

    setSubmittingAnswer(true);
    setSubmitFeedback(null);
    try {
      const res = await api.post(
        `/student/college-training/modules/${activeModuleModal._id}/questions/${selectedQuestion._id}/submit`,
        {
          submittedCode: codeAnswer,
          selectedOptionId: selectedMcqOption
        }
      );

      if (res.data?.success) {
        setSubmitFeedback({
          passed: res.data.passed,
          text: res.data.feedback,
          explanation: res.data.explanation,
          correctOptionId: res.data.correctOptionId
        });

        // Update local state for immediate feedback
        if (res.data.passed) {
          // Mark this question as completed in activeModuleModal
          const updatedQuestions = activeModuleModal.questions.map(q =>
            q._id === selectedQuestion._id ? { ...q, isCompleted: true } : q
          );
          const completedCount = updatedQuestions.filter(q => q.isCompleted).length;
          const totalCount = updatedQuestions.length;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

          const updatedModule = {
            ...activeModuleModal,
            questions: updatedQuestions,
            completedQuestionsCount: completedCount,
            progressPercent,
            status: progressPercent === 100 ? 'COMPLETED' : 'IN_PROGRESS'
          };

          setActiveModuleModal(updatedModule);

          // Also update in modulesData list
          if (modulesData?.modules) {
            const updatedModulesList = modulesData.modules.map(m =>
              m._id === updatedModule._id ? updatedModule : m
            );
            setModulesData({
              ...modulesData,
              modules: updatedModulesList
            });
          }
        }
      }
    } catch (err) {
      setSubmitFeedback({
        passed: false,
        text: err.response?.data?.message || 'Submission failed. Please try again.'
      });
    } finally {
      setSubmittingAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FC] flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading Training Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F7FC] p-6">
        <div className="max-w-3xl mx-auto bg-white border border-rose-200 rounded-2xl p-6 text-rose-700">
          <p className="font-bold">{error}</p>
        </div>
      </div>
    );
  }

  const student = data?.student || {};
  const metrics = data?.metrics || {};
  const tasks = data?.tasks || [];
  const dailyPerformance = data?.dailyPerformance || [];

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const batchInfo = modulesData?.batch;
  const syllabusInfo = modulesData?.syllabus;
  const trainingModules = modulesData?.modules || [];
  const overallMetrics = modulesData?.overallMetrics || {};

  return (
    <div className="min-h-screen bg-[#F8F7FC] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Training / Orientation Student</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{student.name}</h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600 font-medium pt-1">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {batchInfo?.college?.name || student.collegeName}
              </span>
              <span>Dept: <strong className="text-slate-800">{batchInfo?.department || student.department}</strong></span>
              <span>Batch: <strong className="text-slate-800">{batchInfo?.code || student.year}</strong></span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                {batchInfo?.courseName || student.trainingName}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {fmtDate(student.startDate)} – {fmtDate(student.endDate)}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              fetchDashboard();
              fetchAssignedModules();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs cursor-pointer self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ─── DEDICATED SECTION: ASSIGNED SYLLABUS & MODULES ───────── */}
      <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-50 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                Curriculum Modules & Tasks
              </span>
              <span className="text-xs font-bold text-slate-500">
                Batch: {batchInfo?.name || 'Assigned Training Batch'}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <span>{syllabusInfo?.courseName || batchInfo?.courseName || 'College Training Syllabus'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Only modules strictly based on your college's approved syllabus are assigned below. Complete each module's tasks and challenges to progress.
            </p>
          </div>

          {/* Overall Module Progress Pill */}
          <div className="bg-purple-50/70 border border-purple-200 px-4 py-3 rounded-2xl flex items-center space-x-4 shrink-0">
            <div>
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Syllabus Progress</span>
              <span className="text-lg font-black text-purple-900">
                {overallMetrics.overallProgressPercent || 0}% Completed
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-3 border-purple-600 flex items-center justify-center font-black text-purple-800 text-xs bg-white shadow-2xs">
              {overallMetrics.completedModules || 0}/{overallMetrics.totalModules || trainingModules.length}
            </div>
          </div>
        </div>

        {/* Modules List Grid / Cards */}
        {loadingModules ? (
          <div className="py-8 text-center text-slate-400 text-xs font-semibold">
            Loading your assigned syllabus modules...
          </div>
        ) : trainingModules.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">Syllabus modules are currently being generated by your administrator.</p>
            <p className="text-[11px] text-slate-400">Please check back shortly or click Refresh.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainingModules.map((mod, idx) => {
              const isCompleted = mod.status === 'COMPLETED' || mod.progressPercent === 100;
              const isInProgress = mod.status === 'IN_PROGRESS' || mod.progressPercent > 0;
              const qCount = mod.questions?.length || mod.totalQuestionsCount || 0;
              const completedQCount = mod.completedQuestionsCount || 0;

              return (
                <div
                  key={mod._id}
                  className={`border rounded-2xl p-5 space-y-3.5 transition shadow-2xs flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : isInProgress
                      ? 'bg-blue-50/20 border-blue-200'
                      : 'bg-white border-slate-200 hover:border-purple-200'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Unit Badge + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800">
                        Module {mod.order || (idx + 1)}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center space-x-1 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isInProgress
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Completed</span>
                          </>
                        ) : isInProgress ? (
                          <>
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>In Progress</span>
                          </>
                        ) : (
                          <span>Not Started</span>
                        )}
                      </span>
                    </div>

                    {/* Module Title */}
                    <h3 className="text-base font-black text-slate-900 leading-snug">{mod.title}</h3>

                    {/* Topics Chips */}
                    {mod.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {mod.topics.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold"
                          >
                            {t.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Progress Bar + Action Button */}
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>Tasks: {completedQCount} / {qCount} Solved</span>
                      <span className="text-purple-700">{mod.progressPercent || 0}%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600'
                        }`}
                        style={{ width: `${mod.progressPercent || 0}%` }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenModuleModal(mod)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs ${
                        isCompleted
                          ? 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Review Completed Tasks' : 'Open Module & Solve Tasks'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Tasks Assigned</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{metrics.totalTasksAssigned ?? 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Tasks Completed</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.tasksCompleted ?? 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Tasks Pending</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{metrics.tasksPending ?? 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Task Completion %</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{metrics.taskCompletionPercent ?? 0}%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Attendance %</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{metrics.attendancePercent ?? 0}%</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{metrics.daysPresent ?? 0}/{metrics.totalTrainingDays ?? 0} days</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Overall Training %</p>
          <p className="text-2xl font-black text-pink-600 mt-1">{metrics.overallTrainingCompletionPercent ?? 0}%</p>
        </div>
      </div>

      {/* Assigned Training Tasks */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-blue-600" />
            Assigned Training Tasks ({tasks.length})
          </h2>
        </div>

        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No training tasks have been assigned yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((t) => (
              <div key={t.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{t.title}</span>
                    {t.domain && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {t.domain}
                      </span>
                    )}
                  </div>
                  {t.description && <p className="text-xs text-slate-600 mt-0.5">{t.description}</p>}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Assigned: {fmtDate(t.assignedDate)} {t.dueDate ? `• Due: ${fmtDate(t.dueDate)}` : ''}
                  </p>
                </div>
                <div>
                  {t.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCompleteTask(t.id)}
                      disabled={completingId === t.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold shadow-xs hover:opacity-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {completingId === t.id ? 'Updating...' : 'Mark Completed'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Performance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-black text-slate-900">Daily Performance Breakdown</h2>
        {dailyPerformance.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No daily performance records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3 text-center">Tasks Assigned</th>
                  <th className="py-2.5 px-3 text-center">Completed</th>
                  <th className="py-2.5 px-3 text-center">Pending</th>
                  <th className="py-2.5 px-3 text-center">Completion %</th>
                  <th className="py-2.5 px-3 text-center">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyPerformance.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{row.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{row.studentName}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{row.tasksAssigned}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{row.tasksCompleted}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-amber-600">{row.tasksPending}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-600">{row.taskCompletionPercent}%</td>
                    <td className="py-2.5 px-3 text-center capitalize">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.attendanceStatus === 'present'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : row.attendanceStatus === 'absent'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {row.attendanceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── INTERACTIVE WORKSPACE MODAL: SOLVE MODULE TASKS ───────── */}
      {activeModuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl relative border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm">
                  {activeModuleModal.order}
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{activeModuleModal.title}</h3>
                  <p className="text-xs text-slate-500">
                    Solve each task to complete this module &bull; Progress: {activeModuleModal.progressPercent}%
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveModuleModal(null);
                  setSelectedQuestion(null);
                  setSubmitFeedback(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Left Question List & Right Solver Pane */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Question Navigator */}
              <div className="w-full md:w-72 border-r border-slate-100 bg-slate-50/40 p-3 overflow-y-auto space-y-2 shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">
                  Module Tasks ({activeModuleModal.questions?.length || 0})
                </span>

                {activeModuleModal.questions?.map((q, idx) => {
                  const isCurrent = selectedQuestion?._id === q._id;
                  const isDone = q.isCompleted;

                  return (
                    <button
                      key={q._id}
                      type="button"
                      onClick={() => handleSelectQuestion(q)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                        isCurrent
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="truncate">{q.title}</span>
                      </div>
                      {isDone && <CheckCircle2 className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-white' : 'text-emerald-600'}`} />}
                    </button>
                  );
                })}
              </div>

              {/* Problem Statement & Solver Workspace */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {selectedQuestion ? (
                  <div className="space-y-4">
                    {/* Question Header */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          selectedQuestion.type === 'coding' ? 'bg-blue-100 text-blue-700' :
                          selectedQuestion.type === 'mcq' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {selectedQuestion.type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{selectedQuestion.difficulty}</span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          Topic: {selectedQuestion.topic}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900">{selectedQuestion.title}</h4>
                    </div>

                    {/* Instructions */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                      <strong className="text-slate-900 font-bold block">Problem Description:</strong>
                      <p>{selectedQuestion.instructions}</p>
                    </div>

                    {/* Test Cases Preview (for Coding) */}
                    {selectedQuestion.type !== 'mcq' && selectedQuestion.testCases?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800">Test Cases:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedQuestion.testCases.map((tc, tcIdx) => (
                            <div key={tcIdx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] space-y-0.5">
                              <div><span className="text-slate-400">Input:</span> {tc.input}</div>
                              <div><span className="text-slate-400">Expected:</span> <strong className="text-blue-700">{tc.expectedOutput}</strong></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Solver Input: MCQ vs Code */}
                    {selectedQuestion.type === 'mcq' ? (
                      <div className="space-y-2.5 pt-2">
                        <span className="text-xs font-bold text-slate-800 block">Select the correct answer:</span>
                        <div className="space-y-2">
                          {selectedQuestion.mcqOptions?.map((opt) => (
                            <label
                              key={opt.optionId}
                              className={`p-3.5 rounded-2xl border flex items-center space-x-3 cursor-pointer transition ${
                                selectedMcqOption === opt.optionId
                                  ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="mcqOption"
                                value={opt.optionId}
                                checked={selectedMcqOption === opt.optionId}
                                onChange={() => setSelectedMcqOption(opt.optionId)}
                                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-xs">{opt.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">Your Code Solution:</span>
                          <span className="text-[11px] font-mono text-slate-400">Monospaced Editor</span>
                        </div>
                        <textarea
                          rows="10"
                          value={codeAnswer}
                          onChange={(e) => setCodeAnswer(e.target.value)}
                          placeholder="Write your code solution here..."
                          className="w-full bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-2xl focus:outline-purple-500 leading-relaxed"
                        />
                      </div>
                    )}

                    {/* Feedback Alert */}
                    {submitFeedback && (
                      <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
                        submitFeedback.passed
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-rose-50 border-rose-300 text-rose-900'
                      }`}>
                        <div className="flex items-center space-x-2 font-bold">
                          {submitFeedback.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                          <span>{submitFeedback.passed ? 'Solution Passed!' : 'Try Again'}</span>
                        </div>
                        <p>{submitFeedback.text}</p>
                        {submitFeedback.explanation && (
                          <p className="pt-1 text-[11px] text-slate-600 font-medium">
                            <strong>Explanation:</strong> {submitFeedback.explanation}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={handleSubmitAnswer}
                        disabled={submittingAnswer}
                        className="px-6 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2 transition cursor-pointer shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{submittingAnswer ? 'Evaluating...' : 'Submit & Validate Solution'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400 text-xs font-semibold">
                    Select a question from the left sidebar to start solving.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
