import React, { useState } from 'react';
import api from '../../../api/client';
import {
  FileSpreadsheet, CheckCircle2, AlertTriangle, AlertCircle,
  X, ArrowRight, Loader2, Users, Database, ShieldCheck,
  Check, RefreshCw, Upload, FileText
} from 'lucide-react';

export default function InternshipStudentsAddModal({ isOpen, onClose, onSuccess }) {
  const [sheetUrl, setSheetUrl] = useState('');
  const [courseOverride, setCourseOverride] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewError, setPreviewError] = useState(null);

  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);

  // PDF Syllabus Upload after batch creation
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfSuccess, setPdfSuccess] = useState(null);

  if (!isOpen) return null;

  const handleFetchPreview = async (e) => {
    e?.preventDefault();
    if (!sheetUrl.trim()) {
      setPreviewError('Please enter a valid Google Sheet URL.');
      return;
    }

    setLoadingPreview(true);
    setPreviewError(null);
    setPreviewData(null);
    setImportSuccess(null);

    try {
      const res = await api.post('/api/internship/preview-sheet', {
        sheetUrl: sheetUrl.trim(),
        courseOverride: courseOverride.trim() || undefined
      });

      if (res.data?.success) {
        setPreviewData(res.data);
      } else {
        setPreviewError(res.data?.message || 'Failed to read Google Sheet.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Could not connect to Google Sheet.';
      setPreviewError(errMsg);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData || !previewData.students || previewData.students.length === 0) return;

    setImporting(true);
    try {
      const res = await api.post('/api/internship/import-batch', {
        sheetUrl: previewData.sheetUrl,
        sheetId: previewData.sheetId,
        courseName: previewData.detectedCourse,
        students: previewData.students
      });

      if (res.data?.success) {
        setImportSuccess(res.data);
        if (onSuccess) onSuccess(res.data);
      } else {
        setPreviewError(res.data?.message || 'Failed to register internship batch.');
      }
    } catch (err) {
      setPreviewError(err.response?.data?.message || err.message || 'Failed to import internship students.');
    } finally {
      setImporting(false);
    }
  };

  const handleUploadSyllabusPdf = async (e) => {
    e?.preventDefault();
    if (!pdfFile || !importSuccess?.batch?._id) return;

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      const res = await api.post(`/api/internship/batches/${importSuccess.batch._id}/syllabus-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setPdfSuccess(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to parse 15-day syllabus PDF');
    } finally {
      setUploadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl my-auto max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">Internship Students Add</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                  1 Sheet = 1 Batch
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium">
                Connect your Google Sheet to auto-create an internship batch and student accounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* STEP 1: Google Sheet Input */}
          {!importSuccess && (
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                  Google Sheet URL <span className="text-red-500 font-sans">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XR.../edit#gid=0"
                    disabled={loadingPreview}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition pr-32 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleFetchPreview}
                    disabled={loadingPreview || !sheetUrl.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {loadingPreview ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Reading...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Fetch Sheet</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>The Google Sheet URL is the <strong>only required input</strong>. Make sure it is shared as "Anyone with link can view".</span>
                </p>
              </div>

              {/* Optional Course Override */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Course / Domain Name (Optional Override)
                  </label>
                  <input
                    type="text"
                    value={courseOverride}
                    onChange={(e) => setCourseOverride(e.target.value)}
                    placeholder="Auto-detected from sheet title or column"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="flex items-center text-xs text-slate-500 bg-white rounded-lg p-2.5 border border-slate-200">
                  <span>Each sheet automatically creates or updates <strong>1 dedicated Internship Batch</strong> with sequential usernames.</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {previewError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Google Sheet Read Error:</span>
                <p>{previewError}</p>
                <p className="text-[11px] text-red-600 font-medium pt-1">
                  Tip: In Google Sheets, click "Share" → change General access to "Anyone with the link" as Viewer.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Preview Results */}
          {previewData && !importSuccess && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Batch & Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider font-mono">Detected Course</span>
                  <p className="text-base font-black text-emerald-950 mt-0.5 truncate">{previewData.detectedCourse}</p>
                  <p className="text-[10px] text-emerald-700">{previewData.sheetTitle || 'Google Sheet'}</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-3 border border-blue-200">
                  <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider font-mono">Total Rows</span>
                  <p className="text-base font-black text-blue-950 mt-0.5">{previewData.totalRows}</p>
                  <p className="text-[10px] text-blue-700">{previewData.validCount} valid students</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-3 border border-purple-200">
                  <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wider font-mono">Existing in DB</span>
                  <p className="text-base font-black text-purple-950 mt-0.5">{previewData.duplicateCount || 0}</p>
                  <p className="text-[10px] text-purple-700">Will be linked to batch</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200">
                  <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider font-mono">Missing Fields</span>
                  <p className="text-base font-black text-amber-950 mt-0.5">{previewData.missingCount || 0}</p>
                  <p className="text-[10px] text-amber-700">Flagged in preview</p>
                </div>
              </div>

              {/* Column Mapping Badge Row */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-700 text-[11px]">Mapped Columns:</span>
                {Object.entries(previewData.columnMapping || {}).map(([key, col]) => (
                  <span key={key} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px] font-mono text-slate-700">
                    <strong>{key}:</strong> {col}
                  </span>
                ))}
              </div>

              {/* Student Table Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Student Records Preview ({previewData.students?.length || 0})</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">Username Format: Name+Course+SequentialCount</span>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold sticky top-0 z-10">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Proposed Username</th>
                        <th className="py-2.5 px-3">Fee / Paid / Pending</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {previewData.students.map((st, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition">
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{st.studentName || '—'}</td>
                          <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{st.email || '—'}</td>
                          <td className="py-2 px-3 font-mono text-emerald-700 font-bold text-[11px]">
                            {st.proposedUsername}
                          </td>
                          <td className="py-2 px-3 text-[11px] font-mono">
                            ₹{st.fee} / <span className="text-emerald-700 font-bold">₹{st.paidAmount}</span> / <span className="text-amber-700">₹{st.pendingAmount}</span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              st.paymentStatus === 'Fully Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : st.paymentStatus === 'Partially Paid'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {st.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confirm Import Action Card */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-emerald-900 space-y-0.5 text-center sm:text-left">
                  <p className="font-bold">Ready to import {previewData.validCount} student(s) into this Internship Batch?</p>
                  <p className="text-emerald-700 text-[11px]">
                    User accounts will be created with bcrypt-hashed passwords. One sheet = One Internship Batch.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={importing}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Batch & Accounts...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Register Batch</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success Screen & 15-Day Syllabus PDF Upload */}
          {importSuccess && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-emerald-500 text-white rounded-3xl p-6 text-center space-y-3 shadow-lg">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm shadow-inner">
                  <Check className="w-8 h-8 text-white stroke-[3]" />
                </div>
                <h3 className="text-xl font-black">Internship Batch Created Successfully!</h3>
                <p className="text-xs text-white/90 max-w-md mx-auto">
                  Batch Code: <strong className="font-mono bg-white/20 px-2 py-0.5 rounded">{importSuccess.batch?.batchCode}</strong>
                  <br />
                  {importSuccess.registeredCount} student account(s) registered with sequential usernames.
                </p>
              </div>

              {/* 15-Day Syllabus PDF Upload Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Upload 15-Day Syllabus PDF</h4>
                    <p className="text-xs text-slate-500">
                      Extract exact Day 1 to Day 15 day-wise modules and questions for this internship batch.
                    </p>
                  </div>
                </div>

                {!pdfSuccess ? (
                  <form onSubmit={handleUploadSyllabusPdf} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files[0])}
                      className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 flex-1 border border-slate-300 rounded-xl p-2 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={uploadingPdf || !pdfFile}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
                    >
                      {uploadingPdf ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Day 1-15...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Extract 15-Day Modules</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-xs flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>{pdfSuccess.message} (Modules & Day-wise questions ready!)</span>
                  </div>
                )}
              </div>

              {/* Close / Done Action */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Done & View Batches
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
