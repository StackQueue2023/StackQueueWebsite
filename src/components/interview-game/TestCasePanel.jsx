import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Terminal, Play, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

export default function TestCasePanel({
  testCases = [],
  runResult = null,
  customInput = '',
  onCustomInputChange = () => {},
  onRunCustom = () => {},
  isRunningCustom = false
}) {
  const [activeTab, setActiveTab] = useState(0); // 0..N-1 test cases, or 'custom'

  const results = runResult?.testResults || [];
  const globalStatus = runResult?.status || (runResult?.allPassed ? 'SUCCESS' : (runResult?.error ? 'ERROR' : null));

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm">
      {/* Tab Navigation Header */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs overflow-x-auto shrink-0">
        <div className="flex items-center space-x-2">
          {testCases.map((tc, idx) => {
            const res = results.find(r => r.caseNumber === idx + 1);
            let statusBadge = null;
            if (res) {
              if (res.passed) {
                statusBadge = <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
              } else if (res.status === 'COMPILATION_ERROR' || globalStatus === 'COMPILATION_ERROR') {
                statusBadge = <AlertTriangle className="w-3 h-3 text-amber-600" />;
              } else {
                statusBadge = <XCircle className="w-3 h-3 text-rose-600" />;
              }
            }

            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition text-xs cursor-pointer ${
                  activeTab === idx
                    ? 'bg-white text-purple-700 border border-purple-200 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {statusBadge}
                <span>Case {idx + 1}</span>
              </button>
            );
          })}

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition text-xs cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Custom Input</span>
          </button>
        </div>

        {/* Execution Summary Tag */}
        {runResult && (
          <div className="flex items-center space-x-3 text-xs font-mono ml-2 shrink-0">
            <span
              className={`font-semibold px-2.5 py-0.5 rounded text-[11px] ${
                runResult.allPassed
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : globalStatus === 'COMPILATION_ERROR'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {globalStatus === 'COMPILATION_ERROR'
                ? 'COMPILATION ERROR'
                : globalStatus === 'RUNTIME_ERROR'
                ? 'RUNTIME ERROR'
                : globalStatus === 'TIME_LIMIT_EXCEEDED'
                ? 'TIME LIMIT EXCEEDED'
                : `${runResult.passedTests} / ${runResult.totalTests} Passed`}
            </span>
            {runResult.executionTimeMs !== undefined && (
              <span className="text-slate-500 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{runResult.executionTimeMs}ms</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-mono bg-white">
        {activeTab === 'custom' ? (
          <div className="space-y-4 font-sans">
            <div>
              <label className="block text-slate-700 mb-1.5 text-xs font-bold">
                Test with your own standard input:
              </label>
              <textarea
                value={customInput}
                onChange={(e) => onCustomInputChange(e.target.value)}
                placeholder="Enter input here (e.g. 4 or 100 or [1, 2, 3])..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-mono resize-none text-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={onRunCustom}
                disabled={isRunningCustom || !customInput.trim()}
                className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-md shadow-purple-500/20"
              >
                {isRunningCustom ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white" />
                )}
                <span>Run Custom Test</span>
              </button>
            </div>

            {/* Custom Run Result Output */}
            {runResult && results.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200 font-mono">
                <div className="text-slate-700 text-xs font-bold font-sans">
                  Custom Execution Output:
                </div>
                {results[0].error ? (
                  <pre className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-800 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                    {results[0].error}
                  </pre>
                ) : (
                  <pre className="bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl p-3 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                    {results[0].actual || '<No output returned>'}
                  </pre>
                )}
              </div>
            )}
          </div>
        ) : (
          (() => {
            const currentCase = testCases[activeTab] || testCases[0];
            const currentResult = results.find(r => r.caseNumber === activeTab + 1);

            if (!currentCase) {
              return (
                <div className="text-slate-400 py-6 text-center font-sans">
                  No visible test cases defined.
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {/* Global / Specific Error Display (Compilation Error, Runtime Error, Timeout) */}
                {runResult?.error && (globalStatus === 'COMPILATION_ERROR' || globalStatus === 'RUNTIME_ERROR' || globalStatus === 'TIME_LIMIT_EXCEEDED' || globalStatus === 'SECURITY_VIOLATION') && (
                  <div className="bg-rose-50/90 border border-rose-300 p-4 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs uppercase tracking-wider font-sans">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>{globalStatus.replace(/_/g, ' ')}</span>
                    </div>
                    <pre className="bg-white/80 border border-rose-200 rounded-lg p-3 text-rose-800 text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-48 leading-relaxed">
                      {runResult.error}
                    </pre>
                  </div>
                )}

                {/* Result Status Banner for Test Case */}
                {currentResult && (
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      currentResult.passed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {currentResult.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      <span className="font-bold font-sans">
                        {currentResult.passed
                          ? 'Test Case Passed'
                          : currentResult.status === 'COMPILATION_ERROR'
                          ? 'Compilation Error'
                          : currentResult.status === 'RUNTIME_ERROR'
                          ? 'Runtime Error'
                          : currentResult.status === 'TIME_LIMIT_EXCEEDED'
                          ? 'Time Limit Exceeded'
                          : 'Test Case Failed'}
                      </span>
                    </div>
                    {currentResult.error && globalStatus !== 'COMPILATION_ERROR' && (
                      <span className="text-[11px] text-rose-700 font-mono">
                        {currentResult.error}
                      </span>
                    )}
                  </div>
                )}

                {/* Input block */}
                <div>
                  <div className="text-slate-500 text-[11px] font-sans font-bold mb-1">
                    Input:
                  </div>
                  <pre className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 overflow-x-auto whitespace-pre-wrap">
                    {currentCase.input || '<empty>'}
                  </pre>
                </div>

                {/* Expected Output block */}
                <div>
                  <div className="text-slate-500 text-[11px] font-sans font-bold mb-1">
                    Expected Output:
                  </div>
                  <pre className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-emerald-700 font-bold overflow-x-auto whitespace-pre-wrap">
                    {currentCase.expectedOutput}
                  </pre>
                </div>

                {/* Actual Output block (if ran) */}
                {currentResult && (
                  <div>
                    <div className="text-slate-500 text-[11px] font-sans font-bold mb-1">
                      Your Output:
                    </div>
                    <pre
                      className={`border rounded-xl p-3 overflow-x-auto whitespace-pre-wrap ${
                        currentResult.passed
                          ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800 font-semibold'
                          : 'bg-rose-50/40 border-rose-200 text-rose-800 font-semibold'
                      }`}
                    >
                      {currentResult.actual !== undefined && currentResult.actual !== ''
                        ? currentResult.actual
                        : (currentResult.error ? currentResult.error : '<No output returned>')}
                    </pre>
                  </div>
                )}

                {/* Explanation */}
                {currentCase.explanation && (
                  <div className="text-slate-600 font-sans text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700">Explanation: </span>
                    {currentCase.explanation}
                  </div>
                )}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
