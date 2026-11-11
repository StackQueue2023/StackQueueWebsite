import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  CheckSquare,
  AlertTriangle,
  Send,
  Lock,
  MessageSquare,
  ShieldCheck,
  History,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  Trash2
} from 'lucide-react';
import projectApi from '../../api/projectApi';

export default function TutorReviewModal({
  isOpen,
  onClose,
  assignmentId,
  onReviewed
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'history'

  const [remarks, setRemarks] = useState('');
  const [missingFeatures, setMissingFeatures] = useState([]);
  const [bugsIdentified, setBugsIdentified] = useState([]);
  const [requiredImprovements, setRequiredImprovements] = useState([]);
  const [completedRequirements, setCompletedRequirements] = useState([]);
  const [privateEvaluationNotes, setPrivateEvaluationNotes] = useState('');
  const [testingResults, setTestingResults] = useState('');
  const [knownIssues, setKnownIssues] = useState([]);

  // Helpers for bullet inputs
  const [missingInput, setMissingInput] = useState('');
  const [bugInput, setBugInput] = useState('');
  const [improvementInput, setImprovementInput] = useState('');
  const [issueInput, setIssueInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && assignmentId) {
      loadReviewDetails();
    }
  }, [isOpen, assignmentId]);

  const loadReviewDetails = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await projectApi.getTutorReviewDetail(assignmentId);
      if (res.data.success) {
        setData(res.data.data);
        const reqFeatures = res.data.data.assignment?.projectRequirementId?.requiredFeatures || [];
        setCompletedRequirements(reqFeatures.map(f => f.title));
      }
    } catch (err) {
      console.error('Failed to load review details:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load submission review details.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const assignment = data?.assignment;
  const requirement = assignment?.projectRequirementId;
  const submissions = data?.submissions || [];
  const latestSub = submissions[0];
  const reviews = data?.reviews || [];
  const repoHealth = data?.repoHealth || {};

  const handleToggleCompleted = (title) => {
    if (completedRequirements.includes(title)) {
      setCompletedRequirements(completedRequirements.filter(t => t !== title));
    } else {
      setCompletedRequirements([...completedRequirements, title]);
    }
  };

  const handleAddBullet = (input, setInput, list, setList) => {
    if (input.trim()) {
      setList([...list, input.trim()]);
      setInput('');
    }
  };

  const handleReviewSubmit = async (decision) => {
    if (!remarks.trim()) {
      setErrorMessage('Please provide student-specific evaluation remarks.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const payload = {
        remarks: remarks.trim(),
        missingFeatures,
        bugsIdentified,
        requiredImprovements,
        completedRequirements,
        privateEvaluationNotes: privateEvaluationNotes.trim(),
        testingResults: testingResults.trim() || 'Verified all functional test criteria and Git history.',
        knownIssues,
        decision
      };

      const res = await projectApi.submitTutorReview(assignmentId, payload);
      if (res.data.success) {
        onReviewed(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error('Tutor review submission error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Error recording review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white border border-purple-200 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative my-auto overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 via-pink-50/40 to-white border-b border-purple-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-black text-slate-900">
                  Tutor Code Review & Evaluation
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Version {latestSub?.versionNumber || 1}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {assignment?.status || 'Submitted'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Student: <strong className="text-slate-800">{assignment?.studentId?.name}</strong> ({assignment?.studentId?.studentId || 'N/A'}) • {requirement?.title}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab switchers */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('review')}
                className={`px-3 py-1 rounded-md font-bold transition ${activeTab === 'review' ? 'bg-white text-purple-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Code Review
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded-md font-bold transition flex items-center space-x-1 ${activeTab === 'history' ? 'bg-white text-purple-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History ({submissions.length})</span>
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading / Error states */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-semibold text-xs">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading submitted repository and inspection evidence...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {activeTab === 'history' ? (
              /* Submission History & Previous Tutor Remarks */
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
                  Full Version History & Review Audit Log
                </h3>
                {submissions.map((sub) => {
                  const subReview = reviews.find(r => r.submissionVersion === sub.versionNumber);
                  return (
                    <div key={sub._id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono font-bold text-xs border border-purple-200">
                            Version {sub.versionNumber}
                          </span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {new Date(sub.submittedAt).toLocaleString()}
                          </span>
                        </div>
                        <a
                          href={sub.githubRepoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 font-mono flex items-center space-x-1"
                        >
                          <span>{sub.githubRepoUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {sub.implementationNotes && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                          <span className="font-bold block text-slate-800 mb-0.5">Student Implementation Notes:</span>
                          <p>{sub.implementationNotes}</p>
                        </div>
                      )}

                      {subReview && (
                        <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-purple-900 space-y-1.5">
                          <div className="flex items-center justify-between font-bold">
                            <span>Tutor Review Feedback ({subReview.decision}):</span>
                            <span className="text-[10px] font-mono text-purple-700">{new Date(subReview.reviewedAt).toLocaleDateString()}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-line text-xs font-sans">
                            {subReview.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Main Review Form */
              <>
                {/* 1. Deliverables Banner: GitHub link, Demo link, Commit SHA */}
                <div className="p-4 bg-gradient-to-r from-purple-50/80 via-white to-pink-50/40 border border-purple-200 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 font-mono">
                        Submitted Deliverable Links
                      </span>
                      <div className="flex items-center space-x-2">
                        <a
                          href={latestSub?.githubRepoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold font-mono text-xs shadow-sm transition"
                        >
                          <span>Open GitHub Repository</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {latestSub?.liveDemoUrl && (
                          <a
                            href={latestSub.liveDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-purple-700 border border-purple-300 rounded-xl font-bold text-xs shadow-2xs transition"
                          >
                            <span>Live Demo</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="text-right font-mono text-[11px] space-y-0.5">
                      <div className="text-slate-500">
                        Commit: <strong className="text-slate-800">{latestSub?.commitSha?.slice(0, 8) || 'HEAD'}</strong>
                      </div>
                      <div className="text-slate-500">
                        Repo Status:{' '}
                        <span className={repoHealth.accessible ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                          {repoHealth.accessible ? '✓ Accessible' : 'Public Link'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {latestSub?.implementationNotes && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-xs">
                      <span className="font-bold text-slate-900 block mb-0.5">Student Notes:</span>
                      {latestSub.implementationNotes}
                    </div>
                  )}

                  {/* Screenshots gallery if attached */}
                  {latestSub?.screenshots?.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-bold text-slate-700 text-[11px] block">Submitted Screenshots:</span>
                      <div className="flex flex-wrap gap-2">
                        {latestSub.screenshots.map((sc, i) => (
                          <a
                            key={i}
                            href={sc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden hover:border-purple-400 transition"
                          >
                            <img src={sc.url} alt={sc.originalName || 'Preview'} className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Requirement Assertion Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <CheckSquare className="w-4 h-4 text-purple-600" />
                      <span>Requirements Completion Checklist</span>
                    </label>
                    <span className="text-[11px] text-purple-700 font-bold">
                      {completedRequirements.length} of {requirement?.requiredFeatures?.length || 0} Met
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(requirement?.requiredFeatures || []).map((feat, idx) => {
                      const isChecked = completedRequirements.includes(feat.title);
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleCompleted(feat.title)}
                          className={`p-3 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition ${
                            isChecked
                              ? 'bg-purple-50/60 border-purple-200 text-purple-900'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                          />
                          <div className="space-y-0.5 flex-1">
                            <span className="font-bold block leading-snug">{feat.title}</span>
                            {feat.description && (
                              <span className="text-[11px] text-slate-500 block leading-tight">{feat.description}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Student-Specific Remarks & Feedback */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span>Student-Specific Remarks & Detailed Feedback *</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Provide constructive feedback directly to the student on their repository architecture, commit hygiene, implementation details, and any required fixes..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-xs leading-relaxed"
                  />
                </div>

                {/* 4. Missing Features, Bugs, and Required Improvements (Bullet Points) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Missing Features */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 text-[11px] block">Missing Features</span>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={missingInput}
                        onChange={e => setMissingInput(e.target.value)}
                        placeholder="Add missing item..."
                        className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-[11px] text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddBullet(missingInput, setMissingInput, missingFeatures, setMissingFeatures)}
                        className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <ul className="space-y-1 text-[11px] font-medium text-rose-700 list-disc list-inside">
                      {missingFeatures.map((m, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span className="truncate">{m}</span>
                          <button onClick={() => setMissingFeatures(missingFeatures.filter((_, idx) => idx !== i))}>
                            <X className="w-3 h-3 text-slate-400 hover:text-rose-600" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bugs Identified */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 text-[11px] block">Bugs / Issues Found</span>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={bugInput}
                        onChange={e => setBugInput(e.target.value)}
                        placeholder="Add bug..."
                        className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-[11px] text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddBullet(bugInput, setBugInput, bugsIdentified, setBugsIdentified)}
                        className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <ul className="space-y-1 text-[11px] font-medium text-amber-700 list-disc list-inside">
                      {bugsIdentified.map((b, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span className="truncate">{b}</span>
                          <button onClick={() => setBugsIdentified(bugsIdentified.filter((_, idx) => idx !== i))}>
                            <X className="w-3 h-3 text-slate-400 hover:text-rose-600" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Improvements */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 text-[11px] block">Required Improvements</span>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={improvementInput}
                        onChange={e => setImprovementInput(e.target.value)}
                        placeholder="Add improvement..."
                        className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-[11px] text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddBullet(improvementInput, setImprovementInput, requiredImprovements, setRequiredImprovements)}
                        className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <ul className="space-y-1 text-[11px] font-medium text-purple-700 list-disc list-inside">
                      {requiredImprovements.map((imp, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span className="truncate">{imp}</span>
                          <button onClick={() => setRequiredImprovements(requiredImprovements.filter((_, idx) => idx !== i))}>
                            <X className="w-3 h-3 text-slate-400 hover:text-rose-600" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 5. Private Staff Evaluation Notes */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Private Evaluation Notes (Staff Only)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Never exposed to the student</span>
                  </label>
                  <textarea
                    rows={2}
                    value={privateEvaluationNotes}
                    onChange={e => setPrivateEvaluationNotes(e.target.value)}
                    placeholder="Confidential notes for Executive Admin review regarding candidate performance, problem-solving independence..."
                    className="w-full p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-xs"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-semibold border border-slate-200 transition"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Request Revisions */}
            <button
              type="button"
              onClick={() => handleReviewSubmit('RevisionRequired')}
              disabled={submitting}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl font-bold transition flex items-center space-x-1.5 shadow-2xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Request Revisions</span>
            </button>

            {/* 2. Submit to Admin for Final Testing */}
            <button
              type="button"
              onClick={() => handleReviewSubmit('ApprovedForAdmin')}
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl font-bold shadow-md shadow-purple-500/20 transition flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Submit to Admin for Final Approval</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
