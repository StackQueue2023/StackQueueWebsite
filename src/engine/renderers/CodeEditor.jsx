import React, { useRef } from 'react';
import { Play, Send, RotateCcw, Copy, Check } from 'lucide-react';

export default function CodeEditor({
  code = '',
  onChange = () => {},
  onReset = () => {},
  onRun = () => {},
  onSubmit = () => {},
  isRunning = false,
  isSubmitting = false,
  allTestsPassed = false,
  language = 'javascript'
}) {
  const [copied, setCopied] = React.useState(false);
  const textareaRef = useRef(null);

  const lines = code.split('\n');

  const handleKeyDown = (e) => {
    // Support Tab key indentation
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
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Editor Header */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <span className="font-mono text-slate-600 text-[11px] ml-2 font-semibold uppercase">
            solution.{language === 'css_rendering' ? 'css' : language === 'sql_query' ? 'sql' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'js'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200 transition"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onReset}
            className="flex items-center space-x-1 px-2 py-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200 transition text-[11px]"
            title="Reset to Starter Code"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-xs">
        {/* Line Numbers */}
        <div className="w-10 bg-slate-50 text-slate-400 select-none py-3 text-right pr-2 border-r border-slate-200 font-mono text-[11px]">
          {lines.map((_, i) => (
            <div key={i} className="leading-5">{i + 1}</div>
          ))}
        </div>

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 p-3 bg-white text-slate-900 font-mono leading-5 outline-none resize-none overflow-auto selection:bg-purple-100 placeholder:text-slate-400"
          placeholder="Write your solution code here..."
        />
      </div>

      {/* Editor Footer Controls */}
      <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 font-mono">
          Lines: {lines.length} | Tab Size: 2
        </span>

        <div className="flex items-center space-x-2">
          {/* RUN Button (Always Visible) */}
          <button
            onClick={onRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'RUNNING...' : 'RUN'}</span>
          </button>

          {/* SUBMIT Button (Renders ONLY after all test cases pass) */}
          {allTestsPassed && (
            <button
              onClick={onSubmit}
              disabled={isSubmitting || isRunning}
              className="flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold rounded-xl shadow-md shadow-purple-500/20 transition disabled:opacity-50 animate-pulse"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
