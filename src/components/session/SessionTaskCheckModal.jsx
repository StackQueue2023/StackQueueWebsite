import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, AlertTriangle, X, Send } from 'lucide-react';
import api from '../../api/client';

export default function SessionTaskCheckModal({ session, onClose, onSessionEnded }) {
  const [step, setStep] = useState('question'); // 'question' | 'create_task' | 'confirm_no'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Task form state
  const [taskTitle, setTaskTitle] = useState(`${session.topic} - Practical Application Assignment`);
  const [taskDescription, setTaskDescription] = useState(`Implement real-world practical code demonstrating ${session.topic}. Ensure unit tests pass.`);
  const [taskInstructions] = useState('Push solution to GitHub repository and submit the repo URL.');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [selectedStudentId, setSelectedStudentId] = useState(session.studentIds?.[0]?._id || '');

  // Handle End Session without assigning task
  const handleConfirmNoTask = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await api.post(`/sessions/${session._id}/end`, {
        taskAssigned: false
      });
      if (res.data.success) {
        onSessionEnded();
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to end session');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Create Task + End Session
  const handleCreateTaskAndEnd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      // 1. Create task for the student
      const studentId = selectedStudentId || session.studentIds?.[0]?._id;
      if (!studentId) {
        throw new Error('No student found for this session to assign task to.');
      }

      await api.post('/tasks', {
        sessionId: session._id,
        studentId,
        title: taskTitle,
        description: taskDescription,
        instructions: taskInstructions,
        dueDate
      });

      // 2. End session with taskAssigned: true
      const endRes = await api.post(`/sessions/${session._id}/end`, {
        taskAssigned: true
      });

      if (endRes.data.success) {
        onSessionEnded();
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to assign task and conclude session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Concluding Live Session: {session.topic}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Mandatory Question */}
        {step === 'question' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-center">
              <HelpCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">
                Did you assign a homework or practice task for this session?
              </h4>
              <p className="text-xs text-slate-500">
                STACK QUEUE standard operating procedure requires students to be assigned concrete challenges after every live instruction.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('create_task')}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>YES, Assign Task Now</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('confirm_no')}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition border border-slate-200"
              >
                <span>NO, End Without Task</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Create Task Form */}
        {step === 'create_task' && (
          <form onSubmit={handleCreateTaskAndEnd} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Assign To Student:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                {session.studentIds?.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name} ({st.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Task Title:</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Problem / Homework Description:</label>
              <textarea
                rows={3}
                required
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Due Date:</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Expected Reward:</label>
                <div className="py-2 px-3 bg-amber-50 border border-amber-200 rounded-xl font-mono text-amber-700 font-bold text-center">
                  +40 XP to Student
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep('question')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving...' : 'Assign Task & End Session'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Confirm No Task */}
        {step === 'confirm_no' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center space-x-2 text-amber-700 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm End Session Without Task</span>
              </div>
              <p className="text-slate-600">
                Are you sure you want to conclude this session without assigning a follow-up task? This will be recorded in institute audit logs.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('question')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmNoTask}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-sm transition"
              >
                <span>{isSubmitting ? 'Ending...' : 'Yes, End Session Now'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
