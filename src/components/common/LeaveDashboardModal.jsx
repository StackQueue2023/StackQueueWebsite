import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function LogoutConfirmModal({ isOpen, onConfirm, onCancel }) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-7 text-center transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simple Close (×) Icon at Top-Right Corner */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Centered Question Text */}
        <p
          id="logout-confirm-title"
          className="text-base sm:text-lg font-semibold text-slate-900 my-4 leading-snug"
        >
          Are you sure you want to logout?
        </p>

        {/* Side-by-Side Action Buttons: [ No ] [ Yes ] */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 active:scale-98 transition shadow-xs cursor-pointer"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] text-white font-semibold text-sm hover:opacity-95 active:scale-98 transition shadow-md shadow-pink-500/20 cursor-pointer"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
