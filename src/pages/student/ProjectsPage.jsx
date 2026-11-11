import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import projectApi from '../../api/projectApi';
import api from '../../api/client';
import { triggerConfetti } from '../../components/gamification/Confetti';

// Import All 6 Project Modals
import CreateProjectModal from '../../components/projects/CreateProjectModal';
import AssignProjectModal from '../../components/projects/AssignProjectModal';
import StudentSubmissionModal from '../../components/projects/StudentSubmissionModal';
import TutorReviewModal from '../../components/projects/TutorReviewModal';
import AdminApprovalModal from '../../components/projects/AdminApprovalModal';
import PublicProjectDetailModal from '../../components/projects/PublicProjectDetailModal';

import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Github,
  Download,
  Sparkles,
  Layers,
  Eye,
  Send,
  RefreshCw,
  FileText,
  ChevronRight,
  Globe,
  ShieldCheck,
  Award,
  Users,
  Code2,
  Lock,
  GitCommit,
  Calendar,
  AlertCircle,
  Check,
  X,
  History,
  Trophy,
  BookOpen
} from 'lucide-react';

export default function ProjectsPage() {
  const { user, loading: authLoading, isAdmin, isTutor } = useAuth();
  const navigate = useNavigate();

  // Role detection
  const isStudent = user?.role === 'student' || (!isAdmin && !isTutor && !!user);

  // Authentication Guard: Redirect unauthenticated visitors/logged-out users to login immediately
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Active Tab state per role
  const [adminTab, setAdminTab] = useState('all-projects'); // 'requirements' | 'pending' | 'all-projects'
  const [tutorTab, setTutorTab] = useState('assignments'); // 'requirements' | 'assignments'
  const [studentTab, setStudentTab] = useState('my-projects'); // 'my-projects' | 'history' | 'kanban'

  // Loading states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Data collections
  const [requirements, setRequirements] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allProjectsLibrary, setAllProjectsLibrary] = useState([]);
  const [tutorRequirements, setTutorRequirements] = useState([]);
  const [tutorAssignments, setTutorAssignments] = useState([]);
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [selectedStudentProject, setSelectedStudentProject] = useState(null);

  // Kanban Tasks state (for student sprint tracking)
  const [tasks, setTasks] = useState([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReqForEdit, setSelectedReqForEdit] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedReqForAssign, setSelectedReqForAssign] = useState(null);

  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState(null);

  const [isTutorReviewModalOpen, setIsTutorReviewModalOpen] = useState(false);
  const [selectedAssignmentForReview, setSelectedAssignmentForReview] = useState(null);

  const [isAdminApprovalModalOpen, setIsAdminApprovalModalOpen] = useState(false);
  const [selectedAssignmentForApproval, setSelectedAssignmentForApproval] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState(null);

  // Fetch data based on role
  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (isAdmin) {
        const [reqRes, pendRes, allRes] = await Promise.allSettled([
          projectApi.getRequirements(),
          projectApi.getPendingAdminApprovals(),
          projectApi.getAllProjectsLibrary()
        ]);
        if (reqRes.status === 'fulfilled' && reqRes.value?.data?.success) setRequirements(reqRes.value.data.data);
        if (pendRes.status === 'fulfilled' && pendRes.value?.data?.success) setPendingApprovals(pendRes.value.data.data);
        if (allRes.status === 'fulfilled' && allRes.value?.data?.success) setAllProjectsLibrary(allRes.value.data.data);
      } else if (isTutor) {
        const [reqRes, assignRes] = await Promise.allSettled([
          projectApi.getTutorRequirements(),
          projectApi.getTutorAssignments()
        ]);
        if (reqRes.status === 'fulfilled' && reqRes.value?.data?.success) setTutorRequirements(reqRes.value.data.data);
        if (assignRes.status === 'fulfilled' && assignRes.value?.data?.success) setTutorAssignments(assignRes.value.data.data);
      } else if (isStudent) {
        // Clear previous student's data before loading fresh records
        setStudentAssignments([]);
        setSelectedStudentProject(null);
        setTasks([]);

        const res = await projectApi.getStudentProjects();
        if (res.data?.success) {
          const freshAssignments = res.data.data || [];
          setStudentAssignments(freshAssignments);
          if (freshAssignments.length > 0) {
            setSelectedStudentProject(freshAssignments[0]);
            loadLegacyTasks(freshAssignments[0]._id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load project workspace data:', err);
      if (err.response?.status === 401) {
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadLegacyTasks = async (assignmentId) => {
    if (!assignmentId || !user) return;
    try {
      const res = await api.get(`/projects/${assignmentId}`);
      if (res.data?.success && res.data.data?.tasks?.length > 0) {
        setTasks(res.data.data.tasks);
      } else {
        setTasks([]);
      }
    } catch {
      setTasks([]);
    }
  };

  useEffect(() => {
    if (!user) {
      // Clear all project state immediately upon logout or when user is null
      setRequirements([]);
      setPendingApprovals([]);
      setAllProjectsLibrary([]);
      setTutorRequirements([]);
      setTutorAssignments([]);
      setStudentAssignments([]);
      setSelectedStudentProject(null);
      setTasks([]);
      setLoading(false);
      return;
    }
    loadData();
  }, [user?._id, isAdmin, isTutor]);

  // Admin: Toggle homepage publication
  const handleToggleHomepage = async (assignmentId, currentStatus) => {
    try {
      setActionLoading(true);
      const res = await projectApi.toggleHomepagePublication(assignmentId, !currentStatus);
      if (res.data.success) {
        setAllProjectsLibrary(prev =>
          prev.map(p => p._id === assignmentId ? { ...p, isPublishedToHomepage: !currentStatus } : p)
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update homepage status');
    } finally {
      setActionLoading(false);
    }
  };

  // Admin: Retry GitHub sync
  const handleRetryGitHubSync = async (assignmentId) => {
    try {
      setActionLoading(true);
      const res = await projectApi.retryGitHubSync(assignmentId);
      if (res.data.success) {
        alert(res.data.message || 'GitHub replication initiated successfully!');
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'GitHub replication failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Admin: Update Requirement Status
  const handleUpdateReqStatus = async (reqId, newStatus) => {
    try {
      setActionLoading(true);
      const res = await projectApi.updateRequirementStatus(reqId, newStatus);
      if (res.data.success) {
        setRequirements(prev =>
          prev.map(r => r._id === reqId ? { ...r, status: newStatus } : r)
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  // Student: Task status toggle in Kanban
  const handleTaskStatusToggle = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    if (newStatus === 'Completed') {
      triggerConfetti();
    }
  };

  // Filter helper for All Projects
  const filteredAllProjects = useMemo(() => {
    return allProjectsLibrary.filter(item => {
      const title = item.projectRequirementId?.title || '';
      const sName = item.studentId?.name || '';
      const tName = item.tutorId?.name || '';
      const cat = item.projectRequirementId?.category || '';
      const tech = (item.projectRequirementId?.technologies || []).join(' ');

      const matchesSearch =
        searchQuery === '' ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || item.status === statusFilter;

      const matchesCategory =
        categoryFilter === 'All' || cat === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [allProjectsLibrary, searchQuery, statusFilter, categoryFilter]);

  // Status badge styling helper
  const renderStatusBadge = (status) => {
    const map = {
      'Assigned': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'In Progress': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
      'Submitted': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      'Tutor Review': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      'Revision Required': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
      'Resubmitted': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      'Sent for Admin Approval': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
      'Approved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'Rejected': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' }
    };
    const c = map[status] || { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text} border ${c.border} inline-flex items-center gap-1`}>
        {status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
        {status === 'Revision Required' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
        {status}
      </span>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
          <Clock className="w-5 h-5 animate-spin text-purple-600" />
          <span>Verifying authentication session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* ────────────────────────────────────────────────────────────────────────
          HERO BANNER (Lavender-Purple-Pink System)
         ──────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-50/90 via-fuchsia-50/50 to-pink-50/90 border border-purple-200/80 p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="w-72 h-72 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none absolute -right-20 -top-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-100/80 text-purple-800 border border-purple-200">
              <FolderGit2 className="w-3.5 h-3.5 text-purple-600" />
              <span>
                {isAdmin ? 'Institute Admin Projects & Tasks' : isTutor ? 'Tutor Review & Project Studio' : 'Student Capstone Studio'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isAdmin ? 'Projects & Tasks Management' : isTutor ? 'Project Assignments & Code Review' : 'My Final Projects'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {isAdmin
                ? 'Design industry-grade project requirements, supervise tutor evaluations, conduct final executive testing, and automatically mirror approved software into the official institute GitHub repository.'
                : isTutor
                ? 'Assign capstone projects to students, conduct rigorous code reviews with line remarks, identify bugs, and submit verified repositories to the admin for final institute testing.'
                : 'Build production-ready software matching enterprise specifications. Earn 500 XP and get your codebase officially published to the institute GitHub and homepage showcase!'}
            </p>
          </div>

          {/* Quick Header CTA */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isAdmin && (
              <button
                onClick={() => {
                  setSelectedReqForEdit(null);
                  setIsCreateModalOpen(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-102"
              >
                <Plus className="w-4 h-4" />
                <span>New Project Requirement</span>
              </button>
            )}

            {isTutor && (
              <button
                onClick={() => {
                  setSelectedReqForAssign(null);
                  setIsAssignModalOpen(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-102"
              >
                <Users className="w-4 h-4" />
                <span>Assign Project to Student</span>
              </button>
            )}

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 bg-white text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded-xl border border-purple-200 transition shadow-2xs"
              title="Refresh project data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          ADMIN VIEW: Tabs (All Projects Library | Pending Approvals | Requirements CMS)
         ──────────────────────────────────────────────────────────────────────── */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Admin Navigation Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-100 pb-3">
            <div className="flex items-center gap-2 bg-purple-50/60 p-1 rounded-2xl border border-purple-100">
              <button
                onClick={() => setAdminTab('all-projects')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  adminTab === 'all-projects'
                    ? 'bg-white text-purple-900 shadow-sm border border-purple-200'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <Layers className="w-4 h-4 text-purple-600" />
                <span>All Projects Library</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-mono">
                  {allProjectsLibrary.length}
                </span>
              </button>

              <button
                onClick={() => setAdminTab('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  adminTab === 'pending'
                    ? 'bg-white text-purple-900 shadow-sm border border-purple-200'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <Clock className="w-4 h-4 text-cyan-600" />
                <span>Pending Final Approval</span>
                {pendingApprovals.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-100 text-cyan-800 font-mono animate-pulse">
                    {pendingApprovals.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setAdminTab('requirements')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  adminTab === 'requirements'
                    ? 'bg-white text-purple-900 shadow-sm border border-purple-200'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <FileText className="w-4 h-4 text-pink-600" />
                <span>Requirements CMS</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-100 text-pink-800 font-mono">
                  {requirements.length}
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: ALL PROJECTS CENTRALIZED LIBRARY (SECTION 8) */}
          {adminTab === 'all-projects' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-purple-100 shadow-xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, student, tutor, or tech stack..."
                    className="w-full pl-9 pr-4 py-2 bg-purple-50/30 border border-purple-100 rounded-xl text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Tutor Review">Tutor Review</option>
                    <option value="Revision Required">Revision Required</option>
                    <option value="Sent for Admin Approval">Sent for Admin Approval</option>
                    <option value="Approved">Approved</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Full Stack Development">Full Stack</option>
                    <option value="Frontend Development">Frontend</option>
                    <option value="Backend Development">Backend</option>
                    <option value="AI & Machine Learning">AI & ML</option>
                    <option value="Data Science & Analytics">Data Science</option>
                    <option value="Mobile App Development">Mobile App</option>
                    <option value="Cloud Computing & DevOps">DevOps</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>
              </div>

              {/* Table / Cards */}
              {loading ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">Loading institute project library...</p>
                </div>
              ) : filteredAllProjects.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-purple-200">
                  <FolderGit2 className="w-10 h-10 text-purple-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No project assignments found matching criteria</p>
                  <p className="text-xs text-slate-500 mt-1">Assign requirements to students to start tracking deliverables.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-purple-50/60 border-b border-purple-100 text-[11px] font-mono uppercase tracking-wider text-purple-900 font-bold">
                          <th className="py-3 px-4">Project</th>
                          <th className="py-3 px-4">Student & Tutor</th>
                          <th className="py-3 px-4">Status & Version</th>
                          <th className="py-3 px-4">GitHub Sync</th>
                          <th className="py-3 px-4">Homepage</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-50 text-xs">
                        {filteredAllProjects.map((item) => {
                          const req = item.projectRequirementId;
                          const student = item.studentId;
                          const tutor = item.tutorId;
                          const isApproved = item.status === 'Approved';

                          return (
                            <tr key={item._id} className="hover:bg-purple-50/30 transition-colors">
                              {/* Project info */}
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                      {req?.projectId || 'PRJ'}
                                    </span>
                                    <span className="font-bold text-slate-900 line-clamp-1">
                                      {req?.title || 'Untitled Project'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-medium">
                                    {req?.category} • {req?.difficulty}
                                  </div>
                                </div>
                              </td>

                              {/* Student & Tutor */}
                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <div className="font-bold text-slate-800">
                                    {student?.name || 'Unassigned'}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    Reviewer: {tutor?.name || 'Tutor'}
                                  </div>
                                </div>
                              </td>

                              {/* Status & Version */}
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  {renderStatusBadge(item.status)}
                                  <div className="text-[10px] font-mono text-slate-500">
                                    V{item.currentVersion || 1} • Deadline: {item.studentDeadline ? new Date(item.studentDeadline).toLocaleDateString() : 'N/A'}
                                  </div>
                                </div>
                              </td>

                              {/* GitHub Sync Status */}
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  {item.syncedToGithub ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Replicated
                                    </span>
                                  ) : item.githubSyncError ? (
                                    <div className="space-y-1">
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                                        Failed
                                      </span>
                                      <button
                                        onClick={() => handleRetryGitHubSync(item._id)}
                                        className="block text-[10px] text-purple-600 hover:text-purple-800 font-bold underline"
                                      >
                                        Retry Sync
                                      </button>
                                    </div>
                                  ) : isApproved ? (
                                    <span className="text-[10px] text-amber-700 font-mono font-bold bg-amber-50 px-2 py-0.5 rounded">
                                      Pending Sync
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      Not Approved
                                    </span>
                                  )}

                                  {item.destinationGithubRepoUrl && (
                                    <a
                                      href={item.destinationGithubRepoUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-1 text-[10px] text-purple-700 hover:underline font-mono"
                                    >
                                      <Github className="w-3 h-3" />
                                      <span>Institute Repo</span>
                                    </a>
                                  )}
                                </div>
                              </td>

                              {/* Homepage Toggle */}
                              <td className="py-3 px-4">
                                {isApproved ? (
                                  <button
                                    onClick={() => handleToggleHomepage(item._id, item.isPublishedToHomepage)}
                                    disabled={actionLoading}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1.5 ${
                                      item.isPublishedToHomepage
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    <Globe className="w-3 h-3" />
                                    <span>{item.isPublishedToHomepage ? 'Live on Home' : 'Hidden'}</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">Needs approval</span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {/* Download Full ZIP */}
                                  <a
                                    href={projectApi.downloadProjectZipUrl(item._id)}
                                    className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition"
                                    title="Download Cleansed Project ZIP"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>

                                  {/* View Specs & Details Modal */}
                                  <button
                                    onClick={() => {
                                      setSelectedProjectForDetail(item);
                                      setIsDetailModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition"
                                    title="View Full Specifications"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENDING FINAL APPROVALS (SECTION 6) */}
          {adminTab === 'pending' && (
            <div className="space-y-4">
              <div className="bg-cyan-50/50 p-4 rounded-2xl border border-cyan-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-cyan-950 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-600" />
                    Final Executive Review Queue
                  </h3>
                  <p className="text-xs text-cyan-800">
                    These projects have been verified and endorsed by the assigned tutors. Review the testing results, inspect the locked GitHub commit, approve institute replication, or request revisions.
                  </p>
                </div>
                <span className="px-3 py-1 bg-cyan-200 text-cyan-900 rounded-full font-mono text-xs font-bold">
                  {pendingApprovals.length} Pending
                </span>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-purple-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">All submissions have been reviewed!</p>
                  <p className="text-xs text-slate-500 mt-1">When tutors submit approved student code for final testing, it will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingApprovals.map((item) => {
                    const req = item.projectRequirementId;
                    const student = item.studentId;
                    const tutor = item.tutorId;

                    return (
                      <div
                        key={item._id}
                        className="bg-white rounded-2xl border border-purple-100 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                              {req?.projectId}
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 px-2.5 py-0.5 rounded-full border border-cyan-200">
                              V{item.currentVersion} • Locked Commit
                            </span>
                          </div>

                          <h4 className="text-base font-black text-slate-900">
                            {req?.title}
                          </h4>

                          <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-100 text-xs space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Student:</span>
                              <strong className="text-slate-900">{student?.name}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Endorsing Tutor:</span>
                              <strong className="text-slate-900">{tutor?.name}</strong>
                            </div>
                            <div className="flex justify-between font-mono">
                              <span className="text-slate-500">Commit SHA:</span>
                              <span className="text-purple-700 font-bold">{item.approvedCommitSha?.slice(0, 10) || 'HEAD'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-purple-50 flex items-center justify-between gap-3">
                          <button
                            onClick={() => {
                              setSelectedProjectForDetail(item);
                              setIsDetailModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-purple-700"
                          >
                            View Specs
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAssignmentForApproval(item);
                              setIsAdminApprovalModalOpen(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-[#8B2BE2] to-[#B829B6] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:scale-102"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Executive Review & Test</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REQUIREMENTS CMS (SECTION 1) */}
          {adminTab === 'requirements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">
                  Master Project Specifications
                </h3>
                <button
                  onClick={() => {
                    setSelectedReqForEdit(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Requirement</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requirements.map((req) => (
                  <div
                    key={req._id}
                    className="bg-white rounded-2xl border border-purple-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {req.projectId}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          req.status === 'Published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-slate-900 line-clamp-1">
                        {req.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {req.description}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {(req.technologies || []).slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100"
                          >
                            {t}
                          </span>
                        ))}
                        {(req.technologies || []).length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            +{req.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-purple-50 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-slate-500 font-normal text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        <span>{req.deadlineDays || 30} Days</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedReqForEdit(req);
                            setIsCreateModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleUpdateReqStatus(req._id, req.status === 'Published' ? 'Draft' : 'Published')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        >
                          {req.status === 'Published' ? 'Unpublish' : 'Publish'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          TUTOR VIEW: Tabs (Assigned Student Submissions | Available Requirements)
         ──────────────────────────────────────────────────────────────────────── */}
      {isTutor && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 bg-purple-50/60 p-1 rounded-2xl border border-purple-100 w-fit">
            <button
              onClick={() => setTutorTab('assignments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                tutorTab === 'assignments'
                  ? 'bg-white text-purple-900 shadow-sm border border-purple-200'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              <Users className="w-4 h-4 text-purple-600" />
              <span>Assigned Student Submissions</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-mono">
                {tutorAssignments.length}
              </span>
            </button>

            <button
              onClick={() => setTutorTab('requirements')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                tutorTab === 'requirements'
                  ? 'bg-white text-purple-900 shadow-sm border border-purple-200'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              <BookOpen className="w-4 h-4 text-pink-600" />
              <span>Available Requirements Library</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-100 text-pink-800 font-mono">
                {tutorRequirements.length}
              </span>
            </button>
          </div>

          {/* TUTOR TAB 1: Assigned Student Submissions & Code Review (Section 4 & 5) */}
          {tutorTab === 'assignments' && (
            <div className="space-y-4">
              {tutorAssignments.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-purple-200">
                  <Users className="w-10 h-10 text-purple-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No active student assignments</p>
                  <p className="text-xs text-slate-500 mt-1">Assign an institute project requirement to an individual student to begin mentoring.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutorAssignments.map((item) => {
                    const req = item.projectRequirementId;
                    const student = item.studentId;
                    const canReview = ['Submitted', 'Tutor Review', 'Revision Required', 'Resubmitted'].includes(item.status);

                    return (
                      <div
                        key={item._id}
                        className="bg-white rounded-2xl border border-purple-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              {req?.projectId}
                            </span>
                            {renderStatusBadge(item.status)}
                          </div>

                          <h4 className="text-base font-black text-slate-900">
                            {req?.title}
                          </h4>

                          <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-100 text-xs space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Assigned Student:</span>
                              <strong className="text-slate-900">{student?.name}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Student Deadline:</span>
                              <strong className="text-purple-700 font-mono">
                                {item.studentDeadline ? new Date(item.studentDeadline).toLocaleDateString() : 'No limit'}
                              </strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Current Version:</span>
                              <strong className="text-slate-800 font-mono">V{item.currentVersion}</strong>
                            </div>
                          </div>

                          {item.tutorInstructions && (
                            <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                              <strong>Tutor Instructions:</strong> {item.tutorInstructions}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-purple-50 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setSelectedProjectForDetail(item);
                              setIsDetailModalOpen(true);
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-purple-700"
                          >
                            View Specs
                          </button>

                          <div className="flex items-center gap-2">
                            {item.destinationGithubRepoUrl && (
                              <a
                                href={item.destinationGithubRepoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1"
                              >
                                <Github className="w-3.5 h-3.5" />
                                <span>Repo</span>
                              </a>
                            )}

                            <button
                              onClick={() => {
                                setSelectedAssignmentForReview(item);
                                setIsTutorReviewModalOpen(true);
                              }}
                              className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all ${
                                canReview
                                  ? 'bg-gradient-to-r from-[#8B2BE2] to-[#B829B6] text-white shadow-xs hover:scale-102'
                                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                              }`}
                            >
                              <Code2 className="w-3.5 h-3.5" />
                              <span>{canReview ? 'Review & Submit to Admin' : 'View Submission Log'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TUTOR TAB 2: Available Requirements Library (Section 2) */}
          {tutorTab === 'requirements' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutorRequirements.map((req) => (
                  <div
                    key={req._id}
                    className="bg-white rounded-2xl border border-purple-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {req.projectId}
                        </span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                          {req.difficulty}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-slate-900 line-clamp-1">
                        {req.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {req.description}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {(req.technologies || []).slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-purple-50 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedProjectForDetail(req);
                          setIsDetailModalOpen(true);
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-purple-700"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => {
                          setSelectedReqForAssign(req);
                          setIsAssignModalOpen(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-[#8B2BE2] to-[#B829B6] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:scale-102"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Assign to Student</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          STUDENT VIEW: My Final Projects (Section 3)
         ──────────────────────────────────────────────────────────────────────── */}
      {isStudent && (
        <div className="space-y-6">
          {/* XP Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  Institute Capstone Milestone (+500 XP)
                </h4>
                <p className="text-[11px] text-slate-600">
                  Build and deliver your assigned software project. Once verified by your tutor and approved by institute administrators, your repository will be replicated to the institute GitHub and showcased on the public homepage!
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-2 bg-purple-50/60 p-1 rounded-2xl border border-purple-100 w-fit">
            <button
              onClick={() => setStudentTab('my-projects')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                studentTab === 'my-projects'
                  ? 'bg-white text-purple-900 shadow-sm border border-purple-200'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              <FolderGit2 className="w-4 h-4 text-purple-600" />
              <span>Active Final Deliveries</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-mono">
                {studentAssignments.length}
              </span>
            </button>

            <button
              onClick={() => setStudentTab('kanban')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                studentTab === 'kanban'
                  ? 'bg-white text-purple-900 shadow-sm border border-purple-200'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              <Layers className="w-4 h-4 text-pink-600" />
              <span>Sprint Task Board</span>
            </button>
          </div>

          {/* STUDENT TAB 1: Active Final Deliveries */}
          {studentTab === 'my-projects' && (
            <div className="space-y-6">
              {studentAssignments.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-purple-200">
                  <FolderGit2 className="w-10 h-10 text-purple-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Final Projects Assigned Yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Your assigned tutor will review your curriculum progress and assign your final capstone project.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Project Cards */}
                  <div className="lg:col-span-5 space-y-4">
                    {studentAssignments.map((item) => {
                      const req = item.projectRequirementId;
                      const isSelected = selectedStudentProject?._id === item._id;

                      return (
                        <div
                          key={item._id}
                          onClick={() => {
                            setSelectedStudentProject(item);
                            loadLegacyTasks(item._id);
                          }}
                          className={`cursor-pointer rounded-2xl p-5 border transition-all space-y-3 ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-50/90 to-pink-50/60 border-purple-300 shadow-md ring-2 ring-purple-400/20'
                              : 'bg-white border-purple-100 hover:border-purple-200 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-100/80 px-2 py-0.5 rounded border border-purple-200">
                              {req?.projectId}
                            </span>
                            {renderStatusBadge(item.status)}
                          </div>

                          <h4 className="text-base font-black text-slate-900">
                            {req?.title}
                          </h4>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {req?.description}
                          </p>

                          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-purple-100/60">
                            <span className="text-slate-500">
                              Tutor: <strong className="text-slate-800">{item.tutorId?.name}</strong>
                            </span>
                            <span className="font-mono text-purple-700 font-bold">
                              V{item.currentVersion}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: Selected Project Deep Dive & Submission Control */}
                  {selectedStudentProject && (
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-purple-100 p-6 shadow-xs space-y-6">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-purple-50">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                              {selectedStudentProject.projectRequirementId?.projectId}
                            </span>
                            {renderStatusBadge(selectedStudentProject.status)}
                          </div>
                          <h3 className="text-xl font-black text-slate-900">
                            {selectedStudentProject.projectRequirementId?.title}
                          </h3>
                        </div>

                        {/* Submission CTA */}
                        {['Assigned', 'Revision Required'].includes(selectedStudentProject.status) ? (
                          <button
                            onClick={() => {
                              setSelectedAssignmentForSubmit(selectedStudentProject);
                              setIsSubmissionModalOpen(true);
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-102 shrink-0 self-start sm:self-auto"
                          >
                            <Send className="w-4 h-4" />
                            <span>{selectedStudentProject.status === 'Revision Required' ? 'Resubmit Revision' : 'Submit Deliverables'}</span>
                          </button>
                        ) : selectedStudentProject.status === 'Approved' ? (
                          <span className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Approved & Published
                          </span>
                        ) : (
                          <span className="px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
                            <Lock className="w-4 h-4 text-amber-600" />
                            Under Code Review (Locked)
                          </span>
                        )}
                      </div>

                      {/* TUTOR REMARKS HIGHLIGHT (IF REVISION REQUIRED) */}
                      {selectedStudentProject.status === 'Revision Required' && (
                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Action Required: Tutor Requested Corrections</span>
                          </div>
                          <p className="text-xs text-rose-900 leading-relaxed font-medium">
                            Your tutor has evaluated your project and requested corrections before this work can be submitted to institute administrators for final testing. Check the remarks below, update your GitHub repository, and click "Resubmit Revision".
                          </p>
                        </div>
                      )}

                      {/* APPROVED SHOWCASE BANNER */}
                      {selectedStudentProject.status === 'Approved' && (
                        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Official Institute Publication
                            </span>
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-mono">
                              +500 XP Earned
                            </span>
                          </div>
                          <p className="text-xs text-emerald-900 leading-relaxed">
                            Congratulations! Your software implementation passed tutor inspection and executive admin testing. Your project has been replicated to the institute repository and featured in the public portfolio!
                          </p>
                          {selectedStudentProject.destinationGithubRepoUrl && (
                            <a
                              href={selectedStudentProject.destinationGithubRepoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
                            >
                              <Github className="w-4 h-4" />
                              <span>View Official Institute Repository</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Problem Statement & Description */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">
                          Problem Statement & Objectives
                        </h4>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-purple-50/40 p-4 rounded-xl border border-purple-100">
                          {selectedStudentProject.projectRequirementId?.problemStatement || selectedStudentProject.projectRequirementId?.description}
                        </p>
                      </div>

                      {/* Required Features Checklist */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">
                          Functional Requirements Checklist
                        </h4>
                        <div className="space-y-2">
                          {(selectedStudentProject.projectRequirementId?.requiredFeatures || []).map((feat, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                            >
                              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-900">{typeof feat === 'string' ? feat : feat.title}</span>
                                {typeof feat !== 'string' && feat.description && (
                                  <p className="text-[11px] text-slate-500 leading-relaxed">{feat.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tutor Instructions */}
                      {selectedStudentProject.tutorInstructions && (
                        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs space-y-1">
                          <span className="font-bold text-purple-900">Tutor Instructions:</span>
                          <p className="text-slate-700 leading-relaxed">{selectedStudentProject.tutorInstructions}</p>
                        </div>
                      )}

                      {/* View Full Specs Trigger */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedProjectForDetail(selectedStudentProject);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-4 py-2 text-xs font-bold text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-xl transition flex items-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Full Requirement Specifications & Documents</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STUDENT TAB 2: Sprint Task Board (Kanban) */}
          {studentTab === 'kanban' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">
                    Capstone Sprint Milestones
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track your implementation progress across core architectural stages.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['Todo', 'In Progress', 'Review', 'Completed'].map((column) => (
                  <div
                    key={column}
                    className="bg-purple-50/40 rounded-2xl p-4 border border-purple-100/80 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-purple-900 font-mono">
                          {column}
                        </span>
                        <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-full text-purple-700 border border-purple-200">
                          {tasks.filter(t => t.status === column).length}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {tasks
                          .filter(t => t.status === column)
                          .map((task) => (
                            <div
                              key={task._id}
                              className="bg-white rounded-xl p-3.5 border border-purple-100 shadow-2xs space-y-2 hover:border-purple-300 transition-all"
                            >
                              <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                {task.title}
                              </h5>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-purple-50">
                                <span className="font-mono text-amber-600 font-bold">
                                  +{task.xpReward || 50} XP
                                </span>

                                <select
                                  value={task.status}
                                  onChange={(e) => handleTaskStatusToggle(task._id, e.target.value)}
                                  className="text-[10px] bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5 font-semibold text-purple-800 focus:outline-none"
                                >
                                  <option value="Todo">Todo</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Review">Review</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          ALL 6 INTERACTIVE MODALS
         ──────────────────────────────────────────────────────────────────────── */}
      
      {/* 1. Admin Create / Edit Project Requirement Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedReqForEdit(null);
        }}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          loadData();
        }}
        initialData={selectedReqForEdit}
      />

      {/* 2. Tutor Assign Project to Student Modal */}
      <AssignProjectModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedReqForAssign(null);
        }}
        onAssigned={() => {
          setIsAssignModalOpen(false);
          setSelectedReqForAssign(null);
          loadData();
        }}
        onSuccess={() => {
          setIsAssignModalOpen(false);
          setSelectedReqForAssign(null);
          loadData();
        }}
        selectedRequirement={selectedReqForAssign}
        selectedProject={selectedReqForAssign}
        requirements={tutorRequirements}
      />

      {/* 3. Student Submit Deliverables Modal */}
      <StudentSubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => {
          setIsSubmissionModalOpen(false);
          setSelectedAssignmentForSubmit(null);
        }}
        onSuccess={() => {
          setIsSubmissionModalOpen(false);
          loadData();
        }}
        assignment={selectedAssignmentForSubmit}
      />

      {/* 4. Tutor Code Review & Feedback Modal */}
      <TutorReviewModal
        isOpen={isTutorReviewModalOpen}
        onClose={() => {
          setIsTutorReviewModalOpen(false);
          setSelectedAssignmentForReview(null);
        }}
        onSuccess={() => {
          setIsTutorReviewModalOpen(false);
          loadData();
        }}
        assignment={selectedAssignmentForReview}
      />

      {/* 5. Admin Final Executive Approval & GitHub Replication Modal */}
      <AdminApprovalModal
        isOpen={isAdminApprovalModalOpen}
        onClose={() => {
          setIsAdminApprovalModalOpen(false);
          setSelectedAssignmentForApproval(null);
        }}
        onSuccess={() => {
          setIsAdminApprovalModalOpen(false);
          loadData();
        }}
        assignment={selectedAssignmentForApproval}
      />

      {/* 6. Public / Full Detail Specifications Modal */}
      <PublicProjectDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProjectForDetail(null);
        }}
        project={selectedProjectForDetail}
      />

    </div>
  );
}
