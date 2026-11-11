import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { X, CheckCircle2, Lock, Send, AlertCircle, Award, Code, BookOpen } from 'lucide-react';

export default function ConceptTasksModal({ conceptId, onClose, onTaskCompleted }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [codeAnswer, setCodeAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null);

  useEffect(() => {
    if (!conceptId) return;

    async function fetchTasks() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/lms/concepts/${conceptId}/tasks`);
        if (res.data.success) {
          setData(res.data.data);
          const tasks = res.data.data.tasks || [];
          // Select first incomplete task, or first task
          const firstIncomplete = tasks.findIndex(t => !t.isCompleted);
          const initIndex = firstIncomplete >= 0 ? firstIncomplete : 0;
          setSelectedTaskIndex(initIndex);
          if (tasks[initIndex]) {
            setCodeAnswer(tasks[initIndex].submission?.codeAnswer || tasks[initIndex].starterCode || '// Write your Java solution here\n');
          }
        }
      } catch (err) {
        console.error('Error fetching concept tasks:', err);
        setError(err.response?.data?.message || 'Failed to load concept tasks.');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [conceptId]);

  const tasks = data?.tasks || [];
  const concept = data?.concept || {};
  const progress = data?.progress || { completed: 0, total: 0, percentage: 0 };
  const currentTask = tasks[selectedTaskIndex];

  const handleSelectTask = (index) => {
    setSelectedTaskIndex(index);
    setSubmissionFeedback(null);
    const t = tasks[index];
    if (t) {
      setCodeAnswer(t.submission?.codeAnswer || t.starterCode || '// Write your Java solution here\n');
    }
  };

  const handleSubmitTask = async () => {
    if (!currentTask) return;
    setSubmitting(true);
    setSubmissionFeedback(null);
    try {
      const res = await api.post(`/lms/tasks/${currentTask.id}/submit`, {
        codeAnswer,
        output: currentTask.expectedOutput
      });

      if (res.data.success) {
        setSubmissionFeedback({
          type: 'success',
          message: res.data.message || '✓ Task completed successfully!'
        });

        // Update local task state
        const updatedTasks = [...tasks];
        updatedTasks[selectedTaskIndex] = {
          ...updatedTasks[selectedTaskIndex],
          isCompleted: true,
          submission: res.data.data.submission
        };

        const newCompleted = updatedTasks.filter(t => t.isCompleted).length;
        const newPct = Math.round((newCompleted / updatedTasks.length) * 100);

        setData(prev => ({
          ...prev,
          tasks: updatedTasks,
          progress: {
            ...prev.progress,
            completed: newCompleted,
            percentage: newPct
          }
        }));

        if (onTaskCompleted) {
          onTaskCompleted();
        }

        // Automatically advance to the next task after brief delay
        if (selectedTaskIndex < tasks.length - 1) {
          setTimeout(() => {
            handleSelectTask(selectedTaskIndex + 1);
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Task submission error:', err);
      setSubmissionFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit task.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-purple-100 text-purple-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  {concept.courseTitle || 'Java Full Stack'}
                </span>
                <span className="text-xs text-slate-400">/</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {concept.moduleTitle || 'Collections'}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900">
                {concept.title || 'HashMap'} Tasks Workspace
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Progress Pill */}
            {!loading && !error && (
              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700">
                  Progress: <strong className="text-purple-600">{progress.completed} / {progress.total}</strong>
                </span>
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {progress.percentage}%
                </span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200/80 rounded-xl text-slate-500 hover:text-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl mb-4 border border-red-200">
              <Lock className="w-10 h-10 mx-auto" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Concept Tasks Locked</h3>
            <p className="text-sm text-red-600 font-semibold max-w-md mt-2">
              {error}
            </p>
            <p className="text-xs text-slate-500 mt-2 max-w-md">
              The assigned tutor must complete teaching this concept before student tasks become unlocked.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 transition"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Left sidebar: Tasks Navigation (10-15 tasks) */}
            <div className="w-64 border-r border-slate-200 bg-slate-50/70 p-4 overflow-y-auto space-y-2 shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block px-1">
                Concept Tasks ({tasks.length})
              </span>
              {tasks.map((task, idx) => {
                const isSelected = idx === selectedTaskIndex;

                return (
                  <button
                    key={task.id}
                    onClick={() => handleSelectTask(idx)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition flex items-center justify-between border ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] text-white border-transparent shadow-sm font-bold'
                        : task.isCompleted
                        ? 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-50/50'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <span className="block font-mono text-[10px] opacity-80">
                        {task.taskId}
                      </span>
                      <span className="truncate block font-medium">
                        Task {idx + 1}
                      </span>
                    </div>

                    <div>
                      {task.isCompleted ? (
                        <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                      ) : (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {task.marks}m
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right main area: Selected Task workspace */}
            {currentTask ? (
              <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-5">
                {/* Task Question Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                      {currentTask.taskId}
                    </span>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        currentTask.difficulty === 'Easy'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : currentTask.difficulty === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {currentTask.difficulty}
                      </span>
                      <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>{currentTask.marks} Marks</span>
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900">
                    {currentTask.question}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentTask.description}
                  </p>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-1 text-[11px] uppercase tracking-wider">
                      Expected Output:
                    </span>
                    <pre className="font-mono text-emerald-700 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100 whitespace-pre-wrap">
                      {currentTask.expectedOutput}
                    </pre>
                  </div>
                </div>

                {/* Solution Code Area */}
                <div className="space-y-2 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Code className="w-4 h-4 text-purple-600" />
                      <span>Java Solution Code:</span>
                    </span>
                    {currentTask.isCompleted && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Solved ✓</span>
                      </span>
                    )}
                  </div>

                  <textarea
                    value={codeAnswer}
                    onChange={(e) => setCodeAnswer(e.target.value)}
                    rows={8}
                    className="w-full font-mono text-xs bg-slate-900 text-emerald-400 p-4 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner resize-y leading-relaxed"
                    placeholder="// Write your solution here..."
                  />
                </div>

                {/* Feedback Banner */}
                {submissionFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 border ${
                    submissionFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    {submissionFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>{submissionFeedback.message}</span>
                  </div>
                )}

                {/* Submit Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => {
                      if (selectedTaskIndex < tasks.length - 1) {
                        handleSelectTask(selectedTaskIndex + 1);
                      }
                    }}
                    disabled={selectedTaskIndex >= tasks.length - 1}
                    className="px-4 py-2.5 bg-white text-slate-700 border border-slate-300 font-bold text-xs rounded-xl hover:bg-slate-50 transition disabled:opacity-40"
                  >
                    Next Task →
                  </button>

                  <button
                    onClick={handleSubmitTask}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting...' : 'SUBMIT TASK SOLUTION'}</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
