import React from 'react';
import { Database, CheckCircle2 } from 'lucide-react';

export default function SQLResultsTable({ results = null }) {
  const schemaColumns = ['id', 'name', 'course', 'mark', 'city', 'batch'];
  const sampleRows = [
    { id: 101, name: 'Alice Walker', course: 'Full Stack Java', mark: 92, city: 'Austin', batch: '2026-A' },
    { id: 102, name: 'Bob Chen', course: 'Python AI', mark: 78, city: 'Seattle', batch: '2026-A' },
    { id: 103, name: 'Clara Patel', course: 'Full Stack Java', mark: 85, city: 'Boston', batch: '2026-B' },
    { id: 104, name: 'David Kim', course: 'MERN Stack', mark: 64, city: 'Chicago', batch: '2026-B' },
    { id: 105, name: 'Elena Rostova', course: 'Python AI', mark: 95, city: 'Austin', batch: '2026-A' }
  ];

  const columns = results?.columns || schemaColumns;
  const rows = results?.rows || sampleRows;

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-purple-700 font-semibold">
          <Database className="w-4 h-4" />
          <span>Table: students (Institute Database)</span>
        </div>
        <span className="text-slate-500 font-mono text-[11px]">
          {results ? `${results.rows?.length || 0} rows returned` : 'Schema Preview (5 sample rows)'}
        </span>
      </div>

      <div className="flex-1 overflow-auto bg-white border border-slate-200 rounded-xl shadow-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-3 py-2 font-semibold text-purple-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-slate-400 italic">
                  No records returned matching query.
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-800">
                      {col === 'mark' ? (
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          row[col] >= 85 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {row[col]}
                        </span>
                      ) : (
                        row[col]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {results?.feedback && (
        <div className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 border ${
          results.passed ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{results.feedback}</span>
        </div>
      )}
    </div>
  );
}
