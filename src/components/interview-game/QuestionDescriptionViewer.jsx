import React from 'react';
import {
  FileText,
  UserCheck,
  CheckCircle2,
  ListChecks,
  Target,
  Terminal,
  ShieldAlert,
  ArrowRight,
  Code2,
  HelpCircle,
  Sparkles
} from 'lucide-react';

/**
 * Utility to parse inline markdown (bold **text**, inline `code`, etc.) into clean React nodes
 */
export function renderRichInline(text) {
  if (!text || typeof text !== 'string') return null;

  // Pattern matches `inline_code` or **bold_text**
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 bg-slate-100 text-purple-700 font-mono text-xs rounded border border-slate-200"
        >
          {code}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      const bold = part.slice(2, -2);
      return (
        <span
          key={index}
          className="font-bold text-slate-900 bg-purple-50/80 text-purple-900 px-1 py-0.2 rounded border border-purple-200/50"
        >
          {bold}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

/**
 * Parses markdown bullet lines or paragraphs into clean items
 */
function parseBulletPoints(text) {
  if (!text) return [];
  const lines = text.split('\n');
  const items = [];
  let currentParagraph = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentParagraph.length > 0) {
        items.push({ type: 'p', text: currentParagraph.join(' ') });
        currentParagraph = [];
      }
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      if (currentParagraph.length > 0) {
        items.push({ type: 'p', text: currentParagraph.join(' ') });
        currentParagraph = [];
      }
      const bulletText = trimmed.replace(/^([-*]|\d+\.)\s+/, '');
      items.push({ type: 'bullet', text: bulletText });
    } else {
      currentParagraph.push(trimmed);
    }
  }

  if (currentParagraph.length > 0) {
    items.push({ type: 'p', text: currentParagraph.join(' ') });
  }

  return items;
}

