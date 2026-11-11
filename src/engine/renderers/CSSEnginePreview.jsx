import React, { useMemo } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function CSSEnginePreview({ cssCode = '', challenge = {} }) {
  // Extract custom declarations for container and box
  const targetCondition = challenge.targetCondition || {};

  // Clean and parse CSS locally for live visual injection
  const sanitizedCss = useMemo(() => {
    return `
      .arena-stage {
        width: 100%;
        height: 100%;
        min-height: 240px;
        position: relative;
        background: radial-gradient(circle, #ffffff 0%, #f1f5f9 100%);
        border-radius: 12px;
        overflow: hidden;
        border: 1px dashed rgba(139, 43, 226, 0.4);
      }
      .arena-stage .container {
        width: 100%;
        height: 100%;
        min-height: 240px;
        padding: 16px;
        box-sizing: border-box;
      }
      .arena-stage .navbar {
        width: 100%;
        padding: 12px 20px;
        background: #1e293b;
        border-radius: 8px;
        color: #f8fafc;
        font-family: monospace;
        font-size: 13px;
        box-sizing: border-box;
      }
      .arena-stage .grid-container {
        width: 100%;
        padding: 16px;
        box-sizing: border-box;
      }
      .arena-stage .grid-container > div {
        background: #8B2BE2;
        color: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        font-weight: bold;
        font-size: 13px;
      }
      .arena-stage .box {
        width: 120px;
        height: 60px;
        background: linear-gradient(135deg, #8B2BE2, #E02B91);
        border: 2px solid #C084FC;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-weight: 600;
        font-size: 12px;
        box-shadow: 0 4px 14px rgba(139, 43, 226, 0.25);
        transition: all 0.3s ease;
      }
      /* Injected student code */
      .arena-stage ${cssCode}
    `;
  }, [cssCode]);

  // Check which target conditions are met by basic string check
  const conditionsMet = useMemo(() => {
    const list = [];
    for (const [selector, props] of Object.entries(targetCondition)) {
      for (const [prop, val] of Object.entries(props)) {
        const needle = `${prop}:${val}`.replace(/\s+/g, '');
        const actualNeedle = cssCode.replace(/\s+/g, '').toLowerCase();
        const met = actualNeedle.includes(needle);
        list.push({ selector, prop, val, met });
      }
    }
    return list;
  }, [cssCode, targetCondition]);

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold text-slate-800">Live Stage & Target Verification</span>
        <div className="flex items-center space-x-2">
          {conditionsMet.map((c, i) => (
            <span
              key={i}
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono border ${
                c.met ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {c.met ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-slate-400" />}
              <span>{c.prop}: {c.val}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Sandboxed In-DOM Preview */}
      <div className="relative flex-1 min-h-[260px] bg-slate-50 border border-slate-200 rounded-xl p-2 overflow-hidden shadow-inner flex flex-col justify-center">
        <style>{sanitizedCss}</style>
        <div className="arena-stage">
          {challenge.category === 'Flexbox' && challenge.title.includes('Navigation') ? (
            <div className="navbar">
              <span>Home</span>
              <span>Courses</span>
              <span>Projects</span>
              <span>Profile</span>
            </div>
          ) : challenge.category === 'Grid' ? (
            <div className="grid-container">
              <div>Card 1</div>
              <div>Card 2</div>
              <div>Card 3</div>
            </div>
          ) : (
            <div className="container">
              <div className="box">Target Box</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
