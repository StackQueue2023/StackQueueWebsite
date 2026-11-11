import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Users,
  AlertTriangle,
  Trophy,
  CalendarCheck2,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  FolderGit2,
  Layers,
  BookOpen,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import TutorSessionsToday from '../../components/session/TutorSessionsToday';
import WhatToTeachNextCard from '../../components/session/WhatToTeachNextCard';

export default function TrainerDashboard() {
  const cachedDash = api.peekCache?.('/trainer/dashboard');
  const cachedProg = api.peekCache?.('/tutor/progress/dashboard');

  const [data, setData] = useState(cachedDash?.data || null);
  const [progressStats, setProgressStats] = useState(cachedProg?.data || null);
  const [loading, setLoading] = useState(!cachedDash);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);

  // Feedback modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // LMS Tutor state
  const [lmsContent, setLmsContent] = useState(null);
  const [confirmConcept, setConfirmConcept] = useState(null);
  const [lmsFeedbackMsg, setLmsFeedbackMsg] = useState(null);

  const loadLmsContent = async () => {
    try {
      const res = await api.get('/lms/tutor/assigned-content');
      if (res.data.success) {
        setLmsContent(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load LMS tutor content:', err);
    }
  };

  useEffect(() => {
    async function loadDashboard(isSilent = false) {
      try {
        if (!isSilent) setLoading(true);
        const [resDash, resProg, resLeaves] = await Promise.all([
          api.get('/trainer/dashboard'),
          api.get('/tutor/progress/dashboard'),
          api.get('/attendance/leave-requests').catch(() => ({ data: { data: [] } }))
        ]);
        if (resDash.data.success) {
          setData(resDash.data.data);
        }
        if (resProg.data.success) {
          setProgressStats(resProg.data.data);
        }
        if (resLeaves.data?.success) {
          const leaves = resLeaves.data.data || [];
          const pending = leaves.filter(l => l.status === 'Pending').length;
          setPendingLeavesCount(pending);
        }
      } catch (err) {
        console.error('Failed to load trainer dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard(!!cachedDash);
    loadLmsContent();
  }, []);

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSubmittingFeedback(true);
    try {
      const res = await api.post('/trainer/feedback', {
        studentId: selectedStudent._id,
        title: feedbackTitle,
        comments: feedbackComment,
        rating: feedbackRating
      });
      if (res.data.success) {
        alert('Feedback sent successfully to student dashboard!');
        setSelectedStudent(null);
        setFeedbackTitle('');
        setFeedbackComment('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleUpdateConceptStatus = async (conceptId, newStatus) => {
    try {
      const res = await api.put(`/lms/concepts/${conceptId}/status`, { status: newStatus });
      if (res.data.success) {
        setLmsFeedbackMsg(res.data.message || 'Concept status updated');
        loadLmsContent();
        setTimeout(() => setLmsFeedbackMsg(null), 6000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating concept status');
    }
  };

  const executeConceptCompletion = async () => {
    if (!confirmConcept) return;
    await handleUpdateConceptStatus(confirmConcept._id, 'COMPLETED');
    setConfirmConcept(null);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const topPerformers = data?.topPerformers || [];
  const failedAttempts = data?.failedAttempts || [];
  const att = data?.todayAttendanceCount || { marked: 0, present: 0, absent: 0 };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50/60 via-fuchsia-50/40 to-pink-50/50 border border-purple-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-purple-100/90 via-fuchsia-100/90 to-pink-100/90 px-3.5 py-1 rounded-full border border-purple-200/80 shadow-2xs">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>Trainer Command Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Student Supervision & Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Monitor real-time game attempts, evaluate failed challenges, submit daily college training logs, and coach students.
          </p>
        </div>
      </div>

      {/* ── PENDING LEAVE REQUESTS ALERT BANNER ── */}
      {pendingLeavesCount > 0 && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-amber-100/90 rounded-xl text-amber-700 shadow-2xs">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider font-mono">Action Required</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 font-mono">
                  {pendingLeavesCount} Pending
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">
                Student Leave Approval Requests Awaiting Review
              </h3>
              <p className="text-xs text-slate-600">
                You have {pendingLeavesCount} pending student leave submission(s). Review and approve or reject with justification.
              </p>
            </div>
          </div>
          <Link
            to="/trainer/attendance?tab=leave_requests"
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 shrink-0"
          >
            <span>Review Requests</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Learning */}
        <div className="bg-white border border-slate-200/90 shadow-sm p-4 rounded-2xl space-y-1.5 relative overflow-hidden">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Current Learning</span>
          {progressStats?.currentLearning ? (
            <>
              <p className="text-base font-black text-slate-900 truncate">{progressStats.currentLearning.courseName}</p>
              <span className="text-[11px] text-pink-600 font-bold block">{progressStats.currentLearning.topicsCount} Topics Logged</span>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-slate-400 italic">No Current Learning</p>
              <span className="text-[11px] text-slate-400 block">You haven't recorded today's learning progress yet.</span>
            </>
          )}
        </div>

        {/* Card 2: Active Project */}
        <div className="bg-white border border-slate-200/90 shadow-sm p-4 rounded-2xl space-y-1.5">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Active Project</span>
          {progressStats?.activeProject ? (
            <>
              <p className="text-base font-black text-slate-900 truncate">{progressStats.activeProject.projectName}</p>
              <div className="flex items-center space-x-2">
                <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200">
                  <div className="bg-gradient-to-r from-pink-500 to-violet-600 h-full rounded-full" style={{ width: `${progressStats.activeProject.progressPercentage}%` }} />
                </div>
                <span className="text-[11px] font-mono font-bold text-purple-700">{progressStats.activeProject.progressPercentage}%</span>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-slate-400 italic">No Active Project</p>
              <span className="text-[11px] text-slate-400 block">No active project currently recorded.</span>
            </>
          )}
        </div>

        {/* Card 3: College Training */}
        <div className="bg-white border border-slate-200/90 shadow-sm p-4 rounded-2xl space-y-1.5">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">College Training</span>
          {progressStats?.collegeTraining ? (
            <>
              <p className="text-base font-black text-slate-900 truncate">{progressStats.collegeTraining.collegeName}</p>
              <span className="text-[11px] text-purple-700 font-bold block">Day {progressStats.collegeTraining.currentDay} / {progressStats.collegeTraining.totalDays}</span>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-slate-400 italic">No College Training</p>
              <span className="text-[11px] text-slate-400 block">No college training assigned.</span>
            </>
          )}
        </div>

        {/* Card 4: Interview Performance */}
        <div className="bg-white border border-slate-200/90 shadow-sm p-4 rounded-2xl space-y-1.5">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Interview Performance</span>
          {progressStats?.interviewStats?.total > 0 ? (
            <>
              <p className="text-base font-black text-slate-900 font-mono">{progressStats.interviewStats.total} Interviews</p>
              <span className="text-[11px] text-emerald-600 font-bold block">
                {progressStats.interviewStats.passed} Passed · {progressStats.interviewStats.failed} Failed · {progressStats.interviewStats.pending} Pending
              </span>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-slate-400 italic">No Interviews</p>
              <span className="text-[11px] text-slate-400 block">No college training interviews recorded.</span>
            </>
          )}
        </div>
      </div>

      {/* ── TODAY'S LIVE CLASSES (ONLINE & OFFLINE) ── */}
      <TutorSessionsToday />

      {/* ── TUTOR WORKSPACE MODULES HUB ── */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-50 via-fuchsia-50 to-purple-50 border border-pink-200/80 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider shadow-2xs">
            <BookOpen className="w-4 h-4 text-pink-600" />
            <span className="bg-gradient-to-r from-pink-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent font-extrabold">
              Student Module Lock &amp; Unlock Gate
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
            Student Domain Syllabus Control
          </h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed font-medium">
            All modules start 🔒 <strong className="text-slate-900 font-bold">Locked</strong> by default. Set a student's module to ⚡ <strong className="text-amber-700 font-bold">Processing</strong> to unlock it, or ✅ <strong className="text-emerald-700 font-bold">Completed</strong> when finished.
          </p>
        </div>
        <Link
          to="/trainer/students"
          className="relative z-10 px-4 py-2.5 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Users className="w-4 h-4" />
          <span>Manage Student Modules →</span>
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">
              Tutor Studio Hub
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Training & batch management controls
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              to: '/trainer/students',
              title: 'Assigned Students',
              desc: 'Monitor, guide & review your assigned college learners',
              icon: Users,
              color: 'text-purple-700',
              bg: 'bg-purple-50',
              border: 'border-purple-200',
              badge: 'Learners'
            },
            {
              to: '/trainer/learning-progress',
              title: 'Learning & Progress',
              desc: 'Record course learning, project daily steps & failure analysis',
              icon: GraduationCap,
              color: 'text-pink-600',
              bg: 'bg-pink-50',
              border: 'border-pink-200',
              badge: 'Progress'
            },
            {
              to: '/projects',
              title: 'Review Projects',
              desc: 'Grade capstone submissions and industry deliverables',
              icon: FolderGit2,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              border: 'border-amber-200',
              badge: 'Projects'
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="bg-white border border-slate-200/90 hover:border-purple-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`p-2.5 rounded-xl ${item.bg} ${item.border} border ${item.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${item.bg} ${item.color} border ${item.border}`}>
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-purple-700 transition-colors">
                  <span>Open Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* LMS Concept Completion & Status Message */}
      {lmsFeedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{lmsFeedbackMsg}</span>
        </div>
      )}

      {/* TUTOR CONCEPT MANAGEMENT (Section 34 & 35) */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
              Institute LMS Workflow
            </span>
            <h2 className="text-lg font-black text-slate-900">
              Tutor Concept Management & Task Unlock Gate
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Student tasks remain 🔒 LOCKED until you mark concept COMPLETED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(lmsContent?.concepts || []).map((cpt) => {
            const isCompleted = cpt.tutorStatus === 'COMPLETED';
            const isInProgress = cpt.tutorStatus === 'IN_PROGRESS';

            return (
              <div
                key={cpt._id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {cpt.moduleId?.title || 'Module'}
                    </span>
                    {isCompleted ? (
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-200 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Completed ✓</span>
                      </span>
                    ) : isInProgress ? (
                      <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>In Progress 🔄</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-slate-200 text-slate-600 text-[11px] font-bold rounded-full">
                        Not Started ○
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    {cpt.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {cpt.courseId?.title || 'Java Full Stack'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  {!isCompleted ? (
                    <div className="space-y-1.5">
                      <button
                        onClick={() => setConfirmConcept(cpt)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>MARK CONCEPT COMPLETED</span>
                      </button>

                      {!isInProgress && (
                        <button
                          onClick={() => handleUpdateConceptStatus(cpt._id, 'IN_PROGRESS')}
                          className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition"
                        >
                          Set to In Progress
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-700 font-semibold">
                        Student tasks unlocked 🔓
                      </span>
                      <button
                        onClick={() => handleUpdateConceptStatus(cpt._id, 'IN_PROGRESS')}
                        className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium"
                      >
                        Reopen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal for Marking Concept Completed (Section 34) */}
      {confirmConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-900">Are you sure?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Once completed, student tasks for <strong>"{confirmConcept.title}"</strong> will be unlocked immediately for all enrolled students.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmConcept(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={executeConceptCompletion}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Confirm & Unlock Tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Teaching Sessions Today & Curriculum Sequencer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <TutorSessionsToday />
        </div>
        <div className="lg:col-span-4">
          <WhatToTeachNextCard />
        </div>
      </div>

      {/* 2-Column Section: Failed Challenge Review & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Failed Challenges Alert Box (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 shadow-sm p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Failed Challenge Submissions (Triage)</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Recent Student Attempts</span>
          </div>

          <div className="space-y-2.5">
            {failedAttempts.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No failed attempts recorded today.</p>
            ) : (
              failedAttempts.map((att) => (
                <div key={att._id} className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{att.studentId?.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                        {att.gameSlug ? att.gameSlug.replace(/-/g, ' ').toUpperCase() : 'GAME'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{att.challengeId?.title || 'Challenge Attempt'}</p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedStudent(att.studentId);
                      setFeedbackTitle(`Assistance with ${att.challengeId?.title || 'Challenge'}`);
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition shadow-md shadow-purple-500/20 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Send Guidance</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performers (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 shadow-sm p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>Top Batch Performers</span>
            </div>
            <Link to="/trainer/students" className="text-[11px] text-purple-700 font-bold hover:underline">View Roster</Link>
          </div>

          <div className="space-y-2.5">
            {topPerformers.map((sp, idx) => (
              <div key={sp._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-amber-500 text-sm">#{idx + 1}</span>
                  <div>
                    <p className="font-bold text-slate-900">{sp.userId?.name}</p>
                    <p className="text-[10px] text-slate-500">{sp.batchId?.name} • {sp.stats?.accuracyRate || 90}% Acc</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-amber-600 font-bold">{sp.totalXp} XP</span>
                  <p className="text-[10px] text-slate-500">Lv.{sp.currentLevel?.level || 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <span>Send Trainer Feedback to {selectedStudent.name}</span>
            </h2>

            <form onSubmit={handleSendFeedback} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Feedback Title:</label>
                <input
                  type="text"
                  required
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Comments & Guidance:</label>
                <textarea
                  rows={4}
                  required
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Explain the solution concept, point out off-by-one errors, or recommend specific practice games..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Rating (1 to 5 Stars):</label>
                <select
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Good Progress)</option>
                  <option value={3}>⭐⭐⭐ (3 - Needs Attention)</option>
                  <option value={2}>⭐⭐ (2 - Action Required)</option>
                  <option value={1}>⭐ (1 - Critical Support)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-lg shadow-purple-500/25 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingFeedback ? 'Sending...' : 'Dispatch Feedback'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
