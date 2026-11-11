import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Building2, GraduationCap, Calendar, Clock, CheckCircle2, Lock, ArrowRight,
  Plus, Trash2, AlertCircle, FileText, Check, ShieldAlert, Sparkles, MessageSquare,
  Users, ChevronLeft, Eye, Activity, BarChart3
} from 'lucide-react';

export default function DailyReportSubmitPage() {
  // Navigation Flow State: 'list' (Assigned Trainings) -> 'details' (Day Timeline) -> 'report_form' (Day Report)
  const [viewState, setViewState] = useState('list');
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Training & Timeline Details State
  const [selectedTrainingId, setSelectedTrainingId] = useState(null);
  const [trainingDetails, setTrainingDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Active Day Report State
  const [selectedDayNumber, setSelectedDayNumber] = useState(null);
  const [dayReportData, setDayReportData] = useState(null);
  const [loadingDayReport, setLoadingDayReport] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState(null);

  // Form Fields State for Day Report
  const [morningTopic, setMorningTopic] = useState('');
  const [afternoonTopic, setAfternoonTopic] = useState('');
  const [studentsPresent, setStudentsPresent] = useState(0);
  const [studentsAbsent, setStudentsAbsent] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  // Practical Session State
  const [practicalConducted, setPracticalConducted] = useState(true);
  const [practicalTasks, setPracticalTasks] = useState([]);

  // Student Feedback State
  const [studentFeedbackReceived, setStudentFeedbackReceived] = useState(false);
  const [studentFeedback, setStudentFeedback] = useState('');
  const [studentPositiveFeedback, setStudentPositiveFeedback] = useState('');
  const [studentDifficulties, setStudentDifficulties] = useState('');
  const [studentSuggestions, setStudentSuggestions] = useState('');

  // Complaint Section State
  const [complaintReported, setComplaintReported] = useState(false);
  const [complaintRaisedBy, setComplaintRaisedBy] = useState('Student');
  const [complaintName, setComplaintName] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('Training');
  const [complaintDetails, setComplaintDetails] = useState('');
  const [complaintPriority, setComplaintPriority] = useState('Medium');
  const [actionTaken, setActionTaken] = useState('');
  const [complaintStatus, setComplaintStatus] = useState('Open');

  // Trainer Remarks State
  const [trainerRemarks, setTrainerRemarks] = useState('');

  // 1. Initial Load: Fetch Assigned College Trainings for Logged-In Tutor
  useEffect(() => {
    loadAssignedTrainings();
  }, []);

  const loadAssignedTrainings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainer/college-trainings');
      if (res.data.success) {
        setTrainings(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load assigned college trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Open Training Details Page (Timeline & Day Access Control)
  const handleOpenTraining = async (trainingId) => {
    setSelectedTrainingId(trainingId);
    setLoadingDetails(true);
    setViewState('details');
    setSubmissionSuccessMsg(null);
    try {
      const res = await api.get(`/trainer/college-trainings/${trainingId}`);
      if (res.data.success) {
        setTrainingDetails(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error loading training details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  // 3. Open Specific Day Report (Enforces Backend Access Control & Lock Status)
  const handleOpenDayReport = async (dayNumber) => {
    if (!selectedTrainingId) return;
    setSelectedDayNumber(dayNumber);
    setLoadingDayReport(true);
    setViewState('report_form');
    setSubmissionSuccessMsg(null);
    try {
      const res = await api.get(`/trainer/college-trainings/${selectedTrainingId}/day/${dayNumber}`);
      if (res.data.success) {
        setDayReportData(res.data);
        const report = res.data.data;
        setTotalStudents(res.data.trainingInfo?.totalStudents || report.totalStudents || 28);
        setStudentsPresent(report.studentsPresent ?? (res.data.trainingInfo?.totalStudents || 28) - 3);
        setStudentsAbsent(report.studentsAbsent ?? 3);
        setMorningTopic(report.morningTopic || '');
        setAfternoonTopic(report.afternoonTopic || '');

        setPracticalConducted(report.practicalConducted ?? true);
        setPracticalTasks(report.practicalTasks?.length > 0 ? report.practicalTasks : [
          'Create a Java Bank Account class',
          'Implement exception handling and custom InsufficientFundsException'
        ]);

        setStudentFeedbackReceived(report.studentFeedbackReceived ?? false);
        setStudentFeedback(report.studentFeedback || '');
        setStudentPositiveFeedback(report.studentPositiveFeedback || '');
        setStudentDifficulties(report.studentDifficulties || '');
        setStudentSuggestions(report.studentSuggestions || '');

        setComplaintReported(report.complaintReported ?? false);
        setComplaintRaisedBy(report.complaintRaisedBy || 'Student');
        setComplaintName(report.complaintName || '');
        setComplaintCategory(report.complaintCategory || 'Training');
        setComplaintDetails(report.complaintDetails || '');
        setComplaintPriority(report.complaintPriority || 'Medium');
        setActionTaken(report.actionTaken || '');
        setComplaintStatus(report.complaintStatus || 'Open');

        setTrainerRemarks(report.trainerRemarks || '');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error opening day report.';
      alert(`🔒 Access Error: ${errorMsg}`);
      setViewState('details');
    } finally {
      setLoadingDayReport(false);
    }
  };

  // Practical Task Helpers
  const handleAddPracticalTask = () => {
    setPracticalTasks([...practicalTasks, '']);
  };

  const handleUpdatePracticalTask = (index, value) => {
    const updated = [...practicalTasks];
    updated[index] = value;
    setPracticalTasks(updated);
  };

  const handleRemovePracticalTask = (index) => {
    setPracticalTasks(practicalTasks.filter((_, i) => i !== index));
  };

  // Attendance Validation Check
  const isAttendanceValid = Number(studentsPresent) + Number(studentsAbsent) === Number(totalStudents);
  const attendancePercent = totalStudents > 0 ? ((Number(studentsPresent) / Number(totalStudents)) * 100).toFixed(1) : '0.0';

  // 4. Submit Day Report Handler
  const handleSubmitDayReport = async (e) => {
    if (e) e.preventDefault();
    if (!morningTopic.trim()) {
      alert('Morning Session Topic Covered is required.');
      return;
    }
    if (!afternoonTopic.trim()) {
      alert('Afternoon Session Topic Covered is required.');
      return;
    }
    if (!isAttendanceValid) {
      alert(`Attendance Error: Present (${studentsPresent}) + Absent (${studentsAbsent}) must equal Total Students (${totalStudents}).`);
      return;
    }

    setSubmittingReport(true);
    try {
      const payload = {
        date: dayReportData?.data?.date || new Date().toISOString().split('T')[0],
        morningTopic,
        afternoonTopic,
        studentsPresent: Number(studentsPresent),
        studentsAbsent: Number(studentsAbsent),
        totalStudents: Number(totalStudents),
        practicalConducted,
        practicalTasks: practicalConducted ? practicalTasks.filter(t => t.trim()) : [],
        studentFeedbackReceived,
        studentFeedback,
        studentPositiveFeedback,
        studentDifficulties,
        studentSuggestions,
        complaintReported,
        complaintRaisedBy,
        complaintName,
        complaintCategory,
        complaintDetails,
        complaintPriority,
        actionTaken,
        complaintStatus,
        trainerRemarks
      };

      const res = await api.post(`/trainer/college-trainings/${selectedTrainingId}/day/${selectedDayNumber}/submit`, payload);
      if (res.data.success) {
        setSubmissionSuccessMsg(`✓ Day ${selectedDayNumber} Report Submitted Successfully`);
        alert(`✓ Day ${selectedDayNumber} Report Submitted Successfully!`);
        // Reload details & timeline
        await handleOpenTraining(selectedTrainingId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting day report.');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto px-4">
      {/* Top Header Banner - White Background with Linear Gradient Text */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-50 via-fuchsia-50 to-purple-50 border border-pink-200/80 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase shadow-2xs">
            <Building2 className="w-4 h-4 text-pink-600" />
            <span className="bg-gradient-to-r from-pink-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent font-extrabold">
              College Training Management System
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
            Daily College Training Report
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
            Track assigned partner college trainings, day-by-day locked schedule timelines, morning &amp; afternoon session logs, attendance verification, practical tasks, student feedback, and daily complaints.
          </p>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          VIEW 1: ASSIGNED COLLEGE TRAININGS CARDS (SHOW WHEN VIEWSTATE === 'LIST')
         ═════════════════════════════════════════════════════════════════════ */}
      {viewState === 'list' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-pink-600" />
              <span>Assigned Partner College Trainings ({trainings.length})</span>
            </h2>
          </div>

          {trainings.length === 0 ? (
            /* EMPTY STATE WHEN NO COLLEGE TRAINING IS ASSIGNED */
            <div className="bg-white border border-pink-200/80 rounded-3xl p-12 text-center space-y-4 shadow-sm bg-gradient-to-b from-pink-50/30 to-purple-50/20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">No College Training Assigned</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  You currently don't have any college training assigned.
                </p>
              </div>
            </div>
          ) : (
            /* CARDS GRID FOR ASSIGNED COLLEGE TRAININGS */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trainings.map(t => (
                <div
                  key={t._id}
                  className="bg-white border border-pink-200/80 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 space-y-5 flex flex-col justify-between relative overflow-hidden group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-purple-100 text-purple-800 border border-purple-200">
                          Batch: {t.batchName}
                        </span>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-700 transition">{t.collegeName}</h3>
                        <p className="text-xs font-bold text-pink-600">{t.trainingName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${
                        t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-pink-100 text-pink-800 border border-pink-300'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-gradient-to-r from-pink-50/50 via-fuchsia-50/40 to-purple-50/50 p-3.5 rounded-2xl text-center border border-pink-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Students</span>
                        <span className="text-sm font-black text-slate-900 font-mono">{t.totalStudents}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Duration</span>
                        <span className="text-sm font-black text-purple-700 font-mono">{t.totalDays} Days</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Progress</span>
                        <span className="text-sm font-black text-pink-600 font-mono">Day {t.currentDay} / {t.totalDays}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600">
                        <span>Overall Training Completion</span>
                        <span className="text-purple-700 font-mono">{t.progressPercent}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 rounded-full transition-all duration-500"
                          style={{ width: `${t.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenTraining(t._id)}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Open Training Management →</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          VIEW 2: TRAINING DETAILS PAGE & DAY-BY-DAY TIMELINE (SHOW WHEN VIEWSTATE === 'DETAILS')
         ═════════════════════════════════════════════════════════════════════ */}
      {viewState === 'details' && (
        <div className="space-y-6">
          <button
            onClick={() => {
              setViewState('list');
              loadAssignedTrainings();
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-4 h-4 text-purple-600" />
            <span>← Back to All College Trainings</span>
          </button>

          {loadingDetails || !trainingDetails ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Training Overview Card */}
              <div className="bg-white border border-pink-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <span className="px-3 py-1 bg-pink-100 text-pink-800 border border-pink-200 rounded-full font-mono text-xs font-bold uppercase">
                      Batch: {trainingDetails.training.batchName}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900">{trainingDetails.training.collegeName}</h2>
                    <p className="text-sm font-bold text-purple-700">{trainingDetails.training.trainingName}</p>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600 font-mono bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Tutor</span>
                      <strong className="text-slate-900">{trainingDetails.training.tutorName}</strong>
                    </div>
                    <div className="border-l border-slate-200 pl-4">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Enrolled</span>
                      <strong className="text-purple-700">{trainingDetails.training.totalStudents} Students</strong>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Training Days Summary */}
                <div className="bg-gradient-to-r from-pink-50/60 via-fuchsia-50/40 to-purple-50/60 p-5 rounded-2xl border border-pink-200/80 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between text-xs font-bold gap-2">
                    <span className="text-slate-800 flex items-center space-x-1.5">
                      <Activity className="w-4 h-4 text-pink-600" />
                      <span>Training Schedule Progress: <strong>Day {trainingDetails.progress.completedDaysCount} of {trainingDetails.training.totalDays}</strong></span>
                    </span>
                    <span className="text-purple-700 font-mono text-sm">{trainingDetails.progress.progressPercent}% Completed</span>
                  </div>

                  <div className="w-full h-3 bg-white rounded-full overflow-hidden p-0.5 border border-pink-200 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 rounded-full transition-all duration-500"
                      style={{ width: `${trainingDetails.progress.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                    <span>Completed Days: <strong className="text-emerald-700 font-mono">{trainingDetails.progress.completedDaysCount} Days</strong></span>
                    <span>Remaining Days: <strong className="text-pink-600 font-mono">{trainingDetails.progress.remainingDaysCount} Days</strong></span>
                    <span>Total Students: <strong className="text-purple-700 font-mono">{trainingDetails.training.totalStudents}</strong></span>
                  </div>
                </div>
              </div>

              {/* Day-by-Day Timeline List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-pink-600" />
                    <span>Day-by-Day Training Timeline &amp; Access Gate</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    Current Active Day: <strong className="text-purple-700 font-mono">Day {trainingDetails.progress.currentAvailableDay}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trainingDetails.timeline.map((dayItem) => (
                    <div
                      key={dayItem.dayNumber}
                      className={`bg-white border rounded-2xl p-5 shadow-xs transition space-y-3 flex items-center justify-between ${
                        dayItem.isCompleted
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : dayItem.isEditable
                            ? 'border-pink-300 ring-2 ring-pink-500/20 bg-gradient-to-r from-pink-50/40 to-purple-50/30'
                            : 'border-slate-200 opacity-70 bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-black text-slate-900 text-base">Day {dayItem.dayNumber}</h4>
                          <span className="text-xs font-mono font-semibold text-slate-500">({dayItem.dateStr})</span>
                        </div>

                        {dayItem.isCompleted && (
                          <div className="text-[11px] text-emerald-800 font-medium space-y-0.5">
                            <p className="font-bold">Morning: {dayItem.reportSummary?.morningTopic}</p>
                            <p>Attendance: {dayItem.reportSummary?.studentsPresent} Present / {dayItem.reportSummary?.studentsAbsent} Absent</p>
                          </div>
                        )}

                        {dayItem.isEditable && (
                          <p className="text-[11px] text-pink-600 font-bold">
                            ⚡ Current Available Training Day — Click to Fill Report
                          </p>
                        )}

                        {dayItem.isLocked && (
                          <p className="text-[11px] text-slate-400 font-medium flex items-center space-x-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Future Day Locked. Complete Day {trainingDetails.progress.currentAvailableDay} first.</span>
                          </p>
                        )}
                      </div>

                      <div>
                        {dayItem.isCompleted ? (
                          <button
                            onClick={() => handleOpenDayReport(dayItem.dayNumber)}
                            className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold rounded-xl text-xs transition cursor-pointer flex items-center space-x-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-700" />
                            <span>View Day {dayItem.dayNumber} Report</span>
                          </button>
                        ) : dayItem.isEditable ? (
                          <button
                            onClick={() => handleOpenDayReport(dayItem.dayNumber)}
                            className="px-4 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 animate-pulse"
                          >
                            <span>Fill Day {dayItem.dayNumber} Report →</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-3.5 py-2 bg-slate-100 text-slate-400 border border-slate-200 font-bold rounded-xl text-xs opacity-60 cursor-not-allowed flex items-center space-x-1"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Locked 🔒</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          VIEW 3: DAY X TRAINING REPORT FORM / INSPECTION (SHOW WHEN VIEWSTATE === 'REPORT_FORM')
         ═════════════════════════════════════════════════════════════════════ */}
      {viewState === 'report_form' && (
        <div className="space-y-6">
          <button
            onClick={() => handleOpenTraining(selectedTrainingId)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-4 h-4 text-purple-600" />
            <span>← Back to Training Timeline</span>
          </button>

          {loadingDayReport || !dayReportData ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="bg-white border border-pink-200 rounded-3xl p-6 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-violet-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                      D{selectedDayNumber}
                    </span>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Day {selectedDayNumber} Training Report</h2>
                      <p className="text-xs text-slate-500 font-semibold">
                        College: <strong className="text-slate-800">{dayReportData.trainingInfo?.collegeName}</strong> | Batch: <strong className="text-purple-700">{dayReportData.trainingInfo?.batchName}</strong>
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                    dayReportData.isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-xs'
                  }`}>
                    {dayReportData.isCompleted ? '✓ COMPLETED & LOGGED' : '⚡ EDITABLE AVAILABLE DAY'}
                  </span>
                </div>
              </div>

              {/* READ-ONLY VIEW IF DAY IS COMPLETED */}
              {dayReportData.isCompleted ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm text-xs">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Day {selectedDayNumber} Report has been submitted and stored in the database.</span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">Date: {dayReportData.data?.date}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-purple-700 uppercase">Morning Session Topic Covered</span>
                      <p className="text-slate-900 font-semibold">{dayReportData.data?.morningTopic}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-purple-700 uppercase">Afternoon Session Topic Covered</span>
                      <p className="text-slate-900 font-semibold">{dayReportData.data?.afternoonTopic}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-purple-700 uppercase">Student Attendance Summary</span>
                    <div className="flex items-center space-x-6 text-slate-800 font-bold font-mono">
                      <span>Total: {dayReportData.data?.totalStudents}</span>
                      <span className="text-emerald-700">Present: {dayReportData.data?.studentsPresent}</span>
                      <span className="text-rose-700">Absent: {dayReportData.data?.studentsAbsent}</span>
                      <span className="text-purple-700">Attendance: {((dayReportData.data?.studentsPresent / dayReportData.data?.totalStudents) * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  {dayReportData.data?.practicalTasks?.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold text-purple-700 uppercase">Practical Tasks Conducted</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-800 font-medium">
                        {dayReportData.data.practicalTasks.map((task, idx) => (
                          <li key={idx}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {dayReportData.data?.complaintReported && (
                    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 space-y-1">
                      <span className="text-[10px] font-bold text-rose-700 uppercase font-mono">Complaint Reported</span>
                      <p className="text-slate-800 leading-relaxed font-semibold">
                        Category: {dayReportData.data?.complaintCategory} | Raised By: {dayReportData.data?.complaintRaisedBy} ({dayReportData.data?.complaintName || 'N/A'}) | Priority: {dayReportData.data?.complaintPriority}
                      </p>
                      <p className="text-slate-700 text-xs mt-1">{dayReportData.data?.complaintDetails}</p>
                    </div>
                  )}

                  {dayReportData.data?.trainerRemarks && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-purple-700 uppercase">Trainer Remarks</span>
                      <p className="text-slate-800 leading-relaxed font-medium">{dayReportData.data?.trainerRemarks}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* EDITABLE DAY REPORT FORM */
                <form onSubmit={handleSubmitDayReport} className="space-y-6 text-xs">

                  {/* SECTION 1: SESSION TOPICS */}
                  <div className="bg-white border border-pink-200 rounded-3xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider text-purple-900 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-pink-600" />
                      <span>1. Daily Session Topics Covered *</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-700 font-bold block">Morning Session Topic Covered *</label>
                        <textarea
                          rows={3}
                          required
                          value={morningTopic}
                          onChange={e => setMorningTopic(e.target.value)}
                          placeholder="e.g. Java OOP Concepts, Classes, Objects & Constructors"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-700 font-bold block">Afternoon Session Topic Covered *</label>
                        <textarea
                          rows={3}
                          required
                          value={afternoonTopic}
                          onChange={e => setAfternoonTopic(e.target.value)}
                          placeholder="e.g. Exception Handling, Try-Catch Blocks & Custom Exceptions"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: STUDENT ATTENDANCE VALIDATION */}
                  <div className="bg-white border border-pink-200 rounded-3xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider text-purple-900 flex items-center space-x-2">
                        <Users className="w-4 h-4 text-pink-600" />
                        <span>2. Student Attendance Verification *</span>
                      </h3>

                      <span className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 rounded-full font-mono font-bold text-xs">
                        Total Enrolled: {totalStudents} Students
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-700 font-bold block">Students Present Count *</label>
                        <input
                          type="number"
                          required
                          min={0}
                          max={totalStudents}
                          value={studentsPresent}
                          onChange={e => setStudentsPresent(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-mono font-bold text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-700 font-bold block">Students Absent Count *</label>
                        <input
                          type="number"
                          required
                          min={0}
                          max={totalStudents}
                          value={studentsAbsent}
                          onChange={e => setStudentsAbsent(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-mono font-bold text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Attendance Validation Error Box / Success Summary */}
                    {!isAttendanceValid ? (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-bold flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>Attendance Validation Error: Present ({studentsPresent}) + Absent ({studentsAbsent}) must equal Total Students ({totalStudents}).</span>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-pink-50/70 via-fuchsia-50/50 to-purple-50/70 border border-pink-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-mono font-bold">
                        <div className="flex items-center space-x-4">
                          <span className="text-emerald-700">Present: {studentsPresent}</span>
                          <span className="text-rose-700">Absent: {studentsAbsent}</span>
                        </div>
                        <span className="text-purple-700">Attendance Rate: {attendancePercent}%</span>
                      </div>
                    )}
                  </div>

                  {/* SECTION 3: PRACTICAL SESSION */}
                  <div className="bg-white border border-pink-200 rounded-3xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider text-purple-900 flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-pink-600" />
                        <span>3. Practical Session &amp; Hands-On Tasks</span>
                      </h3>

                      <div className="flex items-center bg-slate-100 p-1 rounded-xl font-bold">
                        <button
                          type="button"
                          onClick={() => setPracticalConducted(true)}
                          className={`px-3 py-1 rounded-lg transition ${practicalConducted ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-xs' : 'text-slate-600'}`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setPracticalConducted(false)}
                          className={`px-3 py-1 rounded-lg transition ${!practicalConducted ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600'}`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {practicalConducted && (
                      <div className="space-y-3 pt-2">
                        <label className="text-slate-700 font-bold block">Practical Session Tasks Conducted Today</label>
                        {practicalTasks.map((task, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-purple-700 text-xs w-6">{idx + 1}.</span>
                            <input
                              type="text"
                              value={task}
                              onChange={e => handleUpdatePracticalTask(idx, e.target.value)}
                              placeholder={`Task ${idx + 1} description...`}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                            {practicalTasks.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePracticalTask(idx)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={handleAddPracticalTask}
                          className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition border border-purple-200"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Add Another Task</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SECTION 4: STUDENT FEEDBACK */}
                  <div className="bg-white border border-pink-200 rounded-3xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider text-purple-900 flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-pink-600" />
                        <span>4. Student Feedback Received Today</span>
                      </h3>

                      <div className="flex items-center bg-slate-100 p-1 rounded-xl font-bold">
                        <button
                          type="button"
                          onClick={() => setStudentFeedbackReceived(true)}
                          className={`px-3 py-1 rounded-lg transition ${studentFeedbackReceived ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-xs' : 'text-slate-600'}`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentFeedbackReceived(false)}
                          className={`px-3 py-1 rounded-lg transition ${!studentFeedbackReceived ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600'}`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {studentFeedbackReceived && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-slate-700 font-bold block">General Student Feedback / Summary</label>
                          <textarea
                            rows={2}
                            value={studentFeedback}
                            onChange={e => setStudentFeedback(e.target.value)}
                            placeholder="Overall feedback received from class..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-700 font-bold block">Positive Feedback</label>
                          <textarea
                            rows={2}
                            value={studentPositiveFeedback}
                            onChange={e => setStudentPositiveFeedback(e.target.value)}
                            placeholder="Aspects students appreciated..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-700 font-bold block">Difficulties Faced By Students</label>
                          <textarea
                            rows={2}
                            value={studentDifficulties}
                            onChange={e => setStudentDifficulties(e.target.value)}
                            placeholder="Topics students struggled with..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECTION 5: STUDENT / STAFF COMPLAINT SECTION */}
                  <div className="bg-white border border-pink-200 rounded-3xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider text-purple-900 flex items-center space-x-2">
                        <ShieldAlert className="w-4 h-4 text-pink-600" />
                        <span>5. Student / Staff Complaint Section</span>
                      </h3>

                      <div className="flex items-center bg-slate-100 p-1 rounded-xl font-bold">
                        <button
                          type="button"
                          onClick={() => setComplaintReported(true)}
                          className={`px-3 py-1 rounded-lg transition ${complaintReported ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-xs' : 'text-slate-600'}`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setComplaintReported(false)}
                          className={`px-3 py-1 rounded-lg transition ${!complaintReported ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600'}`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {complaintReported && (
                      <div className="space-y-4 pt-2 bg-pink-50/30 p-4 rounded-2xl border border-pink-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-slate-700 font-bold block mb-1">Complaint Raised By</label>
                            <select
                              value={complaintRaisedBy}
                              onChange={e => setComplaintRaisedBy(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                            >
                              <option value="Student">Student</option>
                              <option value="Staff">Staff</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-slate-700 font-bold block mb-1">Name (Optional)</label>
                            <input
                              type="text"
                              value={complaintName}
                              onChange={e => setComplaintName(e.target.value)}
                              placeholder="Name of person raising complaint"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="text-slate-700 font-bold block mb-1">Complaint Category *</label>
                            <select
                              value={complaintCategory}
                              onChange={e => setComplaintCategory(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                            >
                              <option value="Training">Training</option>
                              <option value="Tutor">Tutor</option>
                              <option value="Attendance">Attendance</option>
                              <option value="Infrastructure">Infrastructure</option>
                              <option value="Lab / System">Lab / System</option>
                              <option value="Internet">Internet</option>
                              <option value="Course Content">Course Content</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-700 font-bold block mb-1">Complaint Details *</label>
                          <textarea
                            rows={2}
                            value={complaintDetails}
                            onChange={e => setComplaintDetails(e.target.value)}
                            placeholder="Detailed complaint description..."
                            className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="text-slate-700 font-bold block mb-1">Priority</label>
                          <select
                            value={complaintPriority}
                            onChange={e => setComplaintPriority(e.target.value)}
                            className="w-full md:w-1/3 bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECTION 6: TRAINER REMARKS */}
                  <div className="bg-white border border-pink-200 rounded-3xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider text-purple-900 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-pink-600" />
                      <span>6. Trainer Remarks &amp; Lab Notes</span>
                    </h3>

                    <textarea
                      rows={3}
                      value={trainerRemarks}
                      onChange={e => setTrainerRemarks(e.target.value)}
                      placeholder="Mention student engagement, technical/lab issues, training progress, topics requiring revision..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  {/* SECTION 7: SUMMARY CARD & SUBMIT */}
                  <div className="bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 text-white rounded-3xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/20 pb-3">
                      <div>
                        <h4 className="font-black text-lg text-white">Day {selectedDayNumber} Report Summary</h4>
                        <p className="text-xs text-pink-100">Review your daily log entries before submitting to database.</p>
                      </div>
                      <span className="px-3 py-1 bg-white/20 rounded-full font-mono text-xs font-bold">
                        {dayReportData?.data?.date || new Date().toISOString().split('T')[0]}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-pink-50">
                      <p>Morning Topic: <strong className="text-white">{morningTopic || 'Not entered'}</strong></p>
                      <p>Afternoon Topic: <strong className="text-white">{afternoonTopic || 'Not entered'}</strong></p>
                      <p>Students Present: <strong className="text-white">{studentsPresent} / {totalStudents} ({attendancePercent}%)</strong></p>
                      <p>Practical Session: <strong className="text-white">{practicalConducted ? `Yes (${practicalTasks.length} tasks)` : 'No'}</strong></p>
                      <p>Student Feedback: <strong className="text-white">{studentFeedbackReceived ? 'Received' : 'None'}</strong></p>
                      <p>Complaint Logged: <strong className="text-white">{complaintReported ? `Yes (${complaintCategory})` : 'No'}</strong></p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingReport || !isAttendanceValid}
                        className="px-8 py-3.5 bg-white text-purple-900 hover:bg-pink-50 font-black rounded-2xl text-xs shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                      >
                        <Check className="w-4 h-4 text-pink-600" />
                        <span>{submittingReport ? 'Saving Day Report...' : `Submit Day ${selectedDayNumber} Report`}</span>
                      </button>
                    </div>
                  </div>

                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
