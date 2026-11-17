import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import {
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Code2,
  HelpCircle,
  Bug,
  Calendar,
  Clock,
  Building2,
  Save,
  Check,
  Eye,
  X
} from 'lucide-react';

export default function CollegeTrainingSyllabusManager({
  batchId,
  batch,
  college,
  onRefreshBatch
}) {
  const [syllabus, setSyllabus] = useState(null);
  const [modulesData, setModulesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);

  // Form states
  const [isEditingSyllabus, setIsEditingSyllabus] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [domain, setDomain] = useState('General');
  const [trainingDays, setTrainingDays] = useState(10);
  const [durationHours, setDurationHours] = useState(40);
  const [rawText, setRawText] = useState('');
  const [units, setUnits] = useState([]);

  // Accordion state for modules
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [selectedQuestionForView, setSelectedQuestionForView] = useState(null);

  // Add Question Modal state
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [selectedModuleIdForQuestion, setSelectedModuleIdForQuestion] = useState(null);
  const [newQuestionForm, setNewQuestionForm] = useState({
    title: '',
    topic: '',
    type: 'coding',
    difficulty: 'Easy',
    instructions: '',
    starterCode: '',
    solutionCode: '',
    testCasesStr: '',
    mcqOptionA: '',
    mcqOptionB: '',
    mcqOptionC: '',
    mcqOptionD: '',
    correctOptionId: 'opt_a',
    explanation: ''
  });
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // Fetch Syllabus and Modules
  const fetchData = useCallback(async () => {
    if (!batchId) return;
    setLoading(true);
    setMessage(null);
    try {
      const [sylRes, modRes] = await Promise.allSettled([
        api.get(`/admin/college-training/syllabus/batch/${batchId}`),
        api.get(`/admin/college-training/modules/batch/${batchId}`)
      ]);

      if (sylRes.status === 'fulfilled' && sylRes.value.data?.syllabus) {
        const syl = sylRes.value.data.syllabus;
        setSyllabus(syl);
        setCourseName(syl.courseName || batch?.name || '');
        setDomain(syl.domain || 'General');
        setTrainingDays(syl.trainingDays || batch?.trainingDays?.length || 10);
        setDurationHours(syl.durationHours || 40);
        setRawText(syl.rawSyllabusText || '');
        setUnits(syl.units || []);
      } else {
        setSyllabus(null);
        setCourseName(batch?.name || '');
        setDomain(batch?.department || 'General');
        setTrainingDays(batch?.trainingDays?.length || 10);
        setDurationHours(40);
        setUnits([
          {
            unitNumber: 1,
            title: `${batch?.name || 'College Training'} Fundamentals`,
            topics: [
              {
                title: 'Core Concepts & Setup',
                subtopics: ['Environment Setup', 'Syntax Essentials', 'Hands-on Practice'],
                estimatedHours: 4
              }
            ],
            estimatedDays: 2
          }
        ]);
        setIsEditingSyllabus(true);
      }

      if (modRes.status === 'fulfilled' && modRes.value.data?.modules) {
        setModulesData(modRes.value.data.modules);
        if (modRes.value.data.modules.length > 0 && !expandedModuleId) {
          setExpandedModuleId(modRes.value.data.modules[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching syllabus data:', err);
    } finally {
      setLoading(false);
    }
  }, [batchId, batch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Unit Management
  const handleAddUnit = () => {
    const nextNum = units.length + 1;
    setUnits([
      ...units,
      {
        unitNumber: nextNum,
        title: `Unit ${nextNum}: Advanced Topics`,
        topics: [
          {
            title: 'Topic Overview',
            subtopics: ['Subtopic 1', 'Subtopic 2'],
            estimatedHours: 4
          }
        ],
        estimatedDays: 2
      }
    ]);
  };

  const handleRemoveUnit = (index) => {
    const updated = units.filter((_, idx) => idx !== index);
    // Renumber
    const renumbered = updated.map((u, i) => ({ ...u, unitNumber: i + 1 }));
    setUnits(renumbered);
  };

  const handleUnitTitleChange = (index, newTitle) => {
    const updated = [...units];
    updated[index].title = newTitle;
    setUnits(updated);
  };

  const handleAddTopic = (unitIndex) => {
    const updated = [...units];
    updated[unitIndex].topics.push({
      title: 'New Topic',
      subtopics: ['Hands-on Exercise'],
      estimatedHours: 4
    });
    setUnits(updated);
  };

  const handleRemoveTopic = (unitIndex, topicIndex) => {
    const updated = [...units];
    updated[unitIndex].topics = updated[unitIndex].topics.filter((_, idx) => idx !== topicIndex);
    setUnits(updated);
  };

  const handleTopicTitleChange = (unitIndex, topicIndex, newTitle) => {
    const updated = [...units];
    updated[unitIndex].topics[topicIndex].title = newTitle;
    setUnits(updated);
  };

  const handleTopicSubtopicsChange = (unitIndex, topicIndex, subtopicsStr) => {
    const updated = [...units];
    updated[unitIndex].topics[topicIndex].subtopics = subtopicsStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    setUnits(updated);
  };

  // Auto-parse raw text into units
  const handleParseRawText = () => {
    if (!rawText.trim()) return;
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedUnits = [];
    let curUnit = null;

    lines.forEach((line) => {
      const isUnitHeader = /^(unit|module|chapter|day)\s*([0-9ivxlcdm]+)?\s*[:.-]?\s*(.*)$/i.exec(line);
      if (isUnitHeader) {
        if (curUnit) parsedUnits.push(curUnit);
        const uNum = parsedUnits.length + 1;
        curUnit = {
          unitNumber: uNum,
          title: isUnitHeader[3] || `Unit ${uNum}`,
          topics: [],
          estimatedDays: 2
        };
      } else {
        if (!curUnit) {
          curUnit = {
            unitNumber: 1,
            title: `${courseName || 'Training'} Fundamentals`,
            topics: [],
            estimatedDays: 2
          };
        }
        const isBullet = /^[-*•·>0-9.)]\s*(.*)$/.exec(line);
        const topicText = isBullet ? isBullet[1] : line;
        curUnit.topics.push({
          title: topicText,
          subtopics: ['Core Practice'],
          estimatedHours: 4
        });
      }
    });

    if (curUnit) parsedUnits.push(curUnit);
    if (parsedUnits.length > 0) {
      setUnits(parsedUnits);
      setMessage({ type: 'success', text: `Parsed ${parsedUnits.length} units from syllabus text.` });
    }
  };

  // Save Syllabus
  const handleSaveSyllabus = async () => {
    if (!courseName.trim()) {
      setMessage({ type: 'error', text: 'Course / Domain Name is required.' });
      return;
    }
    if (units.length === 0) {
      setMessage({ type: 'error', text: 'Please define at least 1 unit with topics.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await api.post('/admin/college-training/syllabus/save', {
        batchId,
        collegeId: college?._id || batch?.collegeId?._id || batch?.collegeId,
        courseName,
        domain,
        trainingDays: Number(trainingDays),
        durationHours: Number(durationHours),
        rawSyllabusText: rawText,
        units
      });

      if (res.data?.success) {
        setSyllabus(res.data.syllabus);
        setIsEditingSyllabus(false);
        setMessage({ type: 'success', text: 'Syllabus saved to database successfully.' });
        if (onRefreshBatch) onRefreshBatch();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save syllabus.' });
    } finally {
      setSaving(false);
    }
  };

  // Generate Modules & Questions
  const handleGenerateModules = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      const res = await api.post(`/admin/college-training/syllabus/generate/${batchId}`);
      if (res.data?.success) {
        setMessage({
          type: 'success',
          text: `Generated ${res.data.result.modulesCount} modules and ${res.data.result.questionsCount} questions strictly aligned with syllabus.`
        });
        await fetchData();
        if (onRefreshBatch) onRefreshBatch();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to generate modules.' });
    } finally {
      setGenerating(false);
    }
  };

  // Add Question Submit
  const handleAddQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedModuleIdForQuestion || !newQuestionForm.title.trim()) return;

    setSubmittingQuestion(true);
    try {
      let testCases = [];
      if (newQuestionForm.testCasesStr.trim()) {
        try {
          testCases = JSON.parse(newQuestionForm.testCasesStr);
        } catch {
          testCases = newQuestionForm.testCasesStr.split('\n').filter(Boolean).map(tc => ({
            input: tc,
            expectedOutput: 'OK',
            isHidden: false
          }));
        }
      }

      const mcqOptions = newQuestionForm.type === 'mcq' ? [
        { optionId: 'opt_a', text: newQuestionForm.mcqOptionA, isCorrect: newQuestionForm.correctOptionId === 'opt_a' },
        { optionId: 'opt_b', text: newQuestionForm.mcqOptionB, isCorrect: newQuestionForm.correctOptionId === 'opt_b' },
        { optionId: 'opt_c', text: newQuestionForm.mcqOptionC, isCorrect: newQuestionForm.correctOptionId === 'opt_c' },
        { optionId: 'opt_d', text: newQuestionForm.mcqOptionD, isCorrect: newQuestionForm.correctOptionId === 'opt_d' }
      ] : [];

      const res = await api.post(`/admin/college-training/modules/${selectedModuleIdForQuestion}/questions`, {
        ...newQuestionForm,
        testCases,
        mcqOptions
      });

      if (res.data?.success) {
        setIsAddQuestionModalOpen(false);
        setMessage({ type: 'success', text: 'Question added successfully.' });
        fetchData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add question.' });
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await api.delete(`/admin/college-training/questions/${questionId}`);
      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Question removed.' });
        fetchData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete question.' });
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200">
        <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading Syllabus & Modules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs">
      {/* Alert / Notification banner */}
      {message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border ${
          message.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center space-x-2.5">
            {message.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span className="font-bold">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                Syllabus Architecture & Auto-Generation
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                syllabus?.status === 'MODULES_GENERATED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {syllabus?.status === 'MODULES_GENERATED' ? 'Modules Active' : 'Syllabus Saved'}
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>{courseName || batch?.name || 'College Training Syllabus'}</span>
            </h2>
            <p className="text-slate-500 text-xs">
              Mapped to <strong>{college?.name || batch?.collegeId?.name || 'Partner College'}</strong> &bull; Batch <strong>{batch?.code || 'BATCH'}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {!isEditingSyllabus && (
              <button
                type="button"
                onClick={() => setIsEditingSyllabus(true)}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Edit Syllabus</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleGenerateModules}
              disabled={generating || !syllabus}
              className={`px-4 py-2 rounded-xl font-black text-xs flex items-center space-x-2 transition cursor-pointer shadow-xs ${
                generating || !syllabus
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Generating Modules...' : 'Generate Modules & Questions'}</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Training Days</span>
            <span className="text-sm font-black text-slate-900 flex items-center space-x-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{trainingDays} Days</span>
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Curriculum Hours</span>
            <span className="text-sm font-black text-slate-900 flex items-center space-x-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{durationHours} Hours</span>
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Syllabus Units</span>
            <span className="text-sm font-black text-slate-900 flex items-center space-x-1 mt-0.5">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>{units.length} Units</span>
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Modules & Questions</span>
            <span className="text-sm font-black text-emerald-700 flex items-center space-x-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{modulesData.length} Mods / {modulesData.reduce((acc, m) => acc + (m.questions?.length || 0), 0)} Qs</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── SYLLABUS EDITING / CONFIGURATION SECTION ──────────────── */}
      {isEditingSyllabus && (
        <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Configure Syllabus & Units</span>
              </h3>
              <p className="text-slate-500 text-xs">
                Add units, topics, and subtopics. Only questions directly from this syllabus will be generated.
              </p>
            </div>
            {syllabus && (
              <button
                type="button"
                onClick={() => setIsEditingSyllabus(false)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Course / Domain Name *</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Core Java Full Stack"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Department / Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. CSE / IT / AI"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Training Days</label>
              <input
                type="number"
                min="1"
                value={trainingDays}
                onChange={(e) => setTrainingDays(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Total Hours</label>
              <input
                type="number"
                min="1"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-blue-500"
              />
            </div>
          </div>

          {/* Raw Text Syllabus Paste / Import Helper */}
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Paste Syllabus Text (Optional: Auto-Parses Units & Topics)</span>
              </label>
              <button
                type="button"
                onClick={handleParseRawText}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
              >
                Parse Into Units
              </button>
            </div>
            <textarea
              rows="3"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste college syllabus units and topic lists here... e.g.:&#10;Unit 1: Object Oriented Programming&#10;- Classes & Objects&#10;- Inheritance & Polymorphism&#10;Unit 2: Collections Framework&#10;- ArrayList & LinkedList&#10;- Maps and HashSets"
              className="w-full bg-white border border-blue-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-blue-500"
            />
          </div>

          {/* Units Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Syllabus Units ({units.length})</span>
              <button
                type="button"
                onClick={handleAddUnit}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold flex items-center space-x-1 transition cursor-pointer border border-blue-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Unit</span>
              </button>
            </div>

            <div className="space-y-3">
              {units.map((unit, uIdx) => (
                <div key={uIdx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {unit.unitNumber || (uIdx + 1)}
                      </span>
                      <input
                        type="text"
                        value={unit.title}
                        onChange={(e) => handleUnitTitleChange(uIdx, e.target.value)}
                        placeholder={`Unit ${uIdx + 1} Title`}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:outline-blue-500 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveUnit(uIdx)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      title="Remove Unit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Topics List in Unit */}
                  <div className="pl-8 space-y-2 border-l-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600">Topics & Subtopics</span>
                      <button
                        type="button"
                        onClick={() => handleAddTopic(uIdx)}
                        className="text-[11px] text-blue-700 font-bold hover:underline cursor-pointer flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Topic</span>
                      </button>
                    </div>

                    {unit.topics.map((topic, tIdx) => (
                      <div key={tIdx} className="bg-white border border-slate-200 p-2.5 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={topic.title}
                            onChange={(e) => handleTopicTitleChange(uIdx, tIdx, e.target.value)}
                            placeholder="Topic Name"
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveTopic(uIdx, tIdx)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={(topic.subtopics || []).join(', ')}
                          onChange={(e) => handleTopicSubtopicsChange(uIdx, tIdx, e.target.value)}
                          placeholder="Subtopics (comma-separated, e.g. Inheritance, Polymorphism, Abstract classes)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-600 font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveSyllabus}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center space-x-2 transition cursor-pointer shadow-sm text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Syllabus...' : 'Save Syllabus to Database'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── GENERATED MODULES & QUESTIONS ACCORDION LIST ──────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Assigned Syllabus Modules ({modulesData.length})</span>
            </h3>
            <p className="text-slate-500 text-xs">
              Organized sequentially. Every module maps strictly to this college batch's curriculum.
            </p>
          </div>

          {modulesData.length > 0 && (
            <button
              type="button"
              onClick={handleGenerateModules}
              disabled={generating}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold flex items-center space-x-1.5 transition text-xs cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${generating ? 'animate-spin' : ''}`} />
              <span>Regenerate Modules</span>
            </button>
          )}
        </div>

        {modulesData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No Learning Modules Generated Yet</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Please save the batch syllabus above and click <strong>"Generate Modules & Questions"</strong> to automatically create strictly aligned modules, questions, and test cases.
            </p>
            <button
              type="button"
              onClick={() => setIsEditingSyllabus(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs inline-flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Configure Syllabus</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {modulesData.map((mod, mIdx) => {
              const isExpanded = expandedModuleId === mod._id;
              const questions = mod.questions || [];
              const codingCount = questions.filter(q => q.type === 'coding').length;
              const mcqCount = questions.filter(q => q.type === 'mcq').length;
              const debugCount = questions.filter(q => q.type === 'debugging').length;

              return (
                <div key={mod._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  {/* Module Accordion Header */}
                  <div
                    onClick={() => setExpandedModuleId(isExpanded ? null : mod._id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
                        {mod.order || (mIdx + 1)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h4 className="font-black text-slate-900 text-sm truncate">{mod.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            mod.isCompletedForBatch
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {mod.isCompletedForBatch ? 'Completed by all students' : `${mod.completedStudentsCount} / ${mod.totalStudentsCount} Students Completed`}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs truncate mt-0.5">
                          {mod.topics?.map(t => t.title).join(' • ') || mod.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 ml-3">
                      <div className="hidden sm:flex items-center space-x-2 text-[11px] font-bold text-slate-600">
                        {codingCount > 0 && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">{codingCount} Coding</span>}
                        {mcqCount > 0 && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-200">{mcqCount} MCQ</span>}
                        {debugCount > 0 && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-200">{debugCount} Debug</span>}
                      </div>

                      {/* Batch Progress Bar */}
                      <div className="w-24 hidden md:block">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${mod.batchCompletionPercent || 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 text-right block mt-0.5">{mod.batchCompletionPercent || 0}%</span>
                      </div>

                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Questions Area */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4">
                      {/* Topics Overview Chips */}
                      {mod.topics?.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Syllabus Topics Covered in this Module</span>
                          <div className="flex flex-wrap gap-1.5">
                            {mod.topics.map((t, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold">
                                {t.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Questions List Header */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-bold text-slate-900 text-xs">Generated Questions ({questions.length})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModuleIdForQuestion(mod._id);
                            setIsAddQuestionModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Question</span>
                        </button>
                      </div>

                      {/* Questions Cards */}
                      <div className="space-y-2.5">
                        {questions.map((q, qIdx) => (
                          <div key={q._id} className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 hover:border-blue-200 transition">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    q.type === 'coding' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    q.type === 'mcq' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                    'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {q.type}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">{q.difficulty}</span>
                                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                    Topic: {q.topic}
                                  </span>
                                </div>
                                <h5 className="font-bold text-slate-900 text-xs">{q.title}</h5>
                                <p className="text-slate-600 text-[11px] line-clamp-2">{q.instructions}</p>
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setSelectedQuestionForView(q)}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 cursor-pointer"
                                  title="View Details & Solution"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuestion(q._id)}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                                  title="Delete Question"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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
      </div>

      {/* ─── MODAL: VIEW QUESTION & TESTING SOLUTION ───────────────── */}
      {selectedQuestionForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative border border-slate-100 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedQuestionForView(null)}
              className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {selectedQuestionForView.type} Challenge &bull; {selectedQuestionForView.difficulty}
              </span>
              <h3 className="font-black text-slate-900 text-base">{selectedQuestionForView.title}</h3>
              <p className="text-xs text-slate-500">Topic: {selectedQuestionForView.topic}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-xs">
              <strong>Instructions:</strong>
              <p className="mt-1">{selectedQuestionForView.instructions}</p>
            </div>

            {/* MCQ Options Display */}
            {selectedQuestionForView.type === 'mcq' && (
              <div className="space-y-2">
                <span className="font-bold text-slate-800 text-xs">Multiple Choice Options:</span>
                <div className="space-y-1.5">
                  {selectedQuestionForView.mcqOptions?.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        opt.isCorrect || opt.optionId === selectedQuestionForView.correctOptionId
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{opt.text}</span>
                      {(opt.isCorrect || opt.optionId === selectedQuestionForView.correctOptionId) && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">Correct</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Starter Code */}
            {selectedQuestionForView.starterCode && (
              <div className="space-y-1">
                <span className="font-bold text-slate-800 text-xs">Starter Code Template:</span>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {selectedQuestionForView.starterCode}
                </pre>
              </div>
            )}

            {/* Solution Code */}
            {selectedQuestionForView.solutionCode && (
              <div className="space-y-1">
                <span className="font-bold text-emerald-700 text-xs">Verified Testing Solution:</span>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {selectedQuestionForView.solutionCode}
                </pre>
              </div>
            )}

            {/* Test Cases */}
            {selectedQuestionForView.testCases?.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 text-xs">Test Cases & Expected Outputs:</span>
                <div className="space-y-1">
                  {selectedQuestionForView.testCases.map((tc, idx) => (
                    <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] font-mono flex items-center justify-between">
                      <span>Input: <strong>{tc.input}</strong></span>
                      <span>Output: <strong className="text-blue-700">{tc.expectedOutput}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedQuestionForView.explanation && (
              <p className="text-xs text-slate-500 italic bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                <strong>Explanation:</strong> {selectedQuestionForView.explanation}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD CUSTOM QUESTION ────────────────────────────── */}
      {isAddQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddQuestionModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-black text-slate-900 text-base">Add Question to Module</h3>
              <p className="text-xs text-slate-500">Insert custom coding challenge, MCQ, or debugging puzzle.</p>
            </div>

            <form onSubmit={handleAddQuestionSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Title *</label>
                <input
                  type="text"
                  required
                  value={newQuestionForm.title}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, title: e.target.value })}
                  placeholder="e.g. Reverse an Array in Place"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={newQuestionForm.type}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="coding">Coding Challenge</option>
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="debugging">Debugging Puzzle</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={newQuestionForm.difficulty}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Topic Name</label>
                <input
                  type="text"
                  value={newQuestionForm.topic}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, topic: e.target.value })}
                  placeholder="e.g. Arrays & Loops"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instructions *</label>
                <textarea
                  rows="3"
                  required
                  value={newQuestionForm.instructions}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, instructions: e.target.value })}
                  placeholder="Write clear instructions for the student..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              {newQuestionForm.type === 'mcq' ? (
                <div className="space-y-2 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                  <span className="font-bold text-purple-900 text-xs">MCQ Options:</span>
                  <input
                    type="text"
                    placeholder="Option A"
                    value={newQuestionForm.mcqOptionA}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, mcqOptionA: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Option B"
                    value={newQuestionForm.mcqOptionB}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, mcqOptionB: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Option C"
                    value={newQuestionForm.mcqOptionC}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, mcqOptionC: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Option D"
                    value={newQuestionForm.mcqOptionD}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, mcqOptionD: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                  />
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">Correct Option</label>
                    <select
                      value={newQuestionForm.correctOptionId}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, correctOptionId: e.target.value })}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                    >
                      <option value="opt_a">Option A</option>
                      <option value="opt_b">Option B</option>
                      <option value="opt_c">Option C</option>
                      <option value="opt_d">Option D</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Starter Code</label>
                    <textarea
                      rows="3"
                      value={newQuestionForm.starterCode}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, starterCode: e.target.value })}
                      placeholder="function solution() { ... }"
                      className="w-full bg-slate-900 text-slate-100 rounded-xl p-2.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Verified Solution Code</label>
                    <textarea
                      rows="3"
                      value={newQuestionForm.solutionCode}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, solutionCode: e.target.value })}
                      placeholder="Working code implementation..."
                      className="w-full bg-slate-900 text-emerald-400 rounded-xl p-2.5 font-mono text-xs"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuestion}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  {submittingQuestion ? 'Adding...' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
