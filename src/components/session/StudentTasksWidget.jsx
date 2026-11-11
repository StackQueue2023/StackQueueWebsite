import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  UploadCloud, 
  Github, 
  FileText, 
  ExternalLink, 
  Award,
  Send,
  X
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function StudentTasksWidget() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalTask, setActiveModalTask] = useState(null);
  
  // Submission form state
  const [submissionType, setSubmissionType] = useState('github');
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTasks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/tasks');
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Error loading tasks:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleOpenSubmit = (task) => {
    setActiveModalTask(task);
    setSubmissionType('github');
    setSubmissionText(task.submissionText || '');
    setSubmissionUrl(task.submissionUrl || '');
    setSubmissionNotes(task.submissionNotes || '');
    setErrorMsg('');
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!activeModalTask) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.post(`/tasks/${activeModalTask._id}/submit`, {
        submissionType,
        submissionText,
        submissionUrl,
        submissionNotes
      });

      if (res.data.success) {
        setActiveModalTask(null);
        fetchTasks();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit task. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">COMPLETED</span>;
      case 'SUBMITTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">SUBMITTED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">UNDER REVIEW</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">IN PROGRESS</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">NEEDS REVISION</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">ASSIGNED</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>Session Tasks & Homework ({tasks.length})</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Reviewed by Tutor
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-4 text-center">No homework tasks assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div 
              key={task._id}
              className="p-3.5 bg-slate-50/70 border border-slate-200 hover:border-purple-300 rounded-xl transition space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-slate-500">{task.taskId}</span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{task.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                </div>
                <div className="shrink-0">
                  {getStatusBadge(task.status)}
                </div>
              </div>

              {/* Tutor feedback and score if graded */}
              {task.status === 'COMPLETED' && task.tutorFeedback && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-800 text-[11px]">
                    <span className="flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Score: {task.score}/100 (+{task.xpAwarded || 40} XP)</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700">Graded</span>
                  </div>
                  <p className="text-slate-700 text-[11px] italic">"{task.tutorFeedback}"</p>
                </div>
              )}

              {/* Due Date & Action Row */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                <div className="flex items-center space-x-1 text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {task.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleOpenSubmit(task)}
                      className="px-3 py-1 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-lg font-semibold text-[11px] flex items-center space-x-1 transition shadow-xs"
                    >
                      <UploadCloud className="w-3 h-3" />
                      <span>{task.status === 'SUBMITTED' ? 'Resubmit' : 'Submit Work'}</span>
                    </button>
                  )}
                  {task.submissionUrl && (
                    <a
                      href={task.submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 flex items-center space-x-0.5 font-medium"
                    >
                      <span>Link</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {activeModalTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <UploadCloud className="w-4 h-4 text-purple-600" />
                <span>Submit Task: {activeModalTask.title}</span>
              </h3>
              <button 
                onClick={() => setActiveModalTask(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitTask} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold">Submission Format:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubmissionType('github')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition flex items-center justify-center space-x-1.5 ${
                      submissionType === 'github'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub Repo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmissionType('file')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition flex items-center justify-center space-x-1.5 ${
                      submissionType === 'file'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>File Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmissionType('text')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition flex items-center justify-center space-x-1.5 ${
                      submissionType === 'text'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Code / Text</span>
                  </button>
                </div>
              </div>

              {submissionType === 'github' && (
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">GitHub Repository URL:</label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/username/project-repo"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white"
                  />
                </div>
              )}

              {submissionType === 'file' && (
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Deliverable / Cloud File URL:</label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/... or https://dropbox.com/..."
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white"
                  />
                </div>
              )}

              {submissionType === 'text' && (
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Source Code / Solution Notes:</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Paste your source code or explanation here..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Student Notes to Tutor:</label>
                <textarea
                  rows={2}
                  placeholder="Optional remarks about how you implemented the challenge..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalTask(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-md shadow-purple-500/20 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Confirm Submission'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
