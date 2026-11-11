import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  UserCheck,
  AlertCircle,
  Search,
  RefreshCw
} from 'lucide-react';
import projectApi from '../../api/projectApi';

export default function AssignProjectModal({
  isOpen,
  onClose,
  onAssigned,
  onSuccess,
  selectedRequirement = null,
  selectedProject = null,
  requirements = []
}) {
  const [projectRequirementId, setProjectRequirementId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deadline, setDeadline] = useState('');
  const [tutorInstructions, setTutorInstructions] = useState('');
  const [expectedDeliverables, setExpectedDeliverables] = useState(
    'GitHub Repository URL with complete source code\nDeployment / Demo link\nTechnical project report\nREADME with setup and test instructions'
  );
  const [submitting, setSubmitting] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const activeReq = selectedRequirement || selectedProject;

  useEffect(() => {
    if (isOpen) {
      if (activeReq?._id) {
        setProjectRequirementId(activeReq._id);
      } else if (requirements.length > 0) {
        setProjectRequirementId(requirements[0]._id);
      }

      // Default deadline to 14 days from now
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDeadline(d.toISOString().split('T')[0]);

      setErrorMessage('');
      setSearchQuery('');
      loadStudents();
    }
  }, [isOpen, selectedRequirement, selectedProject, requirements]);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      setFetchError('');
      const res = await projectApi.getAssignableStudents();
      if (res.data?.success) {
        const list = res.data.data || [];
        setStudents(list);
        if (list.length > 0 && !studentId) {
          setStudentId(list[0]._id);
        }
      } else {
        setFetchError(res.data?.message || 'Failed to load students');
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      setFetchError(err.response?.data?.message || err.message || 'Failed to load eligible students.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter(s =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.studentId && s.studentId.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  }, [students, searchQuery]);

  // If active filtered list changes and studentId is not in it, pick first
  useEffect(() => {
    if (filteredStudents.length > 0) {
      const exists = filteredStudents.some(s => s._id === studentId);
      if (!exists) {
        setStudentId(filteredStudents[0]._id);
      }
    }
  }, [filteredStudents, studentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const targetReqId = projectRequirementId || activeReq?._id;
    if (!targetReqId) {
      setErrorMessage('Please select a project requirement.');
      return;
    }
    if (!studentId) {
      setErrorMessage('Please select a student.');
      return;
    }
    if (!deadline) {
      setErrorMessage('Please set a submission deadline.');
      return;
    }

    try {
      setSubmitting(true);
      const deliverablesList = expectedDeliverables
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await projectApi.assignProjectToStudent({
        projectRequirementId: targetReqId,
        studentId,
        deadline,
        tutorInstructions,
        expectedDeliverables: deliverablesList
      });

      if (res.data?.success) {
        if (typeof onAssigned === 'function') onAssigned(res.data.data);
        if (typeof onSuccess === 'function') onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error('Error assigning project:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to assign project.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentDisplayReq = requirements.find(r => r._id === projectRequirementId) || activeReq;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white border border-purple-200 rounded-2xl max-w-lg w-full shadow-2xl relative my-auto overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 via-pink-50/40 to-white border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] text-white flex items-center justify-center shadow-sm">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Assign Final Project to Student</h2>
              <p className="text-[11px] text-purple-700 font-medium">Tutor Management & Milestone Workflow</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-800">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Project Selection */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Selected Project Requirement *</label>
            {requirements.length > 1 ? (
              <select
                value={projectRequirementId}
                onChange={e => setProjectRequirementId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {requirements.map(r => (
                  <option key={r._id} value={r._id}>
                    [{r.projectId || 'PRJ'}] {r.title} ({r.difficulty || 'Intermediate'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900">
                {currentDisplayReq?.title || 'Project Requirement'}
              </div>
            )}
          </div>

          {/* Student Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Assign To Student *</label>
              {loadingStudents && (
                <span className="text-[11px] text-purple-600 font-medium flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                  Loading students...
                </span>
              )}
            </div>

            {fetchError ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{fetchError}</span>
                </div>
                <button
                  type="button"
                  onClick={loadStudents}
                  className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            ) : (
              <>
                {students.length > 5 && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter by student name, ID or email..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                )}

                <select
                  required
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  disabled={loadingStudents || filteredStudents.length === 0}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                >
                  {loadingStudents ? (
                    <option value="">Loading students...</option>
                  ) : filteredStudents.length === 0 ? (
                    <option value="">No eligible students found</option>
                  ) : (
                    filteredStudents.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.studentId || s.email})
                      </option>
                    ))
                  )}
                </select>

                {students.length > 0 && (
                  <p className="text-[10px] text-slate-500">
                    Showing {filteredStudents.length} of {students.length} eligible students
                  </p>
                )}
              </>
            )}
          </div>

          {/* Deadline */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Student Submission Deadline *</label>
            <input
              type="date"
              required
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
            />
          </div>

          {/* Tutor Instructions */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Tutor Instructions & Guidance</label>
            <textarea
              rows={3}
              value={tutorInstructions}
              onChange={e => setTutorInstructions(e.target.value)}
              placeholder="Add specific instructions for this student (e.g. Focus on clean modular architecture and unit tests before submitting)..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-xs leading-relaxed"
            />
          </div>

          {/* Expected Deliverables */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Expected Deliverables (One per line)</label>
            <textarea
              rows={3}
              value={expectedDeliverables}
              onChange={e => setExpectedDeliverables(e.target.value)}
              placeholder="List expected deliverables..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-[11px] resize-none"
            />
          </div>

          {/* Note on Duplication */}
          <p className="text-[11px] text-slate-500 italic bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
            System automatically prevents duplicate active assignments for the same student on this project.
          </p>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingStudents || filteredStudents.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold rounded-xl shadow-md shadow-purple-500/20 transition disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Assign Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
