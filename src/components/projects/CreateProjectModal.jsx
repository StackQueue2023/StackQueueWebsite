import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Upload,
  FolderGit2,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import projectApi from '../../api/projectApi';

const CATEGORIES = [
  'Enterprise Software',
  'Full Stack Web Application',
  'Cloud Architecture & DevOps',
  'AI & Machine Learning',
  'Cybersecurity & Network Defense',
  'Mobile Application Development',
  'Data Engineering & Analytics',
  'Blockchain & Web3',
  'IoT & Embedded Systems'
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Industry Level'];

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
  initialData = null
}) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Full Stack Web Application',
    description: '',
    problemStatement: '',
    technicalRequirements: '',
    expectedOutput: '',
    uiUxRequirements: '',
    guidelines: '',
    difficulty: 'Intermediate',
    deadline: '',
    referenceGithubUrl: '',
    status: 'Published'
  });

  const [objectives, setObjectives] = useState(['']);
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState(['React', 'Node.js', 'MongoDB']);
  const [requiredFeatures, setRequiredFeatures] = useState([
    { title: 'User Authentication & RBAC', description: 'Secure JWT or session auth with roles.', isMandatory: true }
  ]);
  const [evaluationCriteria, setEvaluationCriteria] = useState([
    { criterion: 'Functional Completeness & Architecture', weightage: 30, description: 'All core features implemented cleanly.' },
    { criterion: 'Code Quality & Cleanliness', weightage: 25, description: 'Modular code, error handling, readability.' },
    { criterion: 'GitHub Workflow & Commits', weightage: 20, description: 'Meaningful commits and Git hygiene.' },
    { criterion: 'UI/UX Responsiveness & Aesthetics', weightage: 25, description: 'Polished theme, mobile responsiveness.' }
  ]);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [referenceDocs, setReferenceDocs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || 'Full Stack Web Application',
        description: initialData.description || '',
        problemStatement: initialData.problemStatement || '',
        technicalRequirements: initialData.technicalRequirements || '',
        expectedOutput: initialData.expectedOutput || '',
        uiUxRequirements: initialData.uiUxRequirements || '',
        guidelines: initialData.guidelines || '',
        difficulty: initialData.difficulty || 'Intermediate',
        deadline: initialData.deadline ? initialData.deadline.split('T')[0] : '',
        referenceGithubUrl: initialData.referenceGithubUrl || '',
        status: initialData.status || 'Published'
      });
      setObjectives(initialData.objectives?.length ? initialData.objectives : ['']);
      setTechnologies(initialData.technologies?.length ? initialData.technologies : ['React', 'Node.js']);
      setRequiredFeatures(initialData.requiredFeatures?.length ? initialData.requiredFeatures : []);
      setEvaluationCriteria(initialData.evaluationCriteria?.length ? initialData.evaluationCriteria : []);
      setThumbnailPreview(initialData.thumbnailUrl || '');
    } else {
      // Reset
      setFormData({
        title: '',
        category: 'Full Stack Web Application',
        description: '',
        problemStatement: '',
        technicalRequirements: '',
        expectedOutput: '',
        uiUxRequirements: '',
        guidelines: '',
        difficulty: 'Intermediate',
        deadline: '',
        referenceGithubUrl: '',
        status: 'Published'
      });
      setObjectives(['']);
      setTechnologies(['React', 'Node.js', 'MongoDB', 'TailwindCSS']);
      setThumbnailFile(null);
      setThumbnailPreview('');
      setReferenceDocs([]);
    }
    setErrorMessage('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = techInput.trim().replace(/^#/, '');
      if (val && !technologies.includes(val)) {
        setTechnologies([...technologies, val]);
        setTechInput('');
      }
    }
  };

  const removeTech = (tech) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleDocsChange = (e) => {
    if (e.target.files) {
      setReferenceDocs(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim()) {
      setErrorMessage('Project title is required.');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMessage('Project description is required.');
      return;
    }
    if (!formData.problemStatement.trim()) {
      setErrorMessage('Problem statement is required.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      Object.keys(formData).forEach(k => {
        if (formData[k] !== undefined && formData[k] !== null) {
          data.append(k, formData[k]);
        }
      });

      data.append('objectives', JSON.stringify(objectives.filter(o => o.trim())));
      data.append('technologies', JSON.stringify(technologies));
      data.append('requiredFeatures', JSON.stringify(requiredFeatures.filter(f => f.title.trim())));
      data.append('evaluationCriteria', JSON.stringify(evaluationCriteria));

      if (thumbnailFile) {
        data.append('thumbnail', thumbnailFile);
      }
      referenceDocs.forEach(doc => {
        data.append('referenceDocs', doc);
      });

      let res;
      if (initialData?._id) {
        res = await projectApi.updateRequirement(initialData._id, data);
      } else {
        res = await projectApi.createRequirement(data);
      }

      if (res.data.success) {
        onCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error('Error saving project requirement:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to save project requirement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white border border-purple-200 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 via-pink-50/40 to-white border-b border-purple-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] text-white flex items-center justify-center shadow-sm">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {initialData ? 'Edit Project Requirement' : 'Create New Project Requirement'}
              </h2>
              <p className="text-[11px] text-purple-700 font-medium">
                Admin Project CMS • Unique Project ID will be auto-generated
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Basic Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Project Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Enterprise Student Attendance & RFID Analytics System"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Category / Domain *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Difficulty, Deadline, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Difficulty Level</label>
              <select
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {DIFFICULTIES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Submission Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Project Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Published">Published (Available to Tutors)</option>
                <option value="Draft">Draft (Internal Only)</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* 3. Description & Problem Statement */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Project Description *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="High-level architecture overview, purpose, and real-world application..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Problem Statement *</label>
              <textarea
                rows={2}
                required
                value={formData.problemStatement}
                onChange={e => setFormData({ ...formData, problemStatement: e.target.value })}
                placeholder="What specific industry problem does this project solve?..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* 4. Required Tech Stack */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700">Required Technology Stack</label>
            <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px] items-center">
              {technologies.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-purple-50 text-purple-700 font-mono text-[11px] font-bold rounded-lg border border-purple-200 shadow-2xs"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => removeTech(t)}
                    className="hover:text-rose-600 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={techInput}
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                placeholder="Type tech & press Enter (e.g. Next.js, Docker)..."
                className="flex-1 bg-transparent border-none text-xs text-slate-900 outline-none min-w-[200px]"
              />
            </div>
          </div>

          {/* 5. Objectives */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Project Objectives</label>
              <button
                type="button"
                onClick={() => setObjectives([...objectives, ''])}
                className="text-purple-600 hover:text-purple-800 text-[11px] font-bold flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Objective</span>
              </button>
            </div>
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={obj}
                  onChange={e => {
                    const copy = [...objectives];
                    copy[i] = e.target.value;
                    setObjectives(copy);
                  }}
                  placeholder={`Objective #${i + 1} (e.g. Build RESTful backend with rate limiting)`}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {objectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setObjectives(objectives.filter((_, idx) => idx !== i))}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 6. Required Features & Functional Requirements */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Functional Features & Requirements</label>
              <button
                type="button"
                onClick={() => setRequiredFeatures([...requiredFeatures, { title: '', description: '', isMandatory: true }])}
                className="text-purple-600 hover:text-purple-800 text-[11px] font-bold flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Feature</span>
              </button>
            </div>

            <div className="space-y-2">
              {requiredFeatures.map((feat, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={feat.title}
                      onChange={e => {
                        const copy = [...requiredFeatures];
                        copy[i].title = e.target.value;
                        setRequiredFeatures(copy);
                      }}
                      placeholder={`Feature #${i + 1} Title (e.g. Real-time Attendance Geo-fencing)`}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <label className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-600 shrink-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={feat.isMandatory}
                        onChange={e => {
                          const copy = [...requiredFeatures];
                          copy[i].isMandatory = e.target.checked;
                          setRequiredFeatures(copy);
                        }}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Mandatory</span>
                    </label>
                    {requiredFeatures.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setRequiredFeatures(requiredFeatures.filter((_, idx) => idx !== i))}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={feat.description}
                    onChange={e => {
                      const copy = [...requiredFeatures];
                      copy[i].description = e.target.value;
                      setRequiredFeatures(copy);
                    }}
                    placeholder="Brief implementation details or expected edge case handling..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 7. Technical, UI/UX, Expected Output & Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Technical Requirements</label>
              <textarea
                rows={2}
                value={formData.technicalRequirements}
                onChange={e => setFormData({ ...formData, technicalRequirements: e.target.value })}
                placeholder="e.g. Node.js v20+, MongoDB ReplicaSet, Docker Compose..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Expected Output / Deliverables</label>
              <textarea
                rows={2}
                value={formData.expectedOutput}
                onChange={e => setFormData({ ...formData, expectedOutput: e.target.value })}
                placeholder="e.g. Production web application, REST API documentation..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">UI/UX Requirements (Optional)</label>
              <textarea
                rows={2}
                value={formData.uiUxRequirements}
                onChange={e => setFormData({ ...formData, uiUxRequirements: e.target.value })}
                placeholder="Responsive design, mobile-friendly navigation, dark/light modes..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Project Guidelines & Instructions</label>
              <textarea
                rows={2}
                value={formData.guidelines}
                onChange={e => setFormData({ ...formData, guidelines: e.target.value })}
                placeholder="Coding standards, git commit guidelines, testing requirements..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-[11px]"
              />
            </div>
          </div>

          {/* 8. Reference GitHub Repo & Evaluation Criteria */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Optional Reference GitHub Repository</label>
            <input
              type="url"
              value={formData.referenceGithubUrl}
              onChange={e => setFormData({ ...formData, referenceGithubUrl: e.target.value })}
              placeholder="https://github.com/stackqueue/sample-starter-repo"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-[11px]"
            />
          </div>

          {/* 9. Uploads: Thumbnail & Supporting Files */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            {/* Thumbnail */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 flex items-center space-x-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>Project Thumbnail / Preview Image</span>
              </label>
              <div className="flex items-center space-x-3">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-purple-200 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-purple-50 border border-dashed border-purple-300 flex items-center justify-center text-purple-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <label className="px-3 py-2 bg-white border border-slate-200 hover:border-purple-300 rounded-xl text-slate-700 font-semibold text-xs cursor-pointer shadow-2xs hover:bg-purple-50 transition">
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Reference Documents */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>Supporting Files / Reference Docs</span>
              </label>
              <div className="space-y-1">
                <label className="flex items-center justify-center space-x-2 px-3 py-3 border border-dashed border-slate-300 hover:border-purple-400 rounded-xl cursor-pointer bg-slate-50 hover:bg-purple-50/50 transition">
                  <Upload className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-slate-700">
                    {referenceDocs.length > 0 ? `${referenceDocs.length} files selected` : 'Upload PDF specs, diagrams, architecture docs'}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.zip,.png,.jpg"
                    onChange={handleDocsChange}
                    className="hidden"
                  />
                </label>
                {referenceDocs.length > 0 && (
                  <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
                    {referenceDocs.map((f, idx) => (
                      <div key={idx} className="truncate">✓ {f.name} ({(f.size / 1024).toFixed(0)} KB)</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Modal Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            All fields will be synced to database and available to tutors.
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-semibold border border-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl font-bold shadow-md shadow-purple-500/20 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : (initialData ? 'Update Requirement' : 'Publish Requirement')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