export default function QuestionDescriptionViewer({ question }) {
  if (!question) {
    return (
      <div className="p-4 text-xs text-slate-500">
        No question details available.
      </div>
    );
  }

  const rawStatement = question.problemStatement || '';

  // Extract known structured sections if present in the markdown
  const parseStructuredSections = (text) => {
    const sections = [];
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Split on ### or **Heading**: markers
    const sectionSplitter = /(?=(?:^|\n)(?:###|\*\*[A-Z][a-zA-Z\s]+(?:\:|\*\*)))/g;
    const rawChunks = normalized.split(sectionSplitter).map(s => s.trim()).filter(Boolean);

    if (rawChunks.length <= 1 && !normalized.includes('**Interviewer Prompt**')) {
      // Treat as unified markdown
      return null;
    }

    rawChunks.forEach((chunk) => {
      let title = '';
      let body = chunk;
      let type = 'general';

      // Check ### Header
      const h3Match = chunk.match(/^###\s*(.+?)(?:\n|$)/);
      if (h3Match) {
        title = h3Match[1].trim();
        body = chunk.slice(h3Match[0].length).trim();
      } else {
        // Check **Title**: pattern
        const boldTitleMatch = chunk.match(/^\*\*([A-Za-z\s]+)\*\*:?\s*/);
        if (boldTitleMatch) {
          title = boldTitleMatch[1].trim();
          body = chunk.slice(boldTitleMatch[0].length).trim();
        }
      }

      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('interviewer prompt') || lowerTitle.includes('prompt')) {
        type = 'prompt';
      } else if (lowerTitle.includes('deliverable')) {
        type = 'deliverables';
      } else if (lowerTitle.includes('requirement') || lowerTitle.includes('objective')) {
        type = 'requirements';
      } else if (lowerTitle.includes('focus area') || lowerTitle.includes('criteria')) {
        type = 'focus';
      } else if (lowerTitle.includes('scenario') || lowerTitle.includes('context')) {
        type = 'context';
      }

      sections.push({ title, body, type });
    });

    return sections.length > 0 ? sections : null;
  };

  const structuredSections = parseStructuredSections(rawStatement);

  return (
    <div className="space-y-4 text-xs sm:text-sm">
      {/* Title & Metadata Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {question.technology && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {question.technology}
            </span>
          )}
          {question.category && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">
              {question.category}
            </span>
          )}
          {question.difficulty && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                question.difficulty.toLowerCase() === 'easy'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : question.difficulty.toLowerCase() === 'medium'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              {question.difficulty}
            </span>
          )}
          {question.domain && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {question.domain.toUpperCase()}
            </span>
          )}
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {question.title}
        </h2>
      </div>

      {/* Structured Sections or Markdown Presentation */}
      {structuredSections ? (
        <div className="space-y-3">
          {structuredSections.map((sec, idx) => {
            if (sec.type === 'prompt') {
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 shadow-2xs"
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-purple-900 uppercase tracking-wide mb-2">
                    <UserCheck className="w-4 h-4 text-purple-700" />
                    <span>{sec.title || 'Interviewer Prompt'}</span>
                  </div>
                  <div className="text-slate-800 leading-relaxed text-xs sm:text-sm font-medium">
                    {renderRichInline(sec.body)}
                  </div>
                </div>
              );
            }

            if (sec.type === 'deliverables') {
              const bullets = parseBulletPoints(sec.body);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-2xs"
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900 uppercase tracking-wide mb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>{sec.title || 'Candidate Deliverables'}</span>
                  </div>
                  <ul className="space-y-2">
                    {bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start space-x-2 text-slate-800 text-xs sm:text-sm">
                        <span className="mt-0.5 flex-shrink-0 text-emerald-600 font-bold">&#10003;</span>
                        <span>{renderRichInline(b.text)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }

            if (sec.type === 'requirements' || sec.type === 'context') {
              const bullets = parseBulletPoints(sec.body);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-2xs"
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                    <Terminal className="w-4 h-4 text-indigo-600" />
                    <span>{sec.title || 'Scenario Requirements'}</span>
                  </div>
                  <div className="space-y-2 text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {bullets.map((b, bIdx) =>
                      b.type === 'bullet' ? (
                        <div key={bIdx} className="flex items-start space-x-2">
                          <span className="text-purple-600 font-bold mt-0.5">•</span>
                          <span>{renderRichInline(b.text)}</span>
                        </div>
                      ) : (
                        <p key={bIdx}>{renderRichInline(b.text)}</p>
                      )
                    )}
                  </div>
                </div>
              );
            }

            // General or Focus Area
            const bullets = parseBulletPoints(sec.body);
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2"
              >
                {sec.title && (
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span>{sec.title}</span>
                  </div>
                )}
                <div className="space-y-1.5 text-slate-700 text-xs sm:text-sm leading-relaxed">
                  {bullets.map((b, bIdx) =>
                    b.type === 'bullet' ? (
                      <div key={bIdx} className="flex items-start space-x-2">
                        <span className="text-purple-600 font-bold mt-0.5">•</span>
                        <span>{renderRichInline(b.text)}</span>
                      </div>
                    ) : (
                      <p key={bIdx}>{renderRichInline(b.text)}</p>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Plain or general markdown fallback rendered cleanly
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-500">
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Problem Description</span>
          </div>
          <div className="space-y-2 text-slate-800 leading-relaxed text-xs sm:text-sm font-medium">
            {parseBulletPoints(rawStatement).map((b, bIdx) =>
              b.type === 'bullet' ? (
                <div key={bIdx} className="flex items-start space-x-2 pl-2">
                  <span className="text-purple-600 font-bold mt-0.5">•</span>
                  <span>{renderRichInline(b.text)}</span>
                </div>
              ) : (
                <p key={bIdx}>{renderRichInline(b.text)}</p>
              )
            )}
          </div>
        </div>
      )}

      {/* Input / Output / Constraints Card */}
      {(question.inputFormat || question.outputFormat || question.constraints) && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2.5 text-xs">
          {question.inputFormat && (
            <div>
              <span className="font-bold text-slate-700 block mb-0.5">Input Format:</span>
              <p className="text-slate-600 font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                {question.inputFormat}
              </p>
            </div>
          )}
          {question.outputFormat && (
            <div>
              <span className="font-bold text-slate-700 block mb-0.5">Output Format:</span>
              <p className="text-slate-600 font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                {question.outputFormat}
              </p>
            </div>
          )}
          {question.constraints && (
            <div className="pt-1">
              <span className="font-bold text-slate-700">Constraints: </span>
              <span className="text-slate-600 font-mono text-[11px]">{question.constraints}</span>
            </div>
          )}
        </div>
      )}

      {/* Examples Section */}
      {(() => {
        let exList = (question.examples || []).slice();
        if (exList.length < 2 && (question.visibleTestCases?.length > 0 || question.testCases?.length > 0)) {
          const tcList = question.visibleTestCases || question.testCases || [];
          tcList.forEach((tc) => {
            if (exList.length < 2) {
              const inputStr = tc.input !== undefined ? String(tc.input) : '';
              const outputStr = tc.expectedOutput !== undefined ? String(tc.expectedOutput) : (tc.output !== undefined ? String(tc.output) : '');
              if (inputStr && (exList.length === 0 || exList[0].input !== inputStr)) {
                exList.push({
                  input: inputStr,
                  output: outputStr,
                  explanation: tc.explanation || 'Matches expected test case specifications.'
                });
              }
            }
          });
        }

        if (exList.length === 0) return null;

        return (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <Code2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Examples</span>
            </h3>

            {exList.map((ex, idx) => (
              <div
                key={idx}
                className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs"
              >
                <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wide text-purple-800">
                  Example {idx + 1}:
                </div>
                <div>
                  <span className="font-semibold text-slate-600 block text-[11px] mb-0.5">Input:</span>
                  <pre className="bg-white p-2 rounded border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-wrap">
                    {ex.input || '(empty)'}
                  </pre>
                </div>
                <div>
                  <span className="font-semibold text-slate-600 block text-[11px] mb-0.5">Output:</span>
                  <pre className="bg-white p-2 rounded border border-emerald-200 font-mono text-[11px] text-emerald-700 font-bold whitespace-pre-wrap">
                    {ex.output}
                  </pre>
                </div>
                {ex.explanation && (
                  <p className="text-slate-500 italic text-[11px] pt-1">
                    <span className="font-semibold not-italic text-slate-600">Explanation: </span>
                    {ex.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
