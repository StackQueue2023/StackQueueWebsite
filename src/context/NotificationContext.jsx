import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((msg, options = {}) => {
    let message = '';
    let title = options.title || '';
    let type = options.type || '';

    if (typeof msg === 'object' && msg !== null) {
      message = msg.message || msg.msg || JSON.stringify(msg);
      title = msg.title || title;
      type = msg.type || type;
    } else {
      message = String(msg || '');
    }

    if (message.includes('E11000 duplicate key error') || message.includes('dup key:')) {
      const keyValMatch = message.match(/dup key:\s*\{\s*(\w+):\s*"([^"]+)"\s*\}/) || message.match(/dup key:\s*\{\s*(\w+):\s*([^\s}]+)\s*\}/);
      if (keyValMatch) {
        const field = keyValMatch[1];
        const val = keyValMatch[2];
        const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);
        if (message.includes('colleges')) {
          message = `College ${fieldLabel} '${val}' already exists. Please enter a unique ${field}.`;
        } else if (message.includes('batches')) {
          message = `Batch ${fieldLabel} '${val}' already exists. Please enter a unique ${field}.`;
        } else {
          message = `${fieldLabel} '${val}' already exists. Please enter a unique ${field}.`;
        }
      } else {
        message = 'Record already exists. Please enter a unique value.';
      }
    }

    if (!type) {
      const lower = message.toLowerCase();
      if (lower.includes('success') || lower.includes('created') || lower.includes('published') || lower.includes('submitted')) {
        type = 'success';
      } else if (lower.includes('failed') || lower.includes('error') || lower.includes('invalid') || lower.includes('cannot') || lower.includes('please enter') || lower.includes('already exists')) {
        type = 'error';
      } else {
        type = 'info';
      }
    }

    if (!title) {
      title = type === 'success' ? 'Success' : type === 'error' ? 'Notice / Action Required' : 'Information';
    }

    setNotification({ title, message, type });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  useEffect(() => {
    const originalAlert = window.alert;

    // Global override for window.alert
    window.alert = (message) => {
      showNotification(message);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification, closeNotification }}>
      {children}

      {/* Global Notification Box Modal */}
      {notification && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          {/* Modal Container: Stops propagation so clicks inside don't trigger anything on background, background click does NOT close modal */}
          <div 
            className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-md w-full p-6 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Right Close Button */}
            <button
              type="button"
              onClick={closeNotification}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              title="Close Notification"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Notification Content */}
            <div className="flex items-start space-x-3.5 pt-1">
              {notification.type === 'success' && (
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              {notification.type === 'error' && (
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}
              {notification.type === 'info' && (
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Info className="w-6 h-6" />
                </div>
              )}

              <div className="space-y-1 pr-6 flex-1">
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {notification.title}
                </h3>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed whitespace-pre-line">
                  {notification.message}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={closeNotification}
                className="px-5 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
