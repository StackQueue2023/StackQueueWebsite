import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

export default function ConfirmNotificationModal({
  isOpen,
  title = "Notification",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
  type = "warning",
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showCancel && onCancel) {
          onCancel();
        } else if (onConfirm) {
          onConfirm();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onConfirm, showCancel]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (showCancel && onCancel) {
      onCancel();
    } else if (onConfirm) {
      onConfirm();
    }
  };

  const modalJSX = (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto mb-3 ${ type === 'danger' ? 'bg-white border-rose-200 text-rose-600' : type === 'info' ? 'bg-white border-purple-200 text-purple-600' : type === 'success' ? 'bg-white border-emerald-200 text-emerald-600' : 'bg-white border-amber-200 text-amber-600' }`}>
          {type === 'danger' ? (
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          ) : type === 'info' ? (
            <Info className="w-6 h-6 text-purple-600" />
          ) : type === 'success' ? (
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
          {title}
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed px-1">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-2.5 mt-6">
          {showCancel && cancelText && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-white transition cursor-pointer"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl bg-white font-bold text-xs transition shadow-sm cursor-pointer border ${ type === 'danger' ? 'border-amber-600 text-amber-700 hover:border-amber-700' : type === 'success' ? 'border-emerald-600 text-emerald-700 hover:border-emerald-700' : 'border-[#9333EA] text-sq-gradient hover:border-[#E02B91]' }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalJSX, document.body)
    : modalJSX;
}
