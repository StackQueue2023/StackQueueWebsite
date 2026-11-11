import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Users, CheckCircle2, BookOpen, Lock, Unlock, X, AlertCircle,
  Layers, GraduationCap, Sparkles, ChevronRight, User, ShieldCheck,
  Search, RefreshCw
} from 'lucide-react';

export default function AssignedStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [individualStudents, setIndividualStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'BATCHES' | 'INDIVIDUAL'

  // Batch Shared Syllabus Modal state
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchModules, setBatchModules] = useState([]);
  const [batchModalLoading, setBatchModalLoading] = useState(false);
  const [updatingBatchModuleId, setUpdatingBatchModuleId] = useState(null);
  const [batchStatusMessage, setBatchStatusMessage] = useState(null);

  // Individual Student Module Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentModules, setStudentModules] = useState([]);
  const [studentModalLoading, setStudentModalLoading] = useState(false);
  const [updatingStudentModuleId, setUpdatingStudentModuleId] = useState(null);
  const [studentStatusMessage, setStudentStatusMessage] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainer/students');
      if (res.data.success) {
        const rawData = res.data;
        const studentsList = Array.isArray(rawData.data) ? rawData.data : [];
        setAllStudents(studentsList);

        if (Array.isArray(rawData.batches) && rawData.batches.length > 0) {
          setBatches(rawData.batches);
        } else {
          // Derive batches from students list if batches array empty
          const batchMap = new Map();
          studentsList.forEach(st => {
            if (st.batchId && (st.batchId._id || st.batchId.name)) {
              const bId = st.batchId._id?.toString() || st.batchId.name;
              if (!batchMap.has(bId)) {
                batchMap.set(bId, {
                  _id: st.batchId._id || bId,
                  name: st.batchId.name || 'Batch',
                  code: st.batchId.code || '',
                  course: st.enrolledCourseId,
                  students: []
                });
              }
              batchMap.get(bId).students.push(st);
            }
          });
          setBatches(Array.from(batchMap.values()));
        }

        if (Array.isArray(rawData.individualStudents)) {
          setIndividualStudents(rawData.individualStudents);
        } else {
          setIndividualStudents(studentsList.filter(s => !s.batchId || !s.batchId.name));
        }
      }
    } catch (err) {
      console.error('Failed to load assigned students and batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ════════════════════════════════════════════════════════════════
  // BATCH SHARED SYLLABUS MODAL HANDLERS
  // ════════════════════════════════════════════════════════════════
  const openBatchModal = async (batch) => {
    setSelectedBatch(batch);
    setBatchModalLoading(true);
    setBatchStatusMessage(null);
    try {
      const res = await api.get(`/tutor/domain/batch-modules/${batch._id}`);
      if (res.data.success) {
        setBatchModules(res.data.data.modules || []);
      }
    } catch (err) {
      console.error('Failed to load batch modules:', err);
      setBatchStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load batch syllabus modules.'
      });
    } finally {
      setBatchModalLoading(false);
    }
  };

  const handleUpdateBatchModuleStatus = async (moduleId, newStatus) => {
    if (!selectedBatch) return;
    setUpdatingBatchModuleId(moduleId);
    setBatchStatusMessage(null);
    try {
      const res = await api.post(`/tutor/domain/batch-modules/${selectedBatch._id}/${moduleId}/status`, {
        status: newStatus
      });
      if (res.data.success) {
        setBatchModules(prev =>
          prev.map(m => m._id === moduleId ? { ...m, status: newStatus, isLocked: newStatus === 'not_started' } : m)
        );
        setBatchStatusMessage({
          type: 'success',
          text: `Module updated to "${newStatus.replace('_', ' ').toUpperCase()}" for all batch students!`
        });
        setTimeout(() => setBatchStatusMessage(null), 4000);
        // Refresh cohort data
        loadData();
      }
    } catch (err) {
      console.error('Failed to update batch module status:', err);
      setBatchStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update batch module status.'
      });
    } finally {
      setUpdatingBatchModuleId(null);
    }
  };

  // ════════════════════════════════════════════════════════════════
  // INDIVIDUAL STUDENT MODULE MODAL HANDLERS
  // ════════════════════════════════════════════════════════════════
  const openStudentModal = async (student) => {
    setSelectedStudent(student);
    setStudentModalLoading(true);
    setStudentStatusMessage(null);
    try {
      const studentUserId = student.userId?._id || student.userId;
      const res = await api.get(`/tutor/domain/student-modules/${studentUserId}`);
      if (res.data.success) {
        setStudentModules(res.data.data.modules || []);
      }
    } catch (err) {
      console.error('Failed to load student modules:', err);
      setStudentStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load student modules.'
      });
    } finally {
      setStudentModalLoading(false);
    }
  };

  const handleUpdateStudentModuleStatus = async (moduleId, newStatus) => {
    if (!selectedStudent) return;
    const studentUserId = selectedStudent.userId?._id || selectedStudent.userId;
    setUpdatingStudentModuleId(moduleId);
    setStudentStatusMessage(null);
    try {
      const res = await api.post(`/tutor/domain/student-modules/${studentUserId}/${moduleId}/status`, {
        status: newStatus
      });
      if (res.data.success) {
        setStudentModules(prev =>
          prev.map(m => m._id === moduleId ? { ...m, status: newStatus, isLocked: newStatus === 'not_started' } : m)
        );
        setStudentStatusMessage({
          type: 'success',
          text: `Module updated to "${newStatus.replace('_', ' ').toUpperCase()}" for this student.`
        });
        setTimeout(() => setStudentStatusMessage(null), 4000);
        loadData();
      }
    } catch (err) {
      console.error('Failed to update student module status:', err);
      setStudentStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update module status.'
      });
    } finally {
      setUpdatingStudentModuleId(null);
    }
  };

  // Filter students based on search
  const filterStudent = (st) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const name = (st.userId?.name || '').toLowerCase();
    const email = (st.userId?.email || '').toLowerCase();
    const studentId = (st.studentId || st.userId?.studentId || '').toLowerCase();
    const course = (st.courseTitle || st.enrolledCourseId?.title || '').toLowerCase();
    const batchName = (st.actualBatchName || st.batchId?.name || '').toLowerCase();
    return name.includes(q) || email.includes(q) || studentId.includes(q) || course.includes(q) || batchName.includes(q);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Loading Assigned Students & Cohorts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto px-2 sm:px-4">
      {/* ────────────────────────────────────────────────────────── */}
      {/* HEADER BANNER */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-50/80 via-fuchsia-50/70 to-pink-50/80 border border-purple-200/80 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs uppercase tracking-wider font-mono">
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <span>Tutor Command Center &bull; Assigned Students Roster</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Assigned Cohorts & Students
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Manage your assigned training batches with <strong>one common shared syllabus</strong>, and guide self-paced <strong>individual students</strong> without batch conflicts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/90 border border-purple-200/90 px-4 py-2.5 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">Batches</span>
            <span className="text-lg font-black text-purple-700">{batches.length}</span>
          </div>
          <div className="bg-white/90 border border-purple-200/90 px-4 py-2.5 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">Total Students</span>
            <span className="text-lg font-black text-slate-900">{allStudents.length}</span>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* SEARCH AND VIEW FILTERS */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search student, ID, email, course, or batch..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 shadow-2xs font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/70 text-xs font-bold">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-purple-700 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Students ({allStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('BATCHES')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'BATCHES'
                ? 'bg-white text-purple-700 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batches ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab('INDIVIDUAL')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'INDIVIDUAL'
                ? 'bg-white text-purple-700 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Individual Track ({individualStudents.length})
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* SECTION 1: ASSIGNED TRAINING BATCHES (COMMON SYLLABUS) */}
      {/* ────────────────────────────────────────────────────────── */}
      {(activeTab === 'ALL' || activeTab === 'BATCHES') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                Assigned Batches Cohorts
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-mono font-bold">
                {batches.length} Batch(es)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Common Syllabus &bull; Updates apply to the whole cohort
            </span>
          </div>

          {batches.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-2">
              <Layers className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No Batches Currently Assigned</p>
              <p className="text-[11px] text-slate-500">Batches assigned to you by admin will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {batches.map((batch) => {
                const batchStudentsList = (batch.students || []).filter(filterStudent);
                const courseName = batch.course?.title || 'Course';

                return (
                  <div
                    key={batch._id}
                    className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:border-purple-300/80 transition"
                  >
                    {/* Batch Top Header Bar */}
                    <div className="bg-gradient-to-r from-purple-50/90 via-slate-50 to-pink-50/70 p-5 border-b border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-purple-700 text-white font-mono font-black text-[11px] tracking-wide">
                            {batch.code || 'BATCH'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-purple-100/90 text-purple-800 border border-purple-200 font-bold text-[11px] uppercase tracking-wider font-mono">
                            {courseName}
                          </span>
                          {batch.department && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                              {batch.department}
                            </span>
                          )}
                          {batch.academicYear && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                              {batch.academicYear}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 pt-0.5">
                          <span>{batch.name}</span>
                          <span className="text-xs font-medium text-slate-500 font-mono">
                            ({batch.studentCount || (batch.students?.length || 0)} Students Enrolled)
                          </span>
                        </h3>
                      </div>

                      {/* Manage Batch Syllabus Button */}
                      <button
                        onClick={() => openBatchModal(batch)}
                        className="px-4 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-md shadow-purple-500/20 cursor-pointer shrink-0"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Manage Batch Common Syllabus</span>
                      </button>
                    </div>

                    {/* Batch Students Roster Cards */}
                    <div className="p-5">
                      {batchStudentsList.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 font-medium text-xs">
                          {searchTerm ? 'No students in this batch match your search filter.' : 'No students currently enrolled in this batch.'}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {batchStudentsList.map((st) => (
                            <div
                              key={st._id}
                              className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:bg-white hover:border-purple-300 transition shadow-2xs"
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center space-x-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B2BE2] to-[#E02B91] flex items-center justify-center font-bold text-xs text-white shadow-2xs">
                                      {st.userId?.name?.charAt(0) || 'S'}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="text-xs font-bold text-slate-900 truncate">
                                        {st.userId?.name || 'Student'}
                                      </h4>
                                      <p className="text-[11px] text-slate-500 font-mono truncate">
                                        {st.userId?.email}
                                      </p>
                                    </div>
                                  </div>

                                  <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono font-bold shrink-0">
                                    {st.studentId || st.userId?.studentId || 'ID'}
                                  </span>
                                </div>

                                {/* Actual Batch & Course Association */}
                                <div className="space-y-1 text-[11px] bg-white p-2 rounded-xl border border-slate-200/60">
                                  <div className="flex items-center justify-between text-slate-600">
                                    <span className="font-semibold text-slate-500">Batch:</span>
                                    <span className="font-bold text-purple-800 font-mono">
                                      {st.actualBatchName || batch.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-600">
                                    <span className="font-semibold text-slate-500">Course:</span>
                                    <span className="font-bold text-indigo-700">
                                      {st.courseTitle || courseName}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-600">
                                    <span className="font-semibold text-slate-500">Tutor:</span>
                                    <span className="font-medium text-slate-800">
                                      {st.assignedTutorName}
                                    </span>
                                  </div>
                                </div>

                                {/* Syllabus Progress Bar */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono font-semibold">
                                    <span>Modules Progress:</span>
                                    <span className="text-purple-700 font-bold">
                                      {st.progress?.completedModules || 0}/{st.progress?.totalModules || 0} ({st.progress?.progressPercent || 0}%)
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-300"
                                      style={{ width: `${st.progress?.progressPercent || 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>

                              {/* Footer Action */}
                              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                                <span className="font-mono text-slate-500 text-[10px]">
                                  XP: <strong className="text-amber-700">{st.totalXp || 0}</strong>
                                </span>
                                <button
                                  onClick={() => openStudentModal(st)}
                                  className="text-purple-600 hover:text-purple-800 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                                >
                                  <span>View Modules</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* SECTION 2: INDIVIDUAL STUDENTS (NO BATCH ASSIGNED) */}
      {/* ────────────────────────────────────────────────────────── */}
      {(activeTab === 'ALL' || activeTab === 'INDIVIDUAL') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-violet-600" />
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                Individual Students (No Batch Assigned)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[11px] font-mono font-bold">
                {individualStudents.length} Individual
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Self-paced learners &bull; Managed on an individual basis
            </span>
          </div>

          {individualStudents.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-2">
              <User className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No Individual Students Assigned</p>
              <p className="text-[11px] text-slate-500">Students assigned directly to you without a batch will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {individualStudents.filter(filterStudent).map((st) => (
                <div
                  key={st._id}
                  className="bg-white border border-slate-200/90 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-violet-300 transition"
                >
                  <div className="space-y-3">
                    {/* Badge: Individual Student (No Batch Assigned) */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-800 border border-violet-200 text-[10px] font-bold uppercase tracking-wider font-mono">
                        Individual Student (No Batch Assigned)
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                        Lv.{st.currentLevel?.level || 1}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="flex items-start space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0">
                        {st.userId?.name?.charAt(0) || 'I'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {st.userId?.name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">{st.userId?.email}</p>
                        <span className="text-[10px] font-mono text-purple-700 font-semibold block pt-0.5">
                          ID: {st.studentId || st.userId?.studentId || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Course & Tutor Metadata */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-semibold">Enrolled Course:</span>
                        <span className="font-bold text-purple-700">
                          {st.courseTitle || st.enrolledCourseId?.title || (st.domain ? st.domain.toUpperCase() : 'Unassigned')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-semibold">Assigned Tutor:</span>
                        <span className="font-medium text-slate-800">
                          {st.assignedTutorName}
                        </span>
                      </div>
                    </div>

                    {/* Module Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                        <span className="text-slate-500">Syllabus Progress:</span>
                        <span className="text-purple-700 font-bold">
                          {st.progress?.completedModules || 0}/{st.progress?.totalModules || 0} Modules ({st.progress?.progressPercent || 0}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full"
                          style={{ width: `${st.progress?.progressPercent || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-slate-500 text-[11px] font-mono">
                      XP: <strong className="text-amber-700">{st.totalXp || 0}</strong>
                    </span>

                    <button
                      onClick={() => openStudentModal(st)}
                      className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Manage Modules</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: BATCH COMMON SYLLABUS & SHARED MODULES CONTROL        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-3xl w-full rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-purple-50/70 via-slate-50 to-pink-50/50">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-purple-700 text-white font-mono font-black text-xs uppercase">
                    {selectedBatch.code || 'BATCH'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-bold">
                    {selectedBatch.course?.title || 'Shared Course Syllabus'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    &bull; {selectedBatch.studentCount || (selectedBatch.students?.length || 0)} Students in Batch
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>Common Batch Syllabus:</span>
                  <span className="text-purple-700">{selectedBatch.name}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Centrally manage the shared syllabus. Setting a module to ⚡ <strong>Processing</strong> immediately unlocks it for <strong>every student in this batch</strong>.
                </p>
              </div>

              <button
                onClick={() => setSelectedBatch(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alert Message */}
            {batchStatusMessage && (
              <div className={`mx-6 mt-4 p-3 rounded-2xl text-xs font-semibold flex items-center space-x-2.5 ${
                batchStatusMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {batchStatusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{batchStatusMessage.text}</span>
              </div>
            )}

            {/* Modules List */}
            <div className="p-6 flex-1 overflow-y-auto space-y-3">
              {batchModalLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-slate-500">Loading common modules for {selectedBatch.name}...</p>
                </div>
              ) : batchModules.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-semibold text-xs">
                  No syllabus modules found for this batch's assigned course.
                </div>
              ) : (
                batchModules.map((mod) => {
                  const isUpdating = updatingBatchModuleId === mod._id;
                  const status = mod.status || 'not_started';

                  return (
                    <div
                      key={mod._id}
                      className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        status === 'processing'
                          ? 'bg-purple-50/60 border-purple-300 shadow-2xs'
                          : status === 'completed'
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 shadow-2xs">
                            Mod {mod.order}
                          </span>
                          <h4 className="font-black text-sm text-slate-900 truncate">
                            {mod.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Batch Progress: <strong>{mod.studentsCompletedAllTasks || 0} / {mod.totalStudents || 0} Students Completed All Tasks</strong> &bull; {mod.totalTasks || 0} Domain Tasks Total
                        </p>
                      </div>

                      {/* 3 Status Selector Buttons for Batch */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* 1. Locked */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateBatchModuleStatus(mod._id, 'not_started')}
                          title="Lock module for all batch students"
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            status === 'not_started'
                              ? 'bg-slate-700 text-white shadow-xs ring-2 ring-slate-400/40'
                              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </button>

                        {/* 2. Processing (Unlocked) */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateBatchModuleStatus(mod._id, 'processing')}
                          title="Unlock module for all batch students"
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            status === 'processing'
                              ? 'bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] text-white shadow-xs ring-2 ring-purple-400/40'
                              : 'bg-white hover:bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Processing</span>
                        </button>

                        {/* 3. Completed */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateBatchModuleStatus(mod._id, 'completed')}
                          title="Mark module completed for batch"
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            status === 'completed'
                              ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/40'
                              : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] text-slate-600 font-medium">
                Changes synchronize to all {selectedBatch.studentCount || (selectedBatch.students?.length || 0)} students in this cohort immediately.
              </span>
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: INDIVIDUAL STUDENT MODULE CONTROL                     */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-2xl w-full rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-mono font-black uppercase">
                    {selectedStudent.courseTitle || selectedStudent.enrolledCourseId?.title || 'Syllabus'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    ID: <strong>{selectedStudent.studentId || selectedStudent.userId?.studentId || 'N/A'}</strong>
                  </span>
                  {selectedStudent.hasBatch ? (
                    <span className="text-xs text-purple-700 font-bold font-mono">
                      &bull; Batch: {selectedStudent.actualBatchName}
                    </span>
                  ) : (
                    <span className="text-xs text-violet-700 font-bold">
                      &bull; Individual Track
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>Module Lock & Availability:</span>
                  <span className="text-purple-700">{selectedStudent.userId?.name}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Control module access for this student. Set to ⚡ <strong>Processing</strong> to unlock tasks.
                </p>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Alert Message */}
            {studentStatusMessage && (
              <div className={`mx-6 mt-4 p-3 rounded-2xl text-xs font-semibold flex items-center space-x-2.5 ${
                studentStatusMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {studentStatusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{studentStatusMessage.text}</span>
              </div>
            )}

            {/* Modules List */}
            <div className="p-6 flex-1 overflow-y-auto space-y-3">
              {studentModalLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-slate-500">Loading module status...</p>
                </div>
              ) : studentModules.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-semibold text-xs">
                  No syllabus modules found for this student.
                </div>
              ) : (
                studentModules.map((mod) => {
                  const isUpdating = updatingStudentModuleId === mod._id;
                  const status = mod.status || 'not_started';

                  return (
                    <div
                      key={mod._id}
                      className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        status === 'processing'
                          ? 'bg-purple-50/50 border-purple-300 shadow-2xs'
                          : status === 'completed'
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 shadow-2xs">
                            Mod {mod.order}
                          </span>
                          <h4 className="font-black text-sm text-slate-900 truncate">
                            {mod.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Completed: <strong>{mod.completedTasks || 0} / {mod.totalTasks || 0} Tasks</strong>
                          {mod.inProgressTasks > 0 && ` (${mod.inProgressTasks} in progress)`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStudentModuleStatus(mod._id, 'not_started')}
                          title="Lock module"
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            status === 'not_started'
                              ? 'bg-slate-700 text-white shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          <span>Locked</span>
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStudentModuleStatus(mod._id, 'processing')}
                          title="Unlock module"
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            status === 'processing'
                              ? 'bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] text-white shadow-xs'
                              : 'bg-white hover:bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          <Unlock className="w-3 h-3" />
                          <span>Processing</span>
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStudentModuleStatus(mod._id, 'completed')}
                          title="Mark completed"
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            status === 'completed'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-xl transition cursor-pointer text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
