import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/client';

export default function BackendConnectionBanner() {
  const [status, setStatus] = useState('connected'); // 'connected' | 'reconnecting' | 'unavailable' | 'recovered'
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);

  const backoffRef = useRef(3000); // starts at 3s
  const timerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Ping /health through configured API client to verify real connection
  const checkHealth = useCallback(async () => {
    setIsRetrying(true);
    try {
      const res = await api.get('/health', { timeout: 8000 });
      if (res.data && (res.data.status === 'healthy' || res.data.backendApi === 'online')) {
        // Connection verified
        setDiagnostics(res.data);
        setStatus('recovered');
        backoffRef.current = 3000;
        setLastChecked(new Date());

        // Hide recovery notification after 3.5s
        setTimeout(() => {
          setStatus('connected');
        }, 3500);
        return true;
      } else {
        // Degraded or DB down
        setDiagnostics(res.data);
        setStatus('unavailable');
        setLastChecked(new Date());
        return false;
      }
    } catch (err) {
      setDiagnostics({ error: err.message });
      setStatus('unavailable');
      setLastChecked(new Date());
      return false;
    } finally {
      setIsRetrying(false);
    }
  }, []);

  // Schedule next retry with exponential backoff
  const scheduleNextRetry = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const delayMs = backoffRef.current;
    let secondsLeft = Math.ceil(delayMs / 1000);
    setRetryCountdown(secondsLeft);

    countdownIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      setRetryCountdown(Math.max(0, secondsLeft));
      if (secondsLeft <= 0) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 1000);

    timerRef.current = setTimeout(async () => {
      setStatus('reconnecting');
      const ok = await checkHealth();
      if (!ok) {
        // Increase backoff up to max 30 seconds
        backoffRef.current = Math.min(backoffRef.current * 2, 30000);
        scheduleNextRetry();
      }
    }, delayMs);
  }, [checkHealth]);

  // Listen to axios interceptor events
  useEffect(() => {
    const handleStatusEvent = (e) => {
      const { isConnected } = e.detail || {};

      if (!isConnected) {
        if (status === 'connected') {
          setStatus('unavailable');
          scheduleNextRetry();
        }
      } else if (isConnected && (status === 'unavailable' || status === 'reconnecting')) {
        setStatus('recovered');
        backoffRef.current = 3000;
        setTimeout(() => {
          setStatus('connected');
        }, 3500);
      }
    };

    window.addEventListener('backend-connection-status', handleStatusEvent);

    return () => {
      window.removeEventListener('backend-connection-status', handleStatusEvent);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [status, scheduleNextRetry]);

  const handleManualRetry = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setStatus('reconnecting');
    const ok = await checkHealth();
    if (!ok) {
      scheduleNextRetry();
    }
  };

  if (status === 'connected') {
    return null;
  }

  if (status === 'recovered') {
    return (
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 animate-bounce transition-all duration-300">
        <div className="bg-white flex items-center space-x-2.5 text-emerald-700 px-4 py-2 rounded-full shadow-lg border border-emerald-500 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Backend Connection Restored. Normal operations resumed.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[94%] transition-all duration-300">
      <div className="bg-white backdrop-blur-md text-slate-900 px-4 py-2.5 rounded-2xl shadow-xl border border-amber-400 flex items-center justify-between space-x-3 text-xs font-medium">
        <div className="flex items-center space-x-2.5 truncate">
          <div className="bg-white border border-amber-300 p-1.5 rounded-xl shrink-0">
            {status === 'reconnecting' ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-700" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-700" />
            )}
          </div>
          <div className="truncate">
            <span className="font-bold text-slate-900">
              {diagnostics?.mongodb && !diagnostics.mongodb.connected
                ? 'Database Connectivity Degraded'
                : 'Backend Connection Issue Detected.'}
            </span>{' '}
            <span className="text-amber-700 hidden sm:inline">
              {status === 'reconnecting'
                ? 'Attempting to reconnect now...'
                : diagnostics?.mongodb?.status
                ? `DB: ${diagnostics.mongodb.status} • Reconnecting in ${retryCountdown}s...`
                : `Reconnecting in ${retryCountdown}s... Your input is preserved.`}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleManualRetry}
            disabled={isRetrying}
            className="bg-white flex items-center space-x-1.5 px-3 py-1 border border-amber-600 hover:border-amber-700 text-amber-700 rounded-xl text-[11px] font-bold shadow-xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Checking...' : 'Retry Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
