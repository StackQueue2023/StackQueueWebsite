import React, { useState, useEffect, useRef } from 'react';
import {
  CheckSquare,
  AlertOctagon,
  Plus,
  Trash2,
  Sparkles,
  Save,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import api from '../../api/client';

export default function ManualTestingWorkspace({
  courseId,
  question,
  initialState,
  onSubmitSolution,
  isSubmitting
}) {
  const [testCases, setTestCases] = useState(
    initialState?.testCases || [
      {
        id: 'TC001',
        title: 'Verify valid user login with registered credentials',
        preconditions: 'User registered with verified email in database',
        steps: '1. Navigate to /login\n2. Enter valid email and password\n3. Click Submit',
        testData: 'email=student@test.edu, password=SecurePass123!',
        expectedResult: 'System redirects to Dashboard with 200 OK status',
        actualResult: 'Redirected to Dashboard successfully',
        status: 'Pass' // Pass, Fail, Blocked
      },
      {
        id: 'TC002',
        title: 'Verify boundary validation on empty password submission',
        preconditions: 'User on /login page',
        steps: '1. Enter valid email\n2. Leave password input empty\n3. Click Submit',
        testData: 'email=student@test.edu, password=""',
        expectedResult: 'Inline validation error: Password is required',
        actualResult: 'Validation error displayed',
        status: 'Pass'
      }
    ]
  );

  const [bugReports, setBugReports] = useState(
    initialState?.bugReports || []
  );

  const [activeTab, setActiveTab] = useState('cases'); // 'cases', 'defects'
  const [saveStatus, setSaveStatus] = useState('saved');
  const saveTimeoutRef = useRef(null);

  const triggerAutoSave = (updatedData) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.post(`/workspace/state/${courseId}/${question._id}`, {
          environmentType: 'manual_testing',
          stateData: updatedData
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error('Manual testing auto-save error:', err);
        setSaveStatus('saved');
      }
    }, 1200);
  };

  const updateTestCases = (newCases) => {
    setTestCases(newCases);
    triggerAutoSave({ testCases: newCases, bugReports });
  };

  const updateBugReports = (newBugs) => {
    setBugReports(newBugs);
    triggerAutoSave({ testCases, bugReports: newBugs });
  };

  const handleAddTestCase = () => {
    const nextNum = testCases.length + 1;
    const newCase = {
      id: `TC${String(nextNum).padStart(3, '0')}`,
      title: 'New Functional Test Scenario',
      preconditions: 'System in default state',
      steps: '1. Execute action\n2. Inspect response',
      testData: 'param=value',
      expectedResult: 'Expected system behavior verified',
      actualResult: '',
      status: 'Pass'
    };
    updateTestCases([...testCases, newCase]);
  };

  const handleAddBug = () => {
    const nextNum = bugReports.length + 1;
    const newBug = {
      id: `BUG-${String(nextNum).padStart(3, '0')}`,
      summary: 'Unexpected application defect',
      severity: 'Major', // Critical, Major, Minor
      priority: 'High',
      stepsToReproduce: '1. Step one\n2. Step two',
      expectedBehavior: 'Feature should complete normally',
      actualBehavior: 'Application throws unhandled exception'
    };
    updateBugReports([...bugReports, newBug]);
  };

  const handleValidateAndSubmit = () => {
    const payload = {
      testCases,
      bugReports
    };
    onSubmitSolution('manual_testing', payload);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100">
      {/* QA Studio Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
            <CheckSquare className="w-4 h-4" />
            <span>QA Manual & Software Testing Studio</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('cases')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                activeTab === 'cases' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Test Cases ({testCases.length})
            </button>
            <button
              onClick={() => setActiveTab('defects')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                activeTab === 'defects' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Defect Reports ({bugReports.length})
            </button>
          </div>
        </div>

        {/* Right Status & Submit */}
        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>{saveStatus === 'saving' ? 'Auto-saving...' : 'Auto-saved'}</span>
          </span>

          <button
            onClick={handleValidateAndSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Evaluating Test Suite...' : 'Execute & Validate QA Suite'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeTab === 'cases' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Authored Test Cases</span>
              <button
                onClick={handleAddTestCase}
                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Test Case</span>
              </button>
            </div>

            <div className="space-y-3">
              {testCases.map((tc, idx) => (
                <div key={tc.id || idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60">
                        {tc.id}
                      </span>
                      <input
                        type="text"
                        value={tc.title}
                        onChange={(e) => {
                          const next = testCases.map((c, i) => i === idx ? { ...c, title: e.target.value } : c);
                          updateTestCases(next);
                        }}
                        className="bg-transparent font-bold text-white border-b border-slate-700 focus:border-emerald-400 px-1 py-0.5 outline-none w-80"
                        placeholder="Test Case Summary..."
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={tc.status}
                        onChange={(e) => {
                          const next = testCases.map((c, i) => i === idx ? { ...c, status: e.target.value } : c);
                          updateTestCases(next);
                        }}
                        className={`rounded-lg px-2 py-0.5 text-xs font-bold ${
                          tc.status === 'Pass' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                        <option value="Blocked">Blocked</option>
                      </select>

                      <button
                        onClick={() => updateTestCases(testCases.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Test Steps</label>
                      <textarea
                        rows={2}
                        value={tc.steps}
                        onChange={(e) => {
                          const next = testCases.map((c, i) => i === idx ? { ...c, steps: e.target.value } : c);
                          updateTestCases(next);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Expected Result</label>
                      <textarea
                        rows={2}
                        value={tc.expectedResult}
                        onChange={(e) => {
                          const next = testCases.map((c, i) => i === idx ? { ...c, expectedResult: e.target.value } : c);
                          updateTestCases(next);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'defects' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Logged Defect Reports</span>
              <button
                onClick={handleAddBug}
                className="flex items-center space-x-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Log Defect</span>
              </button>
            </div>

            {bugReports.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No defects logged yet. Click "+ Log Defect" to document a bug.</p>
            ) : (
              bugReports.map((bug, idx) => (
                <div key={bug.id || idx} className="bg-slate-950/70 border border-rose-900/40 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/60">
                      {bug.id}
                    </span>
                    <button
                      onClick={() => updateBugReports(bugReports.filter((_, i) => i !== idx))}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={bug.summary}
                    onChange={(e) => {
                      const next = bugReports.map((b, i) => i === idx ? { ...b, summary: e.target.value } : b);
                      updateBugReports(next);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    placeholder="Bug Title / Summary..."
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
