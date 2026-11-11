import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/client';
import {
  FileText, Upload, Plus, Sparkles,
  Clock, ChevronDown, ChevronRight, Search, RefreshCw, Code2,
  FileCheck, X
} from 'lucide-react';
import { DOMAIN_CATEGORIES, DEFAULT_DOMAIN_CATEGORY } from '../../constants/domains';

const DOMAINS = [
  { key: 'java',   label: 'Java',   icon: '☕', color: 'from-orange-500 to-red-500',    border: 'border-orange-200', bg: 'bg-orange-50',  text: 'text-orange-700' },
  { key: 'python', label: 'Python', icon: '🐍', color: 'from-violet-500 to-indigo-500', border: 'border-violet-200', bg: 'bg-violet-50',  text: 'text-violet-700' },
  { key: 'cpp',    label: 'C++',    icon: '⚡', color: 'from-purple-500 to-indigo-500', border: 'border-purple-200', bg: 'bg-purple-50',  text: 'text-purple-700' },
  { key: 'react',  label: 'React',  icon: '⚛️', color: 'from-cyan-500 to-teal-500',     border: 'border-cyan-200',   bg: 'bg-cyan-50',    text: 'text-cyan-700'   }
];

export default function AdminSyllabusPage() {
  const [selectedDomain, setSelectedDomain] = useState('java');
  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Accordion state
  const [openModules, setOpenModules] = useState({});

  // PDF Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isNewCourseMode, setIsNewCourseMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'
  const [tasksPerModule, setTasksPerModule] = useState(12);

  // New Course fields
  const [newCourseForm, setNewCourseForm] = useState({
    title: '',
    domain: '',
    category: DEFAULT_DOMAIN_CATEGORY,
    description: '',
    durationWeeks: 12,
    totalHours: 120
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const [domainList, setDomainList] = useState(DOMAINS);

  // Fetch modules & stats for current domain
  const fetchSyllabus = useCallback(async () => {
    setLoading(true);
    try {
      const [modRes, statsRes, domainsRes] = await Promise.all([
        api.get(`/admin/syllabus/modules?domain=${selectedDomain}&search=${encodeURIComponent(searchQuery)}`),
        api.get(`/admin/syllabus/stats?domain=${selectedDomain}`),
        api.get(`/admin/syllabus/domains`).catch(() => null)
      ]);

      if (domainsRes?.data?.success && Array.isArray(domainsRes.data.data) && domainsRes.data.data.length > 0) {
        const fetched = domainsRes.data.data.map(d => ({
          key: d.key,
          label: d.label || d.courseTitle || d.key.toUpperCase(),
          icon: d.icon || '📖',
          color: d.color || 'from-[#8B2BE2] to-[#E02B91]'
        }));
        setDomainList(fetched);
      }

      if (modRes.data?.success) {
        setModules(modRes.data.data);
        const initialOpen = {};
        modRes.data.data.forEach((m, idx) => { initialOpen[m._id] = idx === 0; });
        setOpenModules(prev => ({ ...initialOpen, ...prev }));
      }

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching syllabus:', err);
      showToast('Error loading syllabus data.');
    } finally {
      setLoading(false);
    }
  }, [selectedDomain, searchQuery]);

  useEffect(() => {
    fetchSyllabus();
  }, [fetchSyllabus]);

  useEffect(() => {
    if (uploadModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [uploadModalOpen]);

  const toggleModule = (id) => {
    setOpenModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const updated = {};
    modules.forEach(m => { updated[m._id] = true; });
    setOpenModules(updated);
  };

  const collapseAll = () => {
    setOpenModules({});
  };

  // Open Upload Modal for Existing Course
  const handleOpenUploadForCurrent = () => {
    setIsNewCourseMode(false);
    setSelectedFile(null);
    setPastedText('');
    setUploadProgressMsg('');
    setUploadModalOpen(true);
  };

  // Open Upload Modal for New Course
  const handleOpenNewCourseModal = () => {
    setIsNewCourseMode(true);
    setSelectedFile(null);
    setPastedText('');
    setUploadProgressMsg('');
    setNewCourseForm({
      title: '',
      domain: '',
      category: DEFAULT_DOMAIN_CATEGORY,
      level: 'All Levels',
      description: '',
      durationWeeks: 12,
      totalHours: 120
    });
    setUploadModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  // Submit PDF Syllabus & Trigger Auto Generation
  const handleUploadSyllabus = async (e) => {
    e.preventDefault();

    if (inputMode === 'file' && !selectedFile) {
      alert('Please choose a syllabus PDF file to upload.');
      return;
    }
    if (inputMode === 'text' && !pastedText.trim()) {
      alert('Please paste syllabus text.');
      return;
    }

    if (isNewCourseMode) {
      if (!newCourseForm.title.trim()) {
        alert('Please enter course title.');
        return;
      }
    }

    setUploading(true);
    setUploadProgressMsg('Reading & extracting syllabus text from document...');

    try {
      const formData = new FormData();
      if (inputMode === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('text', pastedText);
      }

      formData.append('tasksPerModule', tasksPerModule);

      if (isNewCourseMode) {
        const derivedDomain = (newCourseForm.domain || newCourseForm.title).toLowerCase().replace(/[^a-z0-9]/g, '');
        formData.append('isNewCourse', 'true');
        formData.append('courseTitle', newCourseForm.title);
        formData.append('domain', derivedDomain);
        formData.append('category', newCourseForm.category);
        formData.append('level', newCourseForm.level || 'All Levels');
        formData.append('description', newCourseForm.description);
        formData.append('durationWeeks', newCourseForm.durationWeeks);
        formData.append('totalHours', newCourseForm.totalHours);
      } else {
        formData.append('domain', selectedDomain);
        const currentMeta = DOMAINS.find(d => d.key === selectedDomain);
        formData.append('courseTitle', currentMeta?.label || selectedDomain);
      }

      setUploadProgressMsg('Splitting syllabus into modules & auto-generating 10-15 tasks per module...');

      const res = await api.post('/admin/syllabus/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });

      if (res.data.success) {
        showToast(res.data.message || 'Syllabus parsed and tasks generated successfully!');
        setUploadModalOpen(false);

        if (isNewCourseMode && newCourseForm.domain) {
          setSelectedDomain(newCourseForm.domain.toLowerCase());
        }
        fetchSyllabus();
      }
    } catch (err) {
      console.error('Upload syllabus error:', err);
      alert(err.response?.data?.message || err.userMessage || err.message || 'Failed to process syllabus PDF. Please check the file format.');
    } finally {
      setUploading(false);
      setUploadProgressMsg('');
    }
  };

  const currentDomainObj = domainList.find(d => d.key === selectedDomain) || {
    key: selectedDomain,
    label: selectedDomain.toUpperCase(),
    icon: '📘',
    color: 'from-[#8B2BE2] to-[#E02B91]'
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto px-2 sm:px-4">

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-in-right text-xs sm:text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP HERO BANNER: AI Syllabus & PDF Ingestion ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E02B91]">
            <Sparkles className="w-4 h-4" />
            <span>Automated Syllabus & Task Generation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Syllabus PDF Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed font-medium">
            Upload your course syllabus document as a PDF. The system automatically extracts modules, structures topics, and prepares <strong>10 to 15 sequential coding, quiz, and debugging tasks</strong> for each module ready for students.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={handleOpenUploadForCurrent}
            className="px-5 py-3 bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-pink-500/10 hover:shadow-lg transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Syllabus PDF</span>
          </button>

          <button
            onClick={handleOpenNewCourseModal}
            className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#E02B91]" />
            <span>Add New Course</span>
          </button>
        </div>
      </div>

      {/* ── DOMAIN SELECTION TABS & REFRESH ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Domain Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {domainList.map((d) => {
            const isSelected = selectedDomain === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setSelectedDomain(d.key)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{d.icon}</span>
                <span>{d.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side helper info */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenUploadForCurrent}
            className="px-3.5 py-2 text-xs font-bold text-[#E02B91] bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Update {currentDomainObj.label} Syllabus</span>
          </button>

          <button
            onClick={fetchSyllabus}
            title="Refresh Syllabus"
            className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#E02B91]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── METRICS SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-xl text-[#E02B91] shrink-0">
            🌐
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Domains</p>
            <p className="text-2xl font-black text-slate-900">{stats?.totalDomains || 4}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentDomainObj.color} text-white flex items-center justify-center text-xl shadow-xs shrink-0`}>
            {currentDomainObj.icon}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{currentDomainObj.label} Modules</p>
            <p className="text-2xl font-black text-slate-900">{modules.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-xl text-purple-600 shrink-0">
            📝
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Generated Tasks</p>
            <p className="text-2xl font-black text-slate-900">{stats?.totalTasks || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl text-emerald-600 shrink-0">
            ⚡
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tasks / Module</p>
            <p className="text-2xl font-black text-emerald-700">10 – 15</p>
          </div>
        </div>
      </div>

      {/* ── SEARCH & ACCORDION TOOLBAR ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search module or task title..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E02B91]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Expand All Modules
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* ── MODULES & AUTO-GENERATED TASKS ACCORDION ── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] bg-white rounded-3xl border border-slate-200">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#E02B91] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading syllabus modules...</p>
          </div>
        </div>
      ) : modules.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 text-[#E02B91] flex items-center justify-center text-3xl mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800">
            No syllabus uploaded for {currentDomainObj.label} yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Upload the course syllabus PDF file. The system will parse each module and generate 10–15 practice tasks automatically.
          </p>
          <button
            onClick={handleOpenUploadForCurrent}
            className="px-6 py-3 bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] text-white font-bold text-xs rounded-xl shadow-md hover:opacity-95 transition inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload {currentDomainObj.label} Syllabus PDF</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((m) => {
            const isOpen = Boolean(openModules[m._id]);
            const taskCount = m.tasks?.length || 0;

            return (
              <div
                key={m._id}
                className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden transition-all duration-200 hover:border-slate-300"
              >
                {/* Module Bar */}
                <div
                  onClick={() => toggleModule(m._id)}
                  className="p-5 sm:p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none border-b border-slate-100"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentDomainObj.color} text-white font-black text-base flex items-center justify-center shadow-xs shrink-0`}>
                      {String(m.order).padStart(2, '0')}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                          Module {m.order}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Syllabus
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          {taskCount} Tasks Ready
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                        {m.title}
                      </h3>

                      {m.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {m.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-bold text-slate-400">
                      {isOpen ? 'Collapse' : 'Expand'}
                    </span>
                    <div className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl">
                      {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* 10-15 Generated Tasks List */}
                {isOpen && (
                  <div className="p-4 sm:p-6 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1 mb-2">
                      <span className="flex items-center gap-1.5 text-[#E02B91]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>System Generated Tasks & Challenges ({taskCount} Total)</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Visible to Students in Domain Page
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {(m.tasks || []).map((t, idx) => (
                        <div
                          key={t._id || idx}
                          className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition"
                        >
                          <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700 shrink-0">
                              {t.order || idx + 1}
                            </div>

                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-black text-slate-900 truncate max-w-md">
                                  {t.title}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 capitalize">
                                  {t.taskType}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  t.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  t.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {t.difficulty}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                                  +{t.points} pts
                                </span>
                                {t.estimatedTime && (
                                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {t.estimatedTime}
                                  </span>
                                )}
                              </div>

                              {t.description && (
                                <p className="text-xs text-slate-500 line-clamp-1">
                                  {t.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              Ready
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL: UPLOAD SYLLABUS PDF & GENERATE TASKS
         ══════════════════════════════════════════════════════ */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/20 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-scale-up">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E02B91] to-[#8B2BE2] text-white flex items-center justify-center shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {isNewCourseMode ? 'Add New Course with Syllabus' : `Update Syllabus PDF — ${currentDomainObj.label}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Upload PDF syllabus to auto-split modules & generate 10-15 tasks
                  </p>
                </div>
              </div>
              <button
                disabled={uploading}
                onClick={() => setUploadModalOpen(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSyllabus} className="space-y-4">
              {/* If New Course Mode: input title and domain slug */}
              {isNewCourseMode && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-600">
                    New Course Information
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Course Title *</label>
                    <input
                      type="text"
                      required
                      value={newCourseForm.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setNewCourseForm({
                          ...newCourseForm,
                          title,
                          domain: title.toLowerCase().replace(/[^a-z0-9]/g, '')
                        });
                      }}
                      placeholder="e.g. Flutter Mobile Engineering"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E02B91]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Category / Domain</label>
                      <select
                        value={newCourseForm.category}
                        onChange={(e) => setNewCourseForm({ ...newCourseForm, category: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E02B91]"
                      >
                        {DOMAIN_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Level</label>
                      <select
                        value={newCourseForm.level}
                        onChange={(e) => setNewCourseForm({ ...newCourseForm, level: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E02B91]"
                      >
                        <option value="All Levels">All Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Duration (Weeks)</label>
                      <input
                        type="number"
                        min="1"
                        value={newCourseForm.durationWeeks}
                        onChange={(e) => setNewCourseForm({ ...newCourseForm, durationWeeks: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E02B91]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Total Hours</label>
                      <input
                        type="number"
                        min="1"
                        value={newCourseForm.totalHours}
                        onChange={(e) => setNewCourseForm({ ...newCourseForm, totalHours: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E02B91]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Description *</label>
                    <textarea
                      rows="2"
                      required
                      value={newCourseForm.description}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, description: e.target.value })}
                      placeholder="Brief overview of the curriculum"
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E02B91] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Input Mode Toggle: File Upload vs Text Paste */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    inputMode === 'file' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Upload PDF File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    inputMode === 'text' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Paste Syllabus Text</span>
                </button>
              </div>

              {/* File Upload Zone */}
              {inputMode === 'file' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#E02B91] bg-slate-50 hover:bg-pink-50/20 rounded-2xl p-6 text-center cursor-pointer transition space-y-3"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#E02B91] flex items-center justify-center text-xl mx-auto">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-900">{selectedFile.name}</p>
                      <p className="text-[11px] text-emerald-600 font-bold">
                        {(selectedFile.size / 1024).toFixed(1)} KB — Ready to Parse
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800">
                        Click or drag syllabus PDF here
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supports standard course curriculum PDF documents
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Paste Syllabus Content</label>
                  <textarea
                    rows="6"
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Module 1: Introduction to Variables&#10;- Basic syntax and setup&#10;- Primitive data types&#10;&#10;Module 2: Object-Oriented Principles&#10;- Classes and Objects&#10;- Inheritance and Polymorphism"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E02B91] resize-none"
                  />
                </div>
              )}

              {/* Configuration: Questions per module */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div>
                  <p className="text-xs font-bold text-slate-800">Tasks Generated Per Module</p>
                  <p className="text-[11px] text-slate-400">Recommended 10 to 15 sequential tasks</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="15"
                    value={tasksPerModule}
                    onChange={(e) => setTasksPerModule(parseInt(e.target.value, 10) || 12)}
                    className="w-16 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-black text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E02B91]"
                  />
                  <span className="text-xs font-bold text-slate-500">Tasks</span>
                </div>
              </div>

              {/* Progress feedback when parsing */}
              {uploading && (
                <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl flex items-center gap-3 text-xs text-[#E02B91] font-bold animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  <span>{uploadProgressMsg || 'Processing syllabus PDF...'}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{uploading ? 'Generating Tasks...' : 'Parse PDF & Generate Tasks'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
