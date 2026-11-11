import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  GraduationCap, BookOpen, FolderGit2, Trophy, Clock, Plus, Trash2, CheckCircle2,
  AlertCircle, Sparkles, ShieldAlert, ArrowRight, Activity, BarChart3, Check, X,
  Layers, RefreshCw, Star
} from 'lucide-react';

export default function TutorLearningProgressPage() {
  const [activeTab, setActiveTab] = useState('course_learning'); // 'course_learning' | 'project_tracker' | 'interviews' | 'history'

  // 1. Course Learning Form State
  const [learningType, setLearningType] = useState('Learning a New Course');
  const [courseName, setCourseName] = useState('');
  const [technology, setTechnology] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [confidence, setConfidence] = useState(4);
  const [hoursSpent, setHoursSpent] = useState(2);
  const [nextLearningGoal, setNextLearningGoal] = useState('');

  // Topic-wise list state
  const [topics, setTopics] = useState([
    {
      topicName: '',
      strengthLevel: 'Intermediate',
      understandingPercentage: 80,
      whatUnderstood: '',
      difficulties: '',
      practiceCompleted: ''
    }
  ]);

  const [savingLearning, setSavingLearning] = useState(false);
  const [learningSuccessMsg, setLearningSuccessMsg] = useState(null);

  // 2. Project Tracker State
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState('');
  const [newTechStack, setNewTechStack] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState('Development');

  // Daily Project Progress Form State
  const [dailyGoal, setDailyGoal] = useState('');
  const [completedToday, setCompletedToday] = useState('');
  const [flowSteps, setFlowSteps] = useState(['']);
  const [problemsFaced, setProblemsFaced] = useState('');
  const [solutionImplemented, setSolutionImplemented] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [testingDone, setTestingDone] = useState('');
  const [projectProgressPercentage, setProjectProgressPercentage] = useState(0);
  const [savingProjectProgress, setSavingProjectProgress] = useState(false);

  // 3. Interview Performance & Failure Analysis State
  const [interviewData, setInterviewData] = useState({ summary: { total: 0, passed: 0, failed: 0, pending: 0 }, interviews: [] });
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [interviewFilter, setInterviewFilter] = useState('ALL'); // 'ALL' | 'PASSED' | 'FAILED' | 'PENDING'
  const [savingImprovement, setSavingImprovement] = useState(false);
  const [selectedTrainingDetails, setSelectedTrainingDetails] = useState(null);

  const handleSaveTutorImprovement = async (interviewId, payload) => {
    setSavingImprovement(true);
    try {
      const res = await api.post(`/tutor/progress/interviews/${interviewId}/improvement`, payload);
      if (res.data.success) {
        alert('✓ Corrective / Improvement update submitted to Admin successfully!');
        loadInterviews();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting improvement update');
    } finally {
      setSavingImprovement(false);
    }
  };

  // 4. Learning History List State
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [inspectItem, setInspectItem] = useState(null);

  useEffect(() => {
    loadLearningLogs();
    loadProjects();
    loadInterviews();
  }, []);

  // API Call Helpers
  const loadLearningLogs = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/tutor/progress/learning');
      if (res.data.success) {
        setHistoryLogs(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load learning logs:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await api.get('/tutor/progress/projects');
      if (res.data.success) {
        setProjects(res.data.data || []);
        if (res.data.data?.length > 0 && !selectedProjectId) {
          setSelectedProjectId(res.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load tutor projects:', err);
    }
  };

  const loadInterviews = async () => {
    setLoadingInterviews(true);
    try {
      const res = await api.get('/tutor/progress/interviews');
      if (res.data.success) {
        setInterviewData(res.data.data || { summary: { total: 0, passed: 0, failed: 0, pending: 0 }, interviews: [] });
      }
    } catch (err) {
      console.error('Failed to load tutor interviews:', err);
    } finally {
      setLoadingInterviews(false);
    }
  };

  // 1. Topic Handlers
  const handleAddTopic = () => {
    setTopics([...topics, {
      topicName: '',
      strengthLevel: 'Intermediate',
      understandingPercentage: 80,
      whatUnderstood: '',
      difficulties: '',
      practiceCompleted: ''
    }]);
  };

  const handleUpdateTopic = (index, field, value) => {
    const updated = [...topics];
    updated[index][field] = value;
    setTopics(updated);
  };

  const handleRemoveTopic = (index) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  // Submit Course Learning
  const handleSaveLearningProgress = async (e) => {
    e.preventDefault();
    if (!courseName) {
      alert('Please enter the Course or Technology Name.');
      return;
    }

    setSavingLearning(true);
    setLearningSuccessMsg(null);
    try {
      const payload = {
        learningType,
        courseName,
        technology,
        startDate,
        date,
        summary,
        confidence,
        hoursSpent,
        nextLearningGoal,
        topics
      };
      const res = await api.post('/tutor/progress/learning', payload);
      if (res.data.success) {
        setLearningSuccessMsg('✓ Today\'s learning progress saved successfully!');
        setSummary('');
        loadLearningLogs();
        setTimeout(() => setLearningSuccessMsg(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving learning progress.');
    } finally {
      setSavingLearning(false);
    }
  };

  // 2. Project Handlers
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName) return;
    try {
      const res = await api.post('/tutor/progress/projects', {
        projectName: newProjectName,
        projectType: newProjectType,
        technologyStack: newTechStack,
        status: newProjectStatus
      });
      if (res.data.success) {
        alert('✓ Project created successfully!');
        setNewProjectName('');
        await loadProjects();
        setSelectedProjectId(res.data.data._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating project.');
    }
  };

  const handleAddFlowStep = () => {
    setFlowSteps([...flowSteps, '']);
  };

  const handleUpdateFlowStep = (idx, val) => {
    const updated = [...flowSteps];
    updated[idx] = val;
    setFlowSteps(updated);
  };

  const handleRemoveFlowStep = (idx) => {
    setFlowSteps(flowSteps.filter((_, i) => i !== idx));
  };

  const handleSaveProjectDailyProgress = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert('Please select or create a project first.');
      return;
    }
    setSavingProjectProgress(true);
    try {
      const payload = {
        date,
        dailyGoal,
        completedToday,
        flowCompleted: flowSteps.filter(s => s.trim() !== ''),
        problemsFaced,
        solutionImplemented,
        nextStep,
        testingDone,
        progressPercentage: projectProgressPercentage
      };
      const res = await api.post(`/tutor/progress/projects/${selectedProjectId}/progress`, payload);
      if (res.data.success) {
        alert('✓ Project daily progress logged successfully!');
        setCompletedToday('');
        setProblemsFaced('');
        loadProjects();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error logging project progress.');
    } finally {
      setSavingProjectProgress(false);
    }
  };

  // 3. Interview Handlers
  const handleSaveInterview = async (e) => {
    e.preventDefault();
    if (!collegeName || !trainingName) {
      alert('College Name and Training Name are required.');
      return;
    }
    setSavingInterview(true);
    try {
      const payload = {
        collegeName,
        trainingName,
        interviewDate,
        round: interviewRound,
        interviewer,
        result: interviewResult,
        score: interviewScore,
        feedback: interviewFeedback
      };
      const res = await api.post('/tutor/progress/interviews', payload);
      if (res.data.success) {
        alert('✓ Interview record saved!');
        setCollegeName('');
        loadInterviews();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving interview.');
    } finally {
      setSavingInterview(false);
    }
  };

  // Failure Analysis Modal Save
  const handleSaveFailureAnalysis = async () => {
    if (!failureReason || !improvementPlan) {
      alert('Reason for failure and improvement plan are required.');
      return;
    }
    setSavingFailureAnalysis(true);
    try {
      const res = await api.post(`/tutor/progress/interviews/${activeFailureModalInterview._id}/failure-analysis`, {
        failureReason,
        improvementPlan,
        topicsToImprove,
        practicePlanned,
        resourcesUsed,
        targetCompletionDate
      });
      if (res.data.success) {
        alert('✓ Failure analysis & improvement plan recorded!');
        loadInterviews();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving failure analysis.');
    } finally {
      setSavingFailureAnalysis(false);
    }
  };

  // Corrective Action Impact Save
  const handleSaveCorrectiveAction = async (failureAnalysisId) => {
    if (!actionTaken) {
      alert('Action taken description is required.');
      return;
    }
    setSavingCorrectiveAction(true);
    try {
      const res = await api.post(`/tutor/progress/interviews/${activeFailureModalInterview._id}/corrective-action`, {
        failureAnalysisId,
        actionTaken,
        effectObserved,
        improvementObserved,
        confidenceLevel,
        technicalImprovement,
        communicationImprovement,
        trainingDeliveryImprovement,
        resultAfterImprovement
      });
      if (res.data.success) {
        alert('✓ Corrective action impact & results saved!');
        loadInterviews();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving corrective action.');
    } finally {
      setSavingCorrectiveAction(false);
    }
  };

  const selectedProjectObj = projects.find(p => p._id === selectedProjectId);

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto px-4">
      {/* Pink-to-Violet Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-50 via-fuchsia-50 to-purple-50 border border-pink-200/80 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase shadow-2xs">
            <GraduationCap className="w-4 h-4 text-pink-600" />
            <span className="bg-gradient-to-r from-pink-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent font-extrabold">
              Tutor Learning &amp; Professional Growth Hub
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
            Learning &amp; Progress Management
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
            Record daily course learning, track technical project milestones, log college training interview results, perform failure analysis, and document corrective action impact.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('course_learning')}
          className={`py-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
            activeTab === 'course_learning'
              ? 'border-pink-600 text-pink-600 bg-pink-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Learning Log</span>
        </button>

        <button
          onClick={() => setActiveTab('project_tracker')}
          className={`py-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
            activeTab === 'project_tracker'
              ? 'border-pink-600 text-pink-600 bg-pink-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Project Tracker</span>
        </button>

        <button
          onClick={() => setActiveTab('interviews')}
          className={`py-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
            activeTab === 'interviews'
              ? 'border-pink-600 text-pink-600 bg-pink-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Interview Performance &amp; Failure Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
            activeTab === 'history'
              ? 'border-pink-600 text-pink-600 bg-pink-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Learning Logs History</span>
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 1: DAILY COURSE LEARNING FORM
         ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'course_learning' && (
        <form onSubmit={handleSaveLearningProgress} className="space-y-6 text-xs">
          {/* Learning Type Selector */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-3">
            <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
              What are you working on today? *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                'Learning a New Course',
                'Improving Existing Skills',
                'Working on a Project',
                'Interview Preparation',
                'Technical Practice',
                'Other'
              ].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setLearningType(opt)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition text-left cursor-pointer ${
                    learningType === opt
                      ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-500 text-pink-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full border ${learningType === opt ? 'bg-pink-600 border-pink-600' : 'border-slate-300'}`} />
                    <span>{opt}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Course Details Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-4 h-4 text-pink-600" />
              <span>1. Course &amp; Technology Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">Course / Subject Name *</label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Advanced Java & Spring Microservices"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">Technology / Domain</label>
                <input
                  type="text"
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value)}
                  placeholder="e.g. Java / Spring Boot / React"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">Course Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 font-mono bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">Today's Learning Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 font-mono bg-white"
                />
              </div>
            </div>
          </div>

          {/* Today's Topics Completed (Topic-Wise Builder) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-pink-600" />
                <span>2. Today's Topics Completed ({topics.length})</span>
              </h3>

              <button
                type="button"
                onClick={handleAddTopic}
                className="px-3 py-1.5 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 border border-pink-200 rounded-xl font-bold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Topic</span>
              </button>
            </div>

            <div className="space-y-4">
              {topics.map((top, idx) => (
                <div key={idx} className="bg-slate-50/70 border border-slate-200 p-5 rounded-2xl space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-purple-100 text-purple-800 border border-purple-200">
                      Topic #{idx + 1}
                    </span>
                    {topics.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(idx)}
                        className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 md:col-span-1">
                      <label className="font-bold text-slate-700 uppercase tracking-wider block">Topic Name *</label>
                      <input
                        type="text"
                        required
                        value={top.topicName}
                        onChange={(e) => handleUpdateTopic(idx, 'topicName', e.target.value)}
                        placeholder="e.g. Java Streams & Lambda"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 uppercase tracking-wider block">Strength Level</label>
                      <select
                        value={top.strengthLevel}
                        onChange={(e) => handleUpdateTopic(idx, 'strengthLevel', e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 bg-white"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Strong">Strong</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 uppercase tracking-wider block">Understanding ({top.understandingPercentage}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={top.understandingPercentage}
                        onChange={(e) => handleUpdateTopic(idx, 'understandingPercentage', parseInt(e.target.value, 10))}
                        className="w-full accent-pink-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 uppercase text-[10px] block">What did you understand?</label>
                      <textarea
                        rows={2}
                        value={top.whatUnderstood}
                        onChange={(e) => handleUpdateTopic(idx, 'whatUnderstood', e.target.value)}
                        placeholder="Key concepts grasped..."
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 uppercase text-[10px] block">What is still difficult?</label>
                      <textarea
                        rows={2}
                        value={top.difficulties}
                        onChange={(e) => handleUpdateTopic(idx, 'difficulties', e.target.value)}
                        placeholder="Complex areas needing review..."
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 uppercase text-[10px] block">Practice completed?</label>
                      <textarea
                        rows={2}
                        value={top.practiceCompleted}
                        onChange={(e) => handleUpdateTopic(idx, 'practiceCompleted', e.target.value)}
                        placeholder="Exercises or code built..."
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Learning Summary Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Activity className="w-4 h-4 text-pink-600" />
              <span>3. Today's Learning Summary &amp; Self Rating</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">What did you learn today?</label>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Summarize your key takeaways from today's session..."
                  className="w-full p-3.5 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-pink-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block">How confident are you? (1 - 5)</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setConfidence(num)}
                        className={`w-9 h-9 rounded-xl font-mono font-black text-xs transition border cursor-pointer ${
                          confidence === num
                            ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white border-pink-500 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {num}★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block">Hours spent learning today</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={hoursSpent}
                    onChange={(e) => setHoursSpent(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-pink-500 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block">What should you learn next?</label>
                  <input
                    type="text"
                    value={nextLearningGoal}
                    onChange={(e) => setNextLearningGoal(e.target.value)}
                    placeholder="e.g. Spring Boot REST APIs"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {learningSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{learningSuccessMsg}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingLearning}
                className="px-6 py-3.5 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold text-xs rounded-2xl shadow-md transition cursor-pointer disabled:opacity-50 flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>{savingLearning ? 'Saving Progress...' : 'Save Today\'s Learning Progress →'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 2: PROJECT TRACKER & DAILY PROGRESS
         ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'project_tracker' && (
        <div className="space-y-6 text-xs">
          {/* Create or Select Project Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <FolderGit2 className="w-4 h-4 text-pink-600" />
                  <span>Select Active Project</span>
                </h3>
                <p className="text-xs text-slate-500">Log day-wise project progress steps and completed flows.</p>
              </div>

              {projects.length > 0 && (
                <div className="flex items-center space-x-2">
                  <label className="font-bold text-slate-700 uppercase">Active Project:</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 bg-white"
                  >
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.projectName} ({p.progressPercentage}%)</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Create New Project Inline Form */}
            <form onSubmit={handleCreateProject} className="bg-slate-50/70 border border-slate-200 p-5 rounded-2xl space-y-4">
              <span className="font-black text-slate-800 uppercase tracking-wider block text-[11px]">Create New Project</span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project Name *"
                  className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                />
                <input
                  type="text"
                  value={newProjectType}
                  onChange={(e) => setNewProjectType(e.target.value)}
                  placeholder="Project Type"
                  className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                />
                <input
                  type="text"
                  value={newTechStack}
                  onChange={(e) => setNewTechStack(e.target.value)}
                  placeholder="Tech Stack"
                  className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                />
                <button
                  type="submit"
                  className="py-2 px-4 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  + Add Project
                </button>
              </div>
            </form>
          </div>

          {/* Project Daily Progress Form */}
          {selectedProjectId && (
            <form onSubmit={handleSaveProjectDailyProgress} className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-purple-100 text-purple-800 border border-purple-200">
                    Project: {selectedProjectObj?.projectName}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">Today's Project Progress Log</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-600">Progress:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={projectProgressPercentage}
                    onChange={(e) => setProjectProgressPercentage(parseInt(e.target.value, 10) || 0)}
                    className="w-16 px-2 py-1 border border-slate-300 rounded-xl font-mono font-bold text-center"
                  />
                  <span className="font-mono font-bold text-purple-700">%</span>
                </div>
              </div>

              {/* Dynamic Flow Builder */}
              <div className="space-y-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 uppercase tracking-wider block">Today's Completed Flow / Steps</label>
                  <button
                    type="button"
                    onClick={handleAddFlowStep}
                    className="px-2.5 py-1 bg-pink-100 text-pink-700 rounded-xl font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Completed Step</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {flowSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-400 text-xs w-6">{idx + 1}.</span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => handleUpdateFlowStep(idx, e.target.value)}
                        placeholder="e.g. Implemented JWT authentication & login API"
                        className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white"
                      />
                      {flowSteps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFlowStep(idx)}
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block">Today's Goal</label>
                  <textarea
                    rows={2}
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    placeholder="Planned objectives for today..."
                    className="w-full p-3 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block">Problems Faced</label>
                  <textarea
                    rows={2}
                    value={problemsFaced}
                    onChange={(e) => setProblemsFaced(e.target.value)}
                    placeholder="Any technical blockers or bugs encountered..."
                    className="w-full p-3 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block">Solution Implemented</label>
                  <textarea
                    rows={2}
                    value={solutionImplemented}
                    onChange={(e) => setSolutionImplemented(e.target.value)}
                    placeholder="How the problem was resolved..."
                    className="w-full p-3 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block">Next Step</label>
                  <textarea
                    rows={2}
                    value={nextStep}
                    onChange={(e) => setNextStep(e.target.value)}
                    placeholder="Next module or task planned..."
                    className="w-full p-3 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProjectProgress}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold text-xs rounded-2xl shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {savingProjectProgress ? 'Saving...' : 'Save Project Daily Progress →'}
                </button>
              </div>
            </form>
          )}

          {/* Project Progress History Log */}
          {selectedProjectObj && selectedProjectObj.dailyLogs?.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Project Progress History Timeline</h3>
              <div className="space-y-3">
                {selectedProjectObj.dailyLogs.map((log, idx) => (
                  <div key={log._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-slate-900 text-xs">Day Log: {log.date}</span>
                      <span className="text-purple-700 font-bold">{log.progressPercentage}% Completed</span>
                    </div>
                    {log.flowCompleted?.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium">
                        {log.flowCompleted.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 3: INTERVIEW PERFORMANCE & FAILURE ANALYSIS (READ-ONLY RESULTS)
         ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'interviews' && (() => {
        const allInterviews = interviewData.interviews || [];
        const filteredInterviews = allInterviews.filter(inv => {
          if (interviewFilter === 'PASSED') return inv.result === 'Passed';
          if (interviewFilter === 'FAILED') return inv.result === 'Failed';
          if (interviewFilter === 'PENDING') return inv.result === 'Pending';
          return true;
        });

        const passedCurrentTrainings = allInterviews.filter(inv => inv.result === 'Passed' && (inv.collegeTraining?.status === 'ACTIVE' || !inv.collegeTraining || inv.collegeTraining?.status !== 'COMPLETED'));
        const passedCompletedTrainings = allInterviews.filter(inv => inv.result === 'Passed' && inv.collegeTraining?.status === 'COMPLETED');

        return (
          <div className="space-y-6 text-xs">
            {/* Summary Cards with Filter Clicking & Dynamic Counts - CLEAN CARDS NO COLORED OUTLINES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Card 1: Total Interviews */}
              <div
                onClick={() => setInterviewFilter('ALL')}
                className={`p-4 rounded-2xl space-y-1 shadow-xs transition-all cursor-pointer border ${
                  interviewFilter === 'ALL'
                    ? 'bg-gradient-to-r from-pink-50/90 via-fuchsia-50/50 to-purple-50/90 border-pink-400 ring-2 ring-purple-400/30 shadow-sm'
                    : 'bg-white border-slate-200/90 hover:border-pink-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Total Interviews</span>
                  <Trophy className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-black text-slate-900 font-mono">{interviewData.summary?.total || 0}</p>
                <span className="text-[11px] text-slate-500 font-medium block">Click to view all records</span>
              </div>

              {/* Card 2: Passed */}
              <div
                onClick={() => setInterviewFilter('PASSED')}
                className={`p-4 rounded-2xl space-y-1 shadow-xs transition-all cursor-pointer border ${
                  interviewFilter === 'PASSED'
                    ? 'bg-gradient-to-r from-pink-50/90 via-fuchsia-50/50 to-purple-50/90 border-pink-400 ring-2 ring-purple-400/30 shadow-sm'
                    : 'bg-white border-slate-200/90 hover:border-pink-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 text-[10px] font-bold uppercase tracking-wider block">Passed</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-slate-900 font-mono">{interviewData.summary?.passed || 0}</p>
                <span className="text-[11px] text-emerald-700 font-medium block">Click to view passed rounds</span>
              </div>

              {/* Card 3: Failed */}
              <div
                onClick={() => setInterviewFilter('FAILED')}
                className={`p-4 rounded-2xl space-y-1 shadow-xs transition-all cursor-pointer border ${
                  interviewFilter === 'FAILED'
                    ? 'bg-gradient-to-r from-pink-50/90 via-fuchsia-50/50 to-purple-50/90 border-pink-400 ring-2 ring-purple-400/30 shadow-sm'
                    : 'bg-white border-slate-200/90 hover:border-pink-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 text-[10px] font-bold uppercase tracking-wider block">Failed</span>
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-2xl font-black text-slate-900 font-mono">{interviewData.summary?.failed || 0}</p>
                <span className="text-[11px] text-rose-700 font-medium block">Click to view failure analysis</span>
              </div>

              {/* Card 4: Pending */}
              <div
                onClick={() => setInterviewFilter('PENDING')}
                className={`p-4 rounded-2xl space-y-1 shadow-xs transition-all cursor-pointer border ${
                  interviewFilter === 'PENDING'
                    ? 'bg-gradient-to-r from-pink-50/90 via-fuchsia-50/50 to-purple-50/90 border-pink-400 ring-2 ring-purple-400/30 shadow-sm'
                    : 'bg-white border-slate-200/90 hover:border-pink-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 text-[10px] font-bold uppercase tracking-wider block">Pending</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-black text-slate-900 font-mono">{interviewData.summary?.pending || 0}</p>
                <span className="text-[11px] text-amber-700 font-medium block">Click to view pending reviews</span>
              </div>
            </div>

            {/* Active Filter Title Banner */}
            <div className="flex items-center justify-between bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active View Filter:</span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 text-white shadow-2xs font-mono uppercase">
                  {interviewFilter === 'ALL' && 'Total Interviews (All Records)'}
                  {interviewFilter === 'PASSED' && 'Passed Interviews'}
                  {interviewFilter === 'FAILED' && 'Failed Interviews & Corrective Action'}
                  {interviewFilter === 'PENDING' && 'Pending Interviews'}
                </span>
              </div>

              <span className="text-xs font-bold text-slate-400">
                Showing {filteredInterviews.length} {filteredInterviews.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            {/* SECTION CONTENT BASED ON FILTER */}

            {/* 1. FILTER = ALL */}
            {interviewFilter === 'ALL' && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Interview History (All Records)</h3>
                {filteredInterviews.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-slate-500 font-bold text-sm">No Interview Records Found</p>
                    <p className="text-xs text-slate-400">Interview results assigned or evaluated by admin will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInterviews.map(inv => (
                      <div key={inv._id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-purple-100 text-purple-800 border border-purple-200">
                              {inv.round || 'Technical Round'}
                            </span>
                            <h4 className="text-base font-black text-slate-900 mt-1">{inv.collegeName}</h4>
                            <p className="text-xs font-bold text-purple-700">{inv.trainingName} {inv.batchName ? `• ${inv.batchName}` : ''}</p>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="font-mono text-xs text-slate-500 font-bold">Interview Date: {inv.interviewDate}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                              inv.result === 'Passed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              inv.result === 'Failed' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                              'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {inv.result === 'Passed' ? '✓ Passed' : inv.result === 'Failed' ? '✕ Failed' : '⏳ Pending'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Score</span>
                            <span className="font-mono font-bold text-purple-700 text-sm">{inv.score || 'N/A'}</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 md:col-span-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Admin Feedback</span>
                            <p className="text-slate-800 font-medium">{inv.adminFeedback || inv.feedback || 'Good technical performance.'}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
                          <span>Current Status: <strong className="text-slate-800">{inv.status || 'Completed'}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. FILTER = PASSED (CURRENT VS COMPLETED TRAINING) */}
            {interviewFilter === 'PASSED' && (
              <div className="space-y-6">
                {/* CURRENT TRAINING SECTION */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Active
                    </span>
                    <h3 className="text-base font-black text-slate-900">CURRENT TRAINING</h3>
                  </div>

                  {passedCurrentTrainings.length === 0 ? (
                    <p className="text-slate-400 italic text-center p-4">No Current Active Passed Training Records</p>
                  ) : (
                    <div className="space-y-4">
                      {passedCurrentTrainings.map(inv => {
                        const tr = inv.collegeTraining || {};
                        return (
                          <div key={inv._id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                              <div>
                                <h4 className="text-base font-black text-slate-900">{inv.collegeName}</h4>
                                <p className="text-xs font-bold text-purple-700">{inv.trainingName} {inv.batchName ? `• ${inv.batchName}` : ''}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold font-mono text-[11px]">
                                  Training Status: Active
                                </span>
                                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded-full font-bold font-mono text-[11px]">
                                  Interview: Passed ✓
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Start Date</span>
                                <span className="font-bold text-slate-800">{tr.startDate || inv.interviewDate}</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Day</span>
                                <span className="font-bold text-purple-700">Day {tr.currentDay || 1} / {tr.totalDays || 10}</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Students</span>
                                <span className="font-bold text-slate-800">{tr.totalStudents || 28} Students</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Score</span>
                                <span className="font-bold text-emerald-700">{inv.score || '85/100'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* COMPLETED TRAINING SECTION */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-purple-100 text-purple-800 border border-purple-300">
                      Completed
                    </span>
                    <h3 className="text-base font-black text-slate-900">COMPLETED TRAINING</h3>
                  </div>

                  {passedCompletedTrainings.length === 0 ? (
                    <p className="text-slate-400 italic text-center p-4">No Completed Passed Training Records</p>
                  ) : (
                    <div className="space-y-4">
                      {passedCompletedTrainings.map(inv => {
                        const tr = inv.collegeTraining || {};
                        return (
                          <div key={inv._id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                              <div>
                                <h4 className="text-base font-black text-slate-900">{inv.collegeName}</h4>
                                <p className="text-xs font-bold text-purple-700">{inv.trainingName} {inv.batchName ? `• ${inv.batchName}` : ''}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded-full font-bold font-mono text-[11px]">
                                  Final Status: Completed ✓
                                </span>
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold font-mono text-[11px]">
                                  Interview: Passed
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Training Duration</span>
                                <span className="font-mono font-bold text-slate-800">{tr.totalDays || 10} Days • {tr.totalStudents || 28} Students</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 md:col-span-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Admin Feedback</span>
                                <p className="text-slate-800 font-medium">{inv.adminFeedback || inv.feedback || 'Outstanding college training execution.'}</p>
                              </div>
                            </div>

                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => setSelectedTrainingDetails(inv)}
                                className="px-4 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 text-white font-bold rounded-xl text-xs shadow-xs hover:from-pink-600 hover:to-violet-700 transition cursor-pointer"
                              >
                                [ View Training Details ]
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. FILTER = FAILED (FAILED INTERVIEW & TUTOR CORRECTIVE ACTION & TIMELINE) */}
            {interviewFilter === 'FAILED' && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Failed Interviews &amp; Corrective Action Plan</h3>

                {filteredInterviews.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-slate-500 font-bold text-sm">No Failed Interviews</p>
                    <p className="text-xs text-slate-400">Great job! No failed college training interviews recorded.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredInterviews.map(inv => {
                      const imp = inv.tutorImprovement || {};
                      return (
                        <div key={inv._id} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-5">
                          {/* Header Box */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                            <div>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-rose-100 text-rose-800 border border-rose-300">
                                Interview Result: Failed ✕
                              </span>
                              <h4 className="text-lg font-black text-slate-900 mt-1">{inv.collegeName}</h4>
                              <p className="text-xs font-bold text-purple-700">{inv.trainingName} {inv.batchName ? `• ${inv.batchName}` : ''}</p>
                            </div>

                            <div className="flex items-center space-x-3 font-mono text-xs">
                              <span className="text-slate-500 font-bold">Round: {inv.round || 'Technical Round'}</span>
                              <span className="text-slate-500 font-bold">Date: {inv.interviewDate}</span>
                              <span className="text-rose-700 font-bold bg-white px-2.5 py-1 rounded-xl border border-slate-200">Score: {inv.score || 'N/A'}</span>
                            </div>
                          </div>

                          {/* ADMIN FAILURE REASON & ADMIN FEEDBACK BOX */}
                          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block font-mono">
                              Admin Failure Reason &amp; Feedback
                            </span>
                            <p className="text-slate-900 font-bold text-xs">
                              Failure Reason: <span className="text-slate-700 font-medium">"{inv.failureReason || inv.failureAnalysis?.failureReason || 'Trainer needs stronger knowledge of Spring Boot REST API concepts.'}"</span>
                            </p>
                            <p className="text-slate-900 font-bold text-xs">
                              Admin Feedback: <span className="text-slate-700 font-medium">"{inv.adminFeedback || inv.feedback || 'Improve live coding and REST architecture explanation.'}"</span>
                            </p>
                          </div>

                          {/* IMPROVEMENT TIMELINE */}
                          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block font-mono">
                              Improvement Timeline
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold font-mono">
                              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">Interview</span>
                              <span>→</span>
                              <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg border border-rose-200">Failed</span>
                              <span>→</span>
                              <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200">Admin Failure Reason</span>
                              <span>→</span>
                              <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg border border-purple-200">Admin Feedback</span>
                              <span>→</span>
                              <span className={`px-2.5 py-1 rounded-lg border ${imp.submittedAt ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                Tutor Update {imp.submittedAt ? '✓' : ''}
                              </span>
                              <span>→</span>
                              <span className={`px-2.5 py-1 rounded-lg border ${imp.adminReviewed ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                Admin Review
                              </span>
                              <span>→</span>
                              <span className={`px-2.5 py-1 rounded-lg border ${inv.reInterviews?.length > 0 ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                Re-Interview
                              </span>
                            </div>
                          </div>

                          {/* TUTOR CORRECTIVE ACTION FORM */}
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const form = e.target;
                              const payload = {
                                improvementAction: form.improvementAction.value,
                                topicsImproved: form.topicsImproved.value,
                                practiceCompleted: form.practiceCompleted.value,
                                actionBasedOnFeedback: form.actionBasedOnFeedback.value,
                                improvementStatus: form.improvementStatus.value
                              };
                              handleSaveTutorImprovement(inv._id, payload);
                            }}
                            className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs"
                          >
                            <h5 className="font-black text-slate-900 text-xs uppercase tracking-wider text-purple-900">
                              Your Improvement / Corrective Action
                            </h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="font-bold text-slate-700 block">What did you do to improve?</label>
                                <textarea
                                  name="improvementAction"
                                  defaultValue={imp.improvementAction || ''}
                                  rows={2}
                                  placeholder="Describe specific actions taken to strengthen concepts..."
                                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:border-pink-500 focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-slate-700 block">Topics Improved:</label>
                                <textarea
                                  name="topicsImproved"
                                  defaultValue={imp.topicsImproved || ''}
                                  rows={2}
                                  placeholder="List technical topics mastered..."
                                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:border-pink-500 focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-slate-700 block">Practice Completed:</label>
                                <textarea
                                  name="practiceCompleted"
                                  defaultValue={imp.practiceCompleted || ''}
                                  rows={2}
                                  placeholder="Details of mock sessions or practice projects..."
                                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:border-pink-500 focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-slate-700 block">What action did you take based on admin feedback?</label>
                                <textarea
                                  name="actionBasedOnFeedback"
                                  defaultValue={imp.actionBasedOnFeedback || ''}
                                  rows={2}
                                  placeholder="Specific changes implemented per admin feedback..."
                                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:border-pink-500 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                              <div className="flex items-center space-x-2">
                                <label className="font-bold text-slate-700">Current Improvement Status:</label>
                                <select
                                  name="improvementStatus"
                                  defaultValue={imp.improvementStatus || 'In Progress'}
                                  className="px-3 py-1.5 border border-slate-300 rounded-xl font-bold text-slate-800 bg-white"
                                >
                                  <option value="Not Started">Not Started</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>

                              <button
                                type="submit"
                                disabled={savingImprovement}
                                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 text-white font-bold rounded-xl shadow-xs hover:from-pink-600 hover:to-violet-700 transition cursor-pointer"
                              >
                                {savingImprovement ? 'Submitting...' : '[ Submit Improvement Update ]'}
                              </button>
                            </div>
                          </form>

                          {/* RE-INTERVIEW SECTION */}
                          {inv.reInterviews?.length > 0 && (
                            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 space-y-2">
                              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block font-mono">
                                Re-Interview Scheduled
                              </span>
                              {inv.reInterviews.map(re => (
                                <div key={re._id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-purple-200 font-mono text-xs">
                                  <div>
                                    <span className="font-bold text-slate-900">{re.round || 'Re-Interview Technical Round'}</span>
                                    <span className="text-slate-500 block text-[11px]">Scheduled Date: {re.scheduledDate}</span>
                                  </div>
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    re.result === 'Passed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                    re.result === 'Failed' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                                    'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}>
                                    Status: {re.result}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. FILTER = PENDING */}
            {interviewFilter === 'PENDING' && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Pending Interview Reviews</h3>
                {filteredInterviews.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-slate-500 font-bold text-sm">No Pending Interviews</p>
                    <p className="text-xs text-slate-400">All training interviews have been evaluated by admin.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInterviews.map(inv => (
                      <div key={inv._id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-100 text-amber-800 border border-amber-300">
                              Status: Pending Review
                            </span>
                            <h4 className="text-base font-black text-slate-900 mt-1">{inv.collegeName}</h4>
                            <p className="text-xs font-bold text-purple-700">{inv.trainingName} {inv.batchName ? `• ${inv.batchName}` : ''}</p>
                          </div>
                          <span className="font-mono text-xs text-slate-500 font-bold">Scheduled: {inv.interviewDate}</span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Interview Round</span>
                          <p className="text-slate-800 font-bold">{inv.round || 'Technical Round'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 4: LEARNING & PROGRESS HISTORY LOGS
         ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="space-y-6 text-xs">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-pink-600" />
              <span>Complete Tutor Learning History ({historyLogs.length})</span>
            </h3>

            {loadingHistory ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : historyLogs.length === 0 ? (
              <div className="text-center p-10 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No Learning Progress Recorded Yet</h4>
                <p className="text-xs text-slate-500">Record your daily course learning in Tab 1 to build your professional progress timeline.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyLogs.map(log => (
                  <div key={log._id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 hover:border-pink-300 transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-pink-100 text-pink-800 border border-pink-200">
                          {log.learningType}
                        </span>
                        <h4 className="text-lg font-black text-slate-900 mt-1">{log.courseName}</h4>
                        <p className="text-xs font-bold text-purple-700">{log.technology}</p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Confidence Rating</span>
                          <span className="text-sm font-black text-pink-600 font-mono">{log.confidence} / 5 ★</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                          {log.date}
                        </span>
                      </div>
                    </div>

                    {log.summary && (
                      <p className="text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-100">
                        "{log.summary}"
                      </p>
                    )}

                    {log.topics?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-purple-700 uppercase block">Topics Completed ({log.topics.length})</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {log.topics.map(t => (
                            <div key={t._id} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                              <div className="flex justify-between items-center">
                                <strong className="text-slate-900 font-bold">{t.topicName}</strong>
                                <span className="text-purple-700 font-mono font-bold text-[11px]">{t.understandingPercentage}%</span>
                              </div>
                              <p className="text-[11px] text-slate-500">{t.whatUnderstood}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}



      {/* View Training Details Modal for Completed Passed Trainings */}
      {selectedTrainingDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <span>Completed College Training Details</span>
              </h3>
              <button
                onClick={() => setSelectedTrainingDetails(null)}
                className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">College &amp; Program</span>
                <p className="font-black text-slate-900 text-sm">{selectedTrainingDetails.collegeName}</p>
                <p className="font-bold text-purple-700">{selectedTrainingDetails.trainingName} {selectedTrainingDetails.batchName ? `• ${selectedTrainingDetails.batchName}` : ''}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Final Training Status</span>
                  <span className="font-bold text-emerald-700">Completed ✓</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Interview Result</span>
                  <span className="font-bold text-purple-700">Passed ✓ ({selectedTrainingDetails.score || '85/100'})</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Admin Feedback</span>
                <p className="text-slate-800 font-medium">{selectedTrainingDetails.adminFeedback || selectedTrainingDetails.feedback || 'Outstanding college training execution.'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTrainingDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
