import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FolderGit2,
  Lock,
  GitBranch,
  Sparkles,
  Download
} from 'lucide-react';
import projectApi from '../../api/projectApi';

export default function AdminApprovalModal({
  isOpen,
  onClose,
  assignment,
  onDecided
}) {
  const [adminFeedback, setAdminFeedback] = useState('');
  const [testingResults, setTestingResults] = useState('Executive testing passed: Repository verified, dependencies resolved, zero security violations.');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !assignment) return null;

  const req = assignment.projectRequirementId || {};
  const student = assignment.studentId || {};
  const tutor = assignment.tutorId || {};
  const latestSub = assignment.latestSubmission || {};
  const latestReview = assignment.latestReview || {};

  const handleDecision = async (decision) => {
    if (decision === 'Rejected' && !rejectionReason.trim()) {
      setErrorMessage('Please state the explicit reason for rejection.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const res = await projectApi.handleAdminApproval(assignment._id, {
        decision,
        adminFeedback: adminFeedback.trim(),
        testingResults: testingResults.trim(),
        rejectionReason: rejectionReason.trim()
      });

      if (res.data.success) {
        onDecided(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error('Admin approval error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Error processing admin approval.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white border border-purple-200 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl relative my-auto overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 via-pink-50/40 to-white border-b border-purple-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-900">
                  Executive Testing & Final Project Approval
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Locked Version {latestSub.versionNumber || 1}
                </span>
              </div>
              <p className="text-[11px] text-purple-700 font-medium">
                {req.title} • Project ID: <strong className="font-mono">{req.projectId}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-800">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Project & Reviewer Briefing Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px]">
            <div>
              <span className="text-slate-400 block font-bold uppercase text-[10px]">Student</span>
              <p className="font-bold text-slate-900 text-xs">{student.name}</p>
              <span className="font-mono text-slate-500">{student.studentId || student.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase text-[10px]">Assigned Tutor</span>
              <p className="font-bold text-slate-900 text-xs">{tutor.name || 'Tutor'}</p>
              <span className="text-slate-500">{tutor.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase text-[10px]">Locked Revision Commit</span>
              <p className="font-mono font-bold text-purple-700 text-xs">
                {assignment.lockedCommitSha || latestSub.commitSha || 'HEAD-VERIFIED'}
              </p>
              <span className="text-slate-500 text-[10px]">Submission locked for audit</span>
            </div>
          </div>

          {/* Deliverables / Source Links */}
          <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 font-mono">
                Student Verified Deliverable
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={latestSub.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold font-mono text-xs shadow-sm transition"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Inspect Student GitHub Repository</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {latestSub.liveDemoUrl && (
                  <a
                    href={latestSub.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-purple-700 border border-purple-300 rounded-xl font-bold text-xs shadow-2xs transition"
                  >
                    <span>Test Live Demo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="text-right text-[11px] font-mono text-slate-600">
              <span>Domain: <strong className="text-slate-900">{req.category}</strong></span>
              <br />
              <span>Difficulty: <strong className="text-purple-700">{req.difficulty}</strong></span>
            </div>
          </div>

          {/* Tutor Assessment Review */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5">
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono block">
              Tutor Evaluation & Endorsement
            </span>

            {latestReview.remarks ? (
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-line">
                "{latestReview.remarks}"
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">Tutor recommended this project for final admin testing.</p>
            )}

            {/* Checklist items met */}
            {latestReview.completedRequirements?.length > 0 && (
              <div className="pt-1">
                <span className="font-bold text-slate-700 text-[11px] block mb-1">
                  Completed Requirements Verified by Tutor ({latestReview.completedRequirements.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {latestReview.completedRequirements.map((cr, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{cr}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Private Notes if available */}
            {latestReview.privateEvaluationNotes && (
              <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                <strong className="block mb-0.5">Confidential Staff Notes from Tutor:</strong>
                <p className="leading-relaxed">{latestReview.privateEvaluationNotes}</p>
              </div>
            )}
          </div>

          {/* Admin Testing Results & Decision Inputs */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="font-bold text-slate-800">
                Executive Testing Evidence & Verification Notes
              </label>
              <textarea
                rows={2}
                value={testingResults}
                onChange={e => setTestingResults(e.target.value)}
                placeholder="Enter testing results, lint checks, build logs, and code quality verification notes..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">
                Admin Feedback / Certificate Endorsement Comments
              </label>
              <input
                type="text"
                value={adminFeedback}
                onChange={e => setAdminFeedback(e.target.value)}
                placeholder="Executive comments for student and tutor..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">
                Rejection Reason (Required only if rejecting)
              </label>
              <input
                type="text"
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Specify requirements failure or security concern..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
              />
            </div>
          </div>

          {/* GitHub Replication Notice */}
          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl text-[11px] text-purple-900 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-purple-900">
              <GitBranch className="w-4 h-4 text-purple-700" />
              <span>Automated Institute GitHub Replication Pipeline</span>
            </div>
            <p className="leading-relaxed text-purple-800">
              Upon clicking <strong>Approve & Replicate Project</strong>, the server automatically reads the approved revision from the student's repository, filters out any secret files (like .env) or build caches (node_modules), creates a safe repository in the institute's GitHub account, commits the code tree, and awards <strong>+500 XP</strong> to the student.
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-semibold border border-slate-200 transition"
          >
            Cancel
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Reject */}
            <button
              type="button"
              onClick={() => handleDecision('Rejected')}
              disabled={submitting}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl font-bold transition flex items-center space-x-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject Project</span>
            </button>

            {/* Request Revisions */}
            <button
              type="button"
              onClick={() => handleDecision('RevisionRequired')}
              disabled={submitting}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl font-bold transition flex items-center space-x-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Request Revisions</span>
            </button>

            {/* Final Approve */}
            <button
              type="button"
              onClick={() => handleDecision('Approved')}
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl font-bold shadow-md shadow-purple-500/20 transition flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Approving & Syncing...' : 'Approve & Replicate Project'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
