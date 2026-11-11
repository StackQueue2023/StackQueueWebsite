import React, { useRef, useState } from 'react';
import { Play, Send, Copy, Check, Trash2, ZoomIn, ZoomOut, Terminal, Code2, ArrowRight } from 'lucide-react';
import TestCasePanel from './TestCasePanel';
import ConfirmNotificationModal from '../common/ConfirmNotificationModal';

export const MINIMAL_TEMPLATES = {
  java: `public class Main {\n    public static void main(String[] args) {\n\n        // Write your code here\n\n    }\n}`,
  python: `# Write your Python code here\n`,
  javascript: `function solution() {\n    const str = prompt("");\n    // Write your code here\n    return str;\n}\n\nconst res = solution();\nconsole.log(res);\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
};

export default function InterviewCodeEditor({
  code = '',
  onChange = () => {},
  onRun = () => {},
  onSubmit = () => {},
  language = 'javascript',
  onLanguageChange = () => {},
  isRunning = false,
  isSubmitting = false,
  canSubmit = true,
  readOnly = false,
  availableLanguages = ['javascript', 'python', 'java'],
  testCases = [],
  runResult = null,
  customInput = '',
  onCustomInputChange = () => {},
  onRunCustom = () => {},
  onNext = null,
  hasNext = false
}) {
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'output'
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const lines = code.split('\n');

  // Synchronize scroll between line numbers gutter and textarea
  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleKeyDown = (e) => {
    // Tab indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }

    // Auto-indent on Enter
    if (e.key === 'Enter') {
      const start = e.target.selectionStart;
      const currentLine = code.substring(0, start).split('\n').pop();
      const indentMatch = currentLine.match(/^\s+/);
      const indent = indentMatch ? indentMatch[0] : '';

      // Check if line ends with { or :
      const extraIndent = /[{:]\s*$/.test(currentLine) ? '  ' : '';
      const addition = '\n' + indent + extraIndent;

      e.preventDefault();
      const newCode = code.substring(0, start) + addition + code.substring(start);
      onChange(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + addition.length;
        }
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setClearModalOpen(true);
  };

  const handleRunClick = () => {
    setActiveTab('output');
    onRun();
  };

  const handleSubmitClick = () => {
    setActiveTab('output');
    onSubmit();
  };

  const langNames = {
    javascript: 'JavaScript (Node.js)',
    python: 'Python (3.11)',
    java: 'Java (JDK 22)',
    cpp: 'C++ (GCC)'
  };

  const activeLang = availableLanguages.includes(language) ? language : (availableLanguages[0] || 'java');

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm">
      {/* Editor Header Bar */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
        {/* Language selector, Code/Output Tabs & Mac buttons */}
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5 hidden sm:flex">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>

          <div className="flex items-center space-x-1.5 bg-white rounded-lg p-1 border border-slate-200 shadow-xs">
            <Code2 className="w-3.5 h-3.5 text-purple-600 ml-1" />
            <select
              value={activeLang}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-slate-800 font-mono text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang} className="bg-white text-slate-800">
                  {langNames[lang] || lang}
                </option>
              ))}
            </select>
          </div>

          {/* CODE / OUTPUT TAB TOGGLE BUTTONS */}
          <div className="flex items-center space-x-1 bg-slate-200/80 p-0.5 rounded-lg border border-slate-300">
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Code</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('output')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'output'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>Output</span>
              {runResult && (
                <span className={`w-2 h-2 rounded-full ${runResult.allPassed ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></span>
              )}
            </button>
          </div>
        </div>

        {/* Toolbar Tools */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-white rounded px-1.5 py-0.5 border border-slate-200 text-slate-500 shadow-xs">
            <button
              onClick={() => setFontSize(Math.max(11, fontSize - 1))}
              className="hover:text-slate-800 p-0.5"
              title="Decrease Font"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 font-semibold">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(22, fontSize + 1))}
              className="hover:text-slate-800 p-0.5"
              title="Increase Font"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100 transition"
            title="Clear Editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body: Either Code Editor or Output Panel */}
      {activeTab === 'code' ? (
        <div className="flex-1 flex overflow-hidden relative bg-white">
          {/* Line Numbers Gutter */}
          <div
            ref={lineNumbersRef}
            className="w-12 bg-slate-50 text-slate-400 font-mono text-right pr-3 pt-3 select-none overflow-hidden shrink-0 border-r border-slate-200"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
          >
            {lines.map((_, i) => (
              <div key={i} className="hover:text-slate-600">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            disabled={readOnly}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="flex-1 bg-white text-slate-900 font-mono p-3 resize-none focus:outline-none focus:ring-0 leading-[1.6] whitespace-pre tab-4 selection:bg-purple-100 selection:text-purple-900 overflow-auto placeholder:text-slate-400"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
            placeholder="// Write your solution here..."
          />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden bg-white">
          <TestCasePanel
            testCases={testCases}
            runResult={runResult}
            customInput={customInput}
            onCustomInputChange={onCustomInputChange}
            onRunCustom={onRunCustom}
            isRunningCustom={isRunning}
          />
        </div>
      )}

      {/* Action Footer */}
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>{lines.length} lines</span>
          <span className="text-slate-300">•</span>
          <span>{code.length} chars</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunClick}
            disabled={isRunning || isSubmitting}
            className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-100 text-purple-700 hover:text-purple-800 rounded-lg font-semibold text-xs border border-purple-200 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isRunning ? (
              <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Play className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
            )}
            <span>Run Code</span>
          </button>

          {(() => {
            const hasCode = Boolean(code && code.trim().length > 0);
            const isSubmissionReady = hasCode && !isRunning && !isSubmitting && !readOnly;

            return (
              <button
                type="button"
                onClick={handleSubmitClick}
                disabled={!isSubmissionReady}
                title={
                  isSubmissionReady
                    ? 'Submit your solution for final evaluation'
                    : isRunning
                    ? 'Executing code...'
                    : isSubmitting
                    ? 'Submitting solution...'
                    : 'Write code to enable submission'
                }
                className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-bold text-xs shadow-sm transition transform active:scale-95 ${
                  isSubmissionReady
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Submit Solution</span>
              </button>
            );
          })()}

          {hasNext && onNext && (
            <button
              type="button"
              onClick={onNext}
              className="flex items-center space-x-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 rounded-lg font-bold text-xs border border-purple-200 shadow-2xs transition cursor-pointer"
              title="Go to next question in this module"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <ConfirmNotificationModal
        isOpen={clearModalOpen}
        title="Clear Code Editor?"
        message="Are you sure you want to clear all code in the editor?"
        confirmText="Clear Code"
        cancelText="Cancel"
        type="warning"
        onConfirm={() => {
          setClearModalOpen(false);
          onChange('');
        }}
        onCancel={() => setClearModalOpen(false)}
      />
    </div>
  );
}

