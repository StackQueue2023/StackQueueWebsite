import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Play,
  RotateCcw,
  Sparkles,
  Table,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Code2
} from 'lucide-react';
import api from '../../api/client';

export default function SqlDatabaseWorkspace({
  courseId,
  question,
  initialState,
  onSubmitSolution,
  isSubmitting
}) {
  const [query, setQuery] = useState(
    initialState?.code ||
    initialState?.query ||
    question?.starterCode?.sql ||
    'SELECT name, grade, course FROM students WHERE grade >= 80 ORDER BY grade DESC;'
  );

  const [activeTable, setActiveTable] = useState('students');
  const [runResult, setRunResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const saveTimeoutRef = useRef(null);

  const TABLES = {
    students: [
      { col: 'id', type: 'INTEGER (PK)' },
      { col: 'name', type: 'VARCHAR(100)' },
      { col: 'course', type: 'VARCHAR(100)' },
      { col: 'grade', type: 'INTEGER' },
      { col: 'city', type: 'VARCHAR(50)' },
      { col: 'batch', type: 'VARCHAR(20)' }
    ],
    courses: [
      { col: 'id', type: 'INTEGER (PK)' },
      { col: 'title', type: 'VARCHAR(100)' },
      { col: 'fee', type: 'INTEGER' },
      { col: 'trainer', type: 'VARCHAR(100)' },
      { col: 'department', type: 'VARCHAR(100)' }
    ],
    employees: [
      { col: 'id', type: 'INTEGER (PK)' },
      { col: 'name', type: 'VARCHAR(100)' },
      { col: 'department', type: 'VARCHAR(100)' },
      { col: 'salary', type: 'INTEGER' },
      { col: 'hire_date', type: 'DATE' }
    ]
  };

  const triggerAutoSave = (updatedCode) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.post(`/workspace/state/${courseId}/${question._id}`, {
          environmentType: 'sql_database',
          stateData: { code: updatedCode, query: updatedCode }
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error('SQL auto-save error:', err);
        setSaveStatus('saved');
      }
    }, 1200);
  };

  const handleQueryChange = (val) => {
    setQuery(val);
    triggerAutoSave(val);
  };

  // Run SQL query against backend
  const handleExecuteQuery = async () => {
    if (!query.trim() || isRunning) return;
    try {
      setIsRunning(true);
      const res = await api.post('/adaptive-questions/submit-code', {
        courseId,
        questionId: question._id,
        code: query,
        language: 'sql'
      });
      setRunResult(res.data);
    } catch (err) {
      console.error('SQL execution error:', err);
      setRunResult({
        success: false,
        error: err.response?.data?.message || 'SQL query execution failed.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleValidateAndSubmit = () => {
    onSubmitSolution('sql', query);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100">
      {/* Studio Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-bold text-cyan-400">
            <Database className="w-4 h-4" />
            <span>Interactive SQL & Relational DBMS Studio</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Quick Table Switcher */}
          <div className="flex items-center space-x-1">
            {Object.keys(TABLES).map(tbl => (
              <button
                key={tbl}
                onClick={() => setActiveTable(tbl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                  activeTable === tbl ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tbl}
              </button>
            ))}
          </div>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>{saveStatus === 'saving' ? 'Auto-saving...' : 'Auto-saved'}</span>
          </span>

          <button
            onClick={handleExecuteQuery}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Running Query...' : 'Run Query'}</span>
          </button>

          <button
            onClick={handleValidateAndSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20 disabled:opacity-50 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit SQL'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Schema Browser */}
        <div className="w-56 bg-slate-950/80 border-r border-slate-800 p-3 flex flex-col space-y-3 overflow-y-auto">
          <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <Table className="w-3.5 h-3.5" />
            <span>Schema: {activeTable}</span>
          </div>

          <div className="space-y-1">
            {TABLES[activeTable]?.map(c => (
              <div key={c.col} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-xs font-mono">
                <span className="text-white font-bold block">{c.col}</span>
                <span className="text-[10px] text-cyan-400">{c.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center: SQL Editor & Output */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* SQL Editor Area */}
          <div className="flex-1 p-3 flex flex-col">
            <textarea
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="WRITE YOUR SQL QUERY HERE..."
              className="flex-1 bg-slate-900/90 text-cyan-100 font-mono text-xs p-3 rounded-xl border border-slate-800 outline-none resize-none focus:border-cyan-500/60"
            />
          </div>

          {/* Results Console */}
          <div className="h-56 border-t border-slate-800 bg-slate-950 p-3 overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-slate-400 text-[11px]">
              <span className="flex items-center space-x-1 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span>Query Result Output</span>
              </span>
              {runResult && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${runResult.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {runResult.isCorrect ? '✓ Query Passed' : 'Query Failed'}
                </span>
              )}
            </div>

            {runResult ? (
              <pre className="text-slate-300 whitespace-pre-wrap">
                {runResult.evaluation?.testResults?.[0]?.actual || runResult.message || JSON.stringify(runResult, null, 2)}
              </pre>
            ) : (
              <p className="text-slate-600 italic">Click "Run Query" to execute your SQL against the in-memory database.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
