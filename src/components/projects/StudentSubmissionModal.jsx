import React, { useState } from 'react';
import {
  X,
  Upload,
  Send,
  FolderGit2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import projectApi from '../../api/projectApi';

export default function StudentSubmissionModal({
  isOpen,
  onClose,
  assignment,
  onSubmitted
}) {
  const [formData, setFormData] = useState({
    title: '',
    implementationNotes: '',
    githubRepoUrl: '',
    liveDemoUrl: '',
    submissionComments: ''
  });

  const [documents, setDocuments] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !assignment) return null;

  const currentVersion = (assignment.activeSubmissionVersion || 0) + 1;
  const req = assignment.projectRequirementId || {};

  const handleDocumentsChange = (e) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const handleScreenshotsChange = (e) => {
    if (e.target.files) {
      setScreenshots(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Strict GitHub URL validation
    const ghPattern = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(\/.*)?$/;
    if (!ghPattern.test(formData.githubRepoUrl.trim())) {
      setErrorMessage('Please provide a valid GitHub repository URL (e.g. https://github.com/your-username/your-repo).');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title || req.title || 'Final Project Submission');
      data.append('implementationNotes', formData.implementationNotes);
      data.append('githubRepoUrl', formData.githubRepoUrl.trim());
      data.append('liveDemoUrl', formData.liveDemoUrl.trim());
      data.append('submissionComments', formData.submissionComments);

      documents.forEach(doc => {
        data.append('documents', doc);
      });
      screenshots.forEach(sc => {
        data.append('screenshots', sc);
      });

      const res = await projectApi.submitStudentProject(assignment._id, data);
      if (res.data.success) {
        onSubmitted(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to submit project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white border border-purple-200 rounded-2xl max-w-2xl w-full shadow-2xl relative my-auto overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 via-pink-50/40 to-white border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] text-white flex items-center justify-center shadow-sm">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">
                Submit Project Deliverables (Version {currentVersion})
              </h2>
              <p className="text-[11px] text-purple-700 font-medium">
                {req.title} • Project ID: {req.projectId || 'PRJ'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-800 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* GitHub Repo URL */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>GitHub Repository URL *</span>
              <span className="text-[10px] text-purple-600 font-mono">Must be public or accessible</span>
            </label>
            <input
              type="url"
              required
              value={formData.githubRepoUrl}
              onChange={e => setFormData({ ...formData, githubRepoUrl: e.target.value })}
              placeholder="https://github.com/username/project-repository"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
            />
          </div>

          {/* Live Demo URL */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Project Demo / Production Deployment URL (Optional)</label>
            <input
              type="url"
              value={formData.liveDemoUrl}
              onChange={e => setFormData({ ...formData, liveDemoUrl: e.target.value })}
              placeholder="https://your-project.vercel.app or https://aws.cloud..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Implementation Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Implementation Notes & Architecture Details</label>
            <textarea
              rows={3}
              value={formData.implementationNotes}
              onChange={e => setFormData({ ...formData, implementationNotes: e.target.value })}
              placeholder="Describe how you implemented core requirements, patterns used, architecture choices, environment variables needed..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-xs leading-relaxed"
            />
          </div>

          {/* Uploads: Documents & Screenshots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            {/* Supporting Documents / Project Report */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>Project Report / Docs (PDF, DOCX)</span>
              </label>
              <label className="flex items-center justify-center space-x-2 px-3 py-3 border border-dashed border-slate-300 hover:border-purple-400 rounded-xl cursor-pointer bg-slate-50 hover:bg-purple-50/40 transition">
                <Upload className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-slate-700">
                  {documents.length > 0 ? `${documents.length} docs selected` : 'Select Project Report'}
                </span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.zip,.txt"
                  onChange={handleDocumentsChange}
                  className="hidden"
                />
              </label>
              {documents.length > 0 && (
                <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
                  {documents.map((d, i) => (
                    <div key={i} className="truncate">✓ {d.name}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Screenshots / Previews */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 flex items-center space-x-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>Screenshots / Previews (PNG, JPG)</span>
              </label>
              <label className="flex items-center justify-center space-x-2 px-3 py-3 border border-dashed border-slate-300 hover:border-purple-400 rounded-xl cursor-pointer bg-slate-50 hover:bg-purple-50/40 transition">
                <Upload className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-slate-700">
                  {screenshots.length > 0 ? `${screenshots.length} images selected` : 'Select UI Screenshots'}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleScreenshotsChange}
                  className="hidden"
                />
              </label>
              {screenshots.length > 0 && (
                <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
                  {screenshots.map((s, i) => (
                    <div key={i} className="truncate">✓ {s.name}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submission Comments */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Comments for Your Assigned Tutor</label>
            <input
              type="text"
              value={formData.submissionComments}
              onChange={e => setFormData({ ...formData, submissionComments: e.target.value })}
              placeholder="e.g. Completed all authentication endpoints and added responsive mobile styling."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Audit & Evaluation Notice */}
          <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl text-[11px] text-purple-900 space-y-1">
            <div className="font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
              <span>Multi-Tier Verification Workflow</span>
            </div>
            <p className="text-purple-800 leading-relaxed">
              Entering a GitHub URL creates Version {currentVersion}. Your code will be reviewed by your tutor against requirement assertions. Once approved by your tutor, it will undergo executive admin testing before being certified and published to the institute's repository.
            </p>
          </div>

          {/* Submit Action */}
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
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold rounded-xl shadow-md shadow-purple-500/20 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting Version...' : `Submit Version ${currentVersion} for Review`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
