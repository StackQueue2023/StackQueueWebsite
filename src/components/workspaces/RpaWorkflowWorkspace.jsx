import React, { useState, useEffect, useRef } from 'react';
import {
  Workflow,
  Play,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowDown,
  Terminal,
  Activity
} from 'lucide-react';
import api from '../../api/client';

const RPA_ACTIVITIES = [
  { type: 'read_csv', name: 'Read CSV File', defaultVal: 'path="data/transactions.csv", output=dt_orders' },
  { type: 'foreach_row', name: 'For Each Row', defaultVal: 'in dt_orders, current_item=row' },
  { type: 'if_decision', name: 'If Condition', defaultVal: 'row["amount"] > 1000' },
  { type: 'assign', name: 'Assign Variable', defaultVal: 'flag_priority = "HIGH"' },
  { type: 'write_excel', name: 'Write Output Report', defaultVal: 'path="reports/audit.xlsx"' },
  { type: 'log', name: 'Log Message', defaultVal: 'level="INFO", message="Workflow finished"' }
];

export default function RpaWorkflowWorkspace({
  courseId,
  question,
  initialState,
  onSubmitSolution,
  isSubmitting
}) {
  const [activities, setActivities] = useState(
    initialState?.activities || [
      { id: 'act_1', type: 'read_csv', name: 'Read CSV File', params: 'path="input/customers.csv", output=dt_customers' },
      { id: 'act_2', type: 'foreach_row', name: 'For Each Row in dt_customers', params: 'item=cust_row' },
      { id: 'act_3', type: 'if_decision', name: 'If Decision: cust_row["status"] == "Active"', params: 'condition=True' },
      { id: 'act_4', type: 'assign', name: 'Assign: active_counter = active_counter + 1', params: 'active_counter += 1' },
      { id: 'act_5', type: 'write_excel', name: 'Write Output Report', params: 'path="output/active_summary.xlsx"' }
    ]
  );

  const [simLogs, setSimLogs] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const saveTimeoutRef = useRef(null);

  const triggerAutoSave = (updatedData) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.post(`/workspace/state/${courseId}/${question._id}`, {
          environmentType: 'rpa_workflow',
          stateData: updatedData
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error('RPA auto-save error:', err);
        setSaveStatus('saved');
      }
    }, 1200);
  };

  const updateActivities = (newActs) => {
    setActivities(newActs);
    triggerAutoSave({ activities: newActs });
  };

  const handleAddActivity = (actDef) => {
    const newId = `act_${Date.now()}`;
    const newAct = {
      id: newId,
      type: actDef.type,
      name: actDef.name,
      params: actDef.defaultVal
    };
    updateActivities([...activities, newAct]);
  };

  const handleDeleteActivity = (id) => {
    updateActivities(activities.filter(a => a.id !== id));
  };

  // Run RPA Simulation
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimLogs([]);
    const logs = [];

    activities.forEach((act, idx) => {
      setTimeout(() => {
        const entry = `[${new Date().toLocaleTimeString()}] EXECUTING STEP ${idx + 1}: ${act.name} -> SUCCESS (${act.params})`;
        setSimLogs(prev => [...prev, entry]);
        if (idx === activities.length - 1) {
          setIsSimulating(false);
        }
      }, (idx + 1) * 300);
    });
  };

  const handleValidateAndSubmit = () => {
    const payload = {
      activities
    };
    onSubmitSolution('rpa_workflow', payload);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-bold text-violet-400">
            <Workflow className="w-4 h-4" />
            <span>Robotic Process Automation (RPA) Flow Studio</span>
          </div>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>{saveStatus === 'saving' ? 'Auto-saving...' : 'Auto-saved'}</span>
          </span>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
          </button>

          <button
            onClick={handleValidateAndSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/20 disabled:opacity-50 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Evaluating...' : 'Validate RPA Flow'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Activities Toolbox */}
        <div className="w-56 bg-slate-950/80 border-r border-slate-800 p-3 space-y-2 overflow-y-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Activity Library</span>
          {RPA_ACTIVITIES.map(act => (
            <button
              key={act.type}
              onClick={() => handleAddActivity(act)}
              className="w-full text-left p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/60 text-xs text-slate-200 transition"
            >
              <div className="font-semibold">{act.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{act.defaultVal}</div>
            </button>
          ))}
        </div>

        {/* Center: Sequence Diagram */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center space-y-3 bg-slate-900/60">
          <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold">
            START PROCESS
          </div>
          <ArrowDown className="w-4 h-4 text-slate-600" />

          {activities.map((act, idx) => (
            <React.Fragment key={act.id}>
              <div className="w-96 bg-slate-950/90 border border-violet-900/50 rounded-2xl p-3 shadow-lg flex items-center justify-between text-xs group hover:border-violet-400 transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-400 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white">{act.name}</span>
                  </div>
                  <input
                    type="text"
                    value={act.params}
                    onChange={(e) => {
                      const next = activities.map((a, i) => i === idx ? { ...a, params: e.target.value } : a);
                      updateActivities(next);
                    }}
                    className="w-80 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[11px] font-mono text-slate-300"
                  />
                </div>
                <button
                  onClick={() => handleDeleteActivity(act.id)}
                  className="text-slate-600 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {idx < activities.length - 1 && <ArrowDown className="w-4 h-4 text-slate-600" />}
            </React.Fragment>
          ))}

          <ArrowDown className="w-4 h-4 text-slate-600" />
          <div className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-400 font-mono text-xs font-bold">
            END PROCESS
          </div>
        </div>

        {/* Right Simulation Logs */}
        <div className="w-64 bg-slate-950/90 border-l border-slate-800 p-3 flex flex-col">
          <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px] pb-2 border-b border-slate-800">
            <Terminal className="w-3.5 h-3.5" />
            <span>Execution Simulation Logs</span>
          </div>

          <div className="flex-1 mt-2 font-mono text-[10px] space-y-1 text-slate-400 overflow-y-auto">
            {simLogs.map((log, i) => (
              <div key={i} className="text-emerald-400">{log}</div>
            ))}
            {simLogs.length === 0 && (
              <p className="text-slate-600 italic">Click "Run Simulation" to execute the sequence step-by-step.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
