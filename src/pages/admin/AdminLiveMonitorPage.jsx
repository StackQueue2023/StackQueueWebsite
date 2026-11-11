import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Video, 
  ExternalLink, 
  RefreshCw, 
  Filter,
  Plus,
  X,
  Clock,
  User,
  BookOpen,
  UserCheck,
  Link2,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import api from '../../api/client';

export default function AdminLiveMonitorPage() {
  const [monitorData, setMonitorData] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  // Assign Live Class Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentUserId, setSelectedStudentUserId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formState, setFormState] = useState({
    title: '',
    scheduledDate: todayStr,
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    meetingLink: '',
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchLiveMonitor = async () => {
    try {
      const res = await api.get('/admin/live-monitor');
      if (res.data.success) {
        setMonitorData(res.data.data);
      }
    } catch (err) {
      console.error('Error loading live monitor:', err);
    }
  };

  useEffect(() => {
    fetchLiveMonitor();
    const interval = setInterval(fetchLiveMonitor, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch eligible existing students when modal opens
  const handleOpenAssignModal = async () => {
    setErrorMessage('');
    setSelectedStudentUserId('');
    setSelectedStudent(null);
    setFormState({
      title: '',
      scheduledDate: todayStr,
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      meetingLink: '',
      description: ''
    });
    setAssignModalOpen(true);
    setLoadingStudents(true);
    try {
      const res = await api.get('/admin/live-class/students');
      if (res.data.success) {
        setStudents(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setErrorMessage('Failed to load existing students from database.');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Handle student selection from dropdown
  const handleSelectStudent = (userId) => {
    setSelectedStudentUserId(userId);
    setErrorMessage('');
    const found = students.find(s => s.studentUserId === userId);
    setSelectedStudent(found || null);

    if (found && (!found.course || !found.tutor)) {
      setErrorMessage('Selected student has no assigned course or tutor. Please assign a course and tutor to the student profile first.');
    }
  };

  // Submit Live Class Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedStudentUserId) {
      setErrorMessage('Please select a student.');
      return;
    }

    if (selectedStudent && (!selectedStudent.course || !selectedStudent.tutor)) {
      setErrorMessage('Selected student has no assigned course or tutor. Please assign a course and tutor to the student profile first.');
      return;
    }

    if (!formState.title.trim()) {
      setErrorMessage('Meeting title is required.');
      return;
    }

    if (!formState.meetingLink.trim()) {
      setErrorMessage('Meeting link URL is required.');
      return;
    }

    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(formState.meetingLink.trim())) {
      setErrorMessage('Invalid meeting URL format. URL must start with http:// or https://');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/live-class/assign', {
        studentUserId: selectedStudentUserId,
        title: formState.title,
        scheduledDate: formState.scheduledDate,
        startTime: formState.startTime,
        endTime: formState.endTime,
        meetingLink: formState.meetingLink,
        description: formState.description
      });

      if (res.data.success) {
        showToast(res.data.message || `Live class assigned to ${selectedStudent?.studentName} successfully!`);
        setAssignModalOpen(false);
        fetchLiveMonitor();
      }
    } catch (err) {
      console.error('Error assigning live class:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to assign live class meeting.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete assigned live class
  const handleDeleteLiveClass = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this assigned live class meeting?')) return;
    try {
      const res = await api.delete(`/admin/live-class/${sessionId}`);
      if (res.data.success) {
        showToast('Live class deleted successfully.');
        fetchLiveMonitor();
      }
    } catch (err) {
      console.error('Error deleting live class:', err);
      alert(err.response?.data?.message || 'Failed to delete live class.');
    }
  };

  const stats = monitorData?.stats || { total: 0, upcoming: 0, live: 0, completed: 0, delayed: 0, missed: 0 };
  const allSessions = monitorData?.sessions || [];

  const filteredSessions = allSessions.filter(s => {
    if (filterStatus === 'ALL') return true;
    return (s.dynamicStatus || s.status) === filterStatus;
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-2 sm:px-4">

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-in-right text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50/60 via-fuchsia-50/40 to-pink-50/50 border border-purple-200/80 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-purple-100/90 via-fuchsia-100/90 to-pink-100/90 px-3.5 py-1 rounded-full border border-purple-200/80 shadow-2xs">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Institute Operations Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Live Class Monitoring & Meeting Assignment</h1>
          <p className="text-xs text-slate-600 font-medium">
            Assign live class meeting links to existing students with auto-populated Course and Tutor details.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-3 shrink-0 self-start md:self-center">
          <button
            onClick={fetchLiveMonitor}
            className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAssignModal}
            className="px-5 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-purple-500/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Assign Live Class</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-slate-500 text-xs font-medium">Total Scheduled</span>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          <span className="text-[10px] text-slate-400 font-mono">Sessions Today</span>
        </div>

        <div className="bg-white border border-rose-200 p-4 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-rose-600 text-xs font-bold flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            <span>Active Live</span>
          </span>
          <p className="text-2xl font-black text-rose-600">{stats.live}</p>
          <span className="text-[10px] text-rose-700 font-mono">In-Progress Now</span>
        </div>

        <div className="bg-white border border-amber-200 p-4 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-amber-700 text-xs font-bold">Delayed Starts</span>
          <p className="text-2xl font-black text-amber-700">{stats.delayed}</p>
          <span className="text-[10px] text-amber-800 font-mono">&gt;10m Past Scheduled</span>
        </div>

        <div className="bg-white border border-emerald-200 p-4 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-emerald-700 text-xs font-bold">Completed</span>
          <p className="text-2xl font-black text-emerald-800">{stats.completed}</p>
          <span className="text-[10px] text-emerald-700 font-mono">Concluded Today</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-slate-500 text-xs font-medium">Upcoming</span>
          <p className="text-2xl font-black text-slate-800">{stats.upcoming}</p>
          <span className="text-[10px] text-slate-400 font-mono">Later Today</span>
        </div>
      </div>

      {/* Sessions Filter Strip & Table */}
      <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-slate-900 font-black text-sm uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Today's Assigned Live Classes ({filteredSessions.length})</span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            {['ALL', 'LIVE', 'DELAYED', 'UPCOMING', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-xl font-mono text-[11px] transition cursor-pointer ${
                  filterStatus === st
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-purple-900 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Session & Topic</th>
                <th className="py-3 px-4">Assigned Student</th>
                <th className="py-3 px-4">Assigned Tutor</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Meeting Link / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic font-medium">
                    No live class meetings scheduled for today matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s) => {
                  const status = s.dynamicStatus || s.status;
                  const isDelayed = status === 'DELAYED';
                  const isLive = status === 'LIVE';
                  const firstStudent = s.studentIds && s.studentIds.length > 0 ? s.studentIds[0] : null;

                  return (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono text-slate-400">{s.sessionId}</span>
                          <span className="font-bold text-slate-900 line-clamp-1">{s.topic || s.title}</span>
                        </div>
                        {s.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 font-normal">{s.description}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-[10px]">
                            {firstStudent?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{firstStudent?.name || 'Assigned Student'}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{firstStudent?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-700 font-bold text-[10px]">
                            {s.tutorId?.name?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{s.tutorId?.name || 'Assigned Tutor'}</p>
                            <p className="text-[10px] text-slate-500">{s.tutorId?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                          {s.courseId?.title || 'Full Stack'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <p className="text-slate-900 font-bold">{s.startTime} - {s.endTime}</p>
                        <p className="text-[10px] text-slate-400">{s.scheduledDate}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col space-y-1 items-start">
                          {isLive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              <span>LIVE</span>
                            </span>
                          )}
                          {isDelayed && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>DELAYED +{s.delayMinutes || 12}m</span>
                            </span>
                          )}
                          {status === 'COMPLETED' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              COMPLETED
                            </span>
                          )}
                          {status === 'UPCOMING' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              UPCOMING
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {s.meetingLink && (
                            <a
                              href={s.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition text-[11px] font-bold"
                            >
                              <Video className="w-3 h-3 text-purple-600" />
                              <span>Join</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          )}

                          <button
                            onClick={() => handleDeleteLiveClass(s._id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete live class assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MODAL: ASSIGN LIVE CLASS MEETING TO EXISTING STUDENT
         ══════════════════════════════════════════════════════ */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col my-auto animate-scale-up">

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-5 shrink-0 bg-purple-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] text-white flex items-center justify-center text-lg shadow-md shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Assign Live Class Meeting
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Select an existing student to automatically populate Student ID, Course, and Tutor.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAssignSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* Error / Warning Notice Banner */}
              {errorMessage && (
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 space-y-1 font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* 1. STUDENT SELECTION DROPDOWN */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span>Select Student (Existing System Database Records) <span className="text-rose-500">*</span></span>
                </label>

                {loadingStudents ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading existing students from database...</span>
                  </div>
                ) : (
                  <select
                    required
                    value={selectedStudentUserId}
                    onChange={(e) => handleSelectStudent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-400 focus:bg-white"
                  >
                    <option value="">-- Choose Existing Student --</option>
                    {students.map((s) => (
                      <option key={s.studentUserId} value={s.studentUserId}>
                        {s.studentName} (ID: {s.studentId}) {s.course ? `— ${s.course.title}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* 2. AUTOMATICALLY POPULATED READ-ONLY STUDENT METADATA */}
              {selectedStudent && (
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-purple-700">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Auto-Populated Student System Record</span>
                    </span>
                    <span className="text-[10px] bg-purple-100 px-2 py-0.5 rounded text-purple-800 font-mono">Read-Only</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Student ID</label>
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={selectedStudent.studentId}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 cursor-not-allowed opacity-90"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Student Name</label>
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={selectedStudent.studentName}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 cursor-not-allowed opacity-90"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-purple-600" />
                        <span>Assigned Course</span>
                      </label>
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={selectedStudent.course ? selectedStudent.course.title : 'No Course Assigned'}
                        className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs font-bold cursor-not-allowed opacity-90 ${
                          selectedStudent.course ? 'border-slate-200 text-slate-800' : 'border-rose-200 text-rose-600'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-purple-600" />
                        <span>Assigned Tutor</span>
                      </label>
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={selectedStudent.tutor ? selectedStudent.tutor.name : 'No Tutor Assigned'}
                        className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs font-bold cursor-not-allowed opacity-90 ${
                          selectedStudent.tutor ? 'border-slate-200 text-slate-800' : 'border-rose-200 text-rose-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. MEETING SPECIFIC DETAILS (ADMIN INPUTS) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Meeting Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Java Full Stack Live Concept Masterclass"
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formState.scheduledDate}
                      onChange={(e) => setFormState({ ...formState, scheduledDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      Start Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="10:00 AM"
                      value={formState.startTime}
                      onChange={(e) => setFormState({ ...formState, startTime: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      End Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="11:30 AM"
                      value={formState.endTime}
                      onChange={(e) => setFormState({ ...formState, endTime: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Live Meeting Link / URL <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={formState.meetingLink}
                    onChange={(e) => setFormState({ ...formState, meetingLink: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                  />
                  <p className="text-[10px] text-slate-400">Must start with http:// or https:// (e.g. Google Meet, Zoom, Teams link)</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Optional Meeting Description / Agenda</label>
                  <textarea
                    rows="2"
                    placeholder="Topics to cover, setup requirements, or preparation notes..."
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-400 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || !selectedStudentUserId || (selectedStudent && (!selectedStudent.course || !selectedStudent.tutor))}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>{submitting ? 'Assigning Live Class...' : 'Assign Live Class'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
