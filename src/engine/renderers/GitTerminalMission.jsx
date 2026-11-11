import React, { useState } from 'react';
import { GitBranch } from 'lucide-react';

export default function GitTerminalMission({ challenge = {}, onCommandRun = () => {} }) {
  const [staged, setStaged] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [history, setHistory] = useState([
    'Initialized git repo on branch main',
    'Modified: index.html, style.css, app.js'
  ]);

  const runCommand = (cmd) => {
    if (cmd.includes('git add')) {
      setStaged(true);
      setHistory(prev => [...prev, `$ ${cmd}`, '✓ Staged 3 files ready for commit']);
    } else if (cmd.includes('git commit')) {
      if (!staged) {
        setHistory(prev => [...prev, `$ ${cmd}`, '✗ Error: no changes added to commit (use "git add")']);
      } else {
        setCommitted(true);
        setHistory(prev => [...prev, `$ ${cmd}`, '✓ [main 4c89f1a] feat: init platform - 3 files changed']);
      }
    } else {
      setHistory(prev => [...prev, `$ ${cmd}`, 'Command executed']);
    }
    onCommandRun(cmd);
  };

  const availableCommands = challenge.gitScenario?.availableCommands || [
    'git add .',
    'git commit -m "feat: init platform"',
    'git push origin main',
    'git status'
  ];

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-purple-700 font-semibold">
          <GitBranch className="w-4 h-4" />
          <span>Git Mission Tree & Terminal</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className={`px-2 py-0.5 rounded border ${staged ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            Staging: {staged ? '✓ Ready' : 'Empty'}
          </span>
          <span className={`px-2 py-0.5 rounded border ${committed ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            Repo: {committed ? '✓ Committed' : 'Uncommitted'}
          </span>
        </div>
      </div>

      {/* Visual Pipeline */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl text-center text-xs shadow-sm">
        <div className={`p-2.5 rounded-lg border ${!staged ? 'border-amber-400 bg-amber-50 text-amber-800 font-medium' : 'border-slate-200 bg-white text-slate-600'}`}>
          <p className="font-semibold mb-1">Working Tree</p>
          <span className="text-[10px] font-mono">3 modified files</span>
        </div>
        <div className={`p-2.5 rounded-lg border ${staged && !committed ? 'border-purple-400 bg-purple-50 text-purple-900 font-medium' : 'border-slate-200 bg-white text-slate-600'}`}>
          <p className="font-semibold mb-1">Staging Area</p>
          <span className="text-[10px] font-mono">{staged ? '3 files indexed' : '0 files'}</span>
        </div>
        <div className={`p-2.5 rounded-lg border ${committed ? 'border-emerald-400 bg-emerald-50 text-emerald-800 font-medium' : 'border-slate-200 bg-white text-slate-600'}`}>
          <p className="font-semibold mb-1">Local Repository</p>
          <span className="text-[10px] font-mono">{committed ? 'Commit 4c89f1a' : 'Pending'}</span>
        </div>
      </div>

      {/* Terminal View */}
      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-800 overflow-y-auto space-y-1 shadow-xs">
        <div className="text-slate-500 pb-1 border-b border-slate-200 flex items-center justify-between text-[11px]">
          <span>STACK QUEUE Git Sandbox v2.4</span>
          <span className="font-semibold text-purple-700">branch: main</span>
        </div>
        {history.map((h, idx) => (
          <p key={idx} className={h.startsWith('$') ? 'text-purple-700 font-bold' : h.startsWith('✓') ? 'text-emerald-700 font-semibold' : h.startsWith('✗') ? 'text-rose-700 font-semibold' : 'text-slate-700'}>
            {h}
          </p>
        ))}
      </div>

      {/* Interactive Quick Command Trigger */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-slate-600 font-semibold">Execute Git Command:</p>
        <div className="flex flex-wrap gap-2">
          {availableCommands.map((cmd, i) => (
            <button
              key={i}
              onClick={() => runCommand(cmd)}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-purple-500 rounded-lg text-xs font-mono text-slate-800 shadow-sm transition"
            >
              $ {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
