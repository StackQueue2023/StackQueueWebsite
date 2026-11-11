import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function BackendConnectionBanner() {
  const [status, setStatus] = useState('connected'); // 'connected' | 'reconnecting' | 'unavailable' | 'recovered'
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const backoffRef = useRef(3000); // starts at 3s
  const timerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Ping /api/health to verify real connection
  const checkHealth = useCallback(async () => {
    setIsRetrying(true);
    try {
      const res = await axios.get('/api/health', { timeout: 5000 });
      if (res.data && (res.data.status === 'healthy' || res.data.database === 'connected')) {
        // Recovered!
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
        setStatus('unavailable');
        setLastChecked(new Date());
        return false;
      }
    } catch (err) {
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
        <div className="flex items-center space-x-2.5 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg border border-emerald-500 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>Backend Connection Restored. Normal operations resumed.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[94%] transition-all duration-300">
      <div className="bg-amber-500/95 backdrop-blur-md text-slate-950 px-4 py-2.5 rounded-2xl shadow-xl border border-amber-400 flex items-center justify-between space-x-3 text-xs font-medium">
        <div className="flex items-center space-x-2.5 truncate">
          <div className="p-1.5 bg-amber-600/30 rounded-xl shrink-0">
            {status === 'reconnecting' ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-950" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-950" />
            )}
          </div>
          <div className="truncate">
            <span className="font-bold">Backend Connection Issue Detected.</span>{' '}
            <span className="text-amber-900 hidden sm:inline">
              {status === 'reconnecting'
                ? 'Attempting to reconnect now...'
                : `Reconnecting in ${retryCountdown}s... Your input is preserved.`}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleManualRetry}
            disabled={isRetrying}
            className="flex items-center space-x-1.5 px-3 py-1 bg-amber-950 hover:bg-black text-amber-100 rounded-xl text-[11px] font-bold shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Checking...' : 'Retry Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
