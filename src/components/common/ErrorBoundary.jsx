import React from 'react';
import { AlertTriangle, RefreshCw, Home, Copy, Check, ShieldAlert } from 'lucide-react';
import { reportUIError, getClientISTTimestamp, resolvePageAndModule } from '../../services/uiErrorMonitoringService';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      correlationId: null,
      copied: false,
      isLooping: false,
      timestamp: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error, errorInfo) {
    const timestamp = getClientISTTimestamp();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const { pageName, moduleName } = resolvePageAndModule(currentPath);

    this.setState({ errorInfo, timestamp });
    console.error('[UI ErrorBoundary Caught Exception]:', error, errorInfo);

    // Check retry loop protection in sessionStorage
    try {
      const historyStr = sessionStorage.getItem('lms_err_retries');
      const history = historyStr ? JSON.parse(historyStr) : [];
      const now = Date.now();
      const recent = history.filter(t => now - t < 60000);
      if (recent.length >= 3) {
        this.setState({ isLooping: true });
      }
    } catch (e) {
      // Non-blocking
    }

    // Automatically report failure to LMS administrator error monitoring service
    try {
      const correlationId = await reportUIError({
        pageName,
        route: currentPath,
        moduleName,
        errorCategory: 'React Render Error',
        errorMessage: error?.message || String(error) || 'Component rendering failure',
        error,
        component: errorInfo?.componentStack?.slice(0, 400) || '',
        stack: (error?.stack || '') + '\nComponent Stack:\n' + (errorInfo?.componentStack || ''),
        impact: `Entire ${pageName} page failed to render; user presented with ErrorBoundary recovery screen`,
        isCritical: true,
        severity: 'CRITICAL',
        diagnosticDetails: {
          boundaryContext: this.props.context || 'Page Root Boundary',
          occurredAt: timestamp
        }
      });

      if (correlationId) {
        this.setState({ correlationId });
      }
    } catch (reportErr) {
      console.warn('[ErrorBoundary Reporting Failed]:', reportErr.message);
    }
  }

  handleReset = () => {
    // Track retry count to prevent continuous infinite loop refreshes
    try {
      const historyStr = sessionStorage.getItem('lms_err_retries');
      const history = historyStr ? JSON.parse(historyStr) : [];
      const now = Date.now();
      const recent = history.filter(t => now - t < 60000);
      recent.push(now);
      sessionStorage.setItem('lms_err_retries', JSON.stringify(recent));

      if (recent.length > 3) {
        this.setState({ isLooping: true });
        return;
      }
    } catch (e) {
      // Non-blocking
    }

    this.setState({ hasError: false, error: null, errorInfo: null, isLooping: false });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleCopyIncidentId = () => {
    const textToCopy = `Incident ID: ${this.state.correlationId || 'PENDING'}\nTime: ${this.state.timestamp || getClientISTTimestamp()}\nRoute: ${window?.location?.pathname || '/'}\nError: ${this.state.error?.message || 'UI Render Error'}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    }
  };

  getDashboardLink = () => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (path.startsWith('/admin')) return '/admin/command-center';
    if (path.startsWith('/student')) return '/student/dashboard';
    if (path.startsWith('/trainer')) return '/trainer/dashboard';
    return '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const path = typeof window !== 'undefined' ? window.location.pathname : '/';
      const { pageName } = resolvePageAndModule(path);
      const dashboardLink = this.getDashboardLink();

      return (
        <div className="min-h-[500px] flex items-center justify-center p-6 bg-slate-50/60">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-rose-100 shadow-xl shadow-rose-950/5 p-7 text-center">
            {/* Alert Icon */}
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200/60 shadow-sm">
              <ShieldAlert className="w-7 h-7" />
            </div>

            {/* Title & Page Identification */}
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {pageName} Failed to Load
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed max-w-sm mx-auto">
              An unexpected rendering issue prevented this page from displaying correctly.
              An automatic alert with diagnostic details has been transmitted to the administrator.
            </p>

            {/* Correlation ID & IST Timestamp Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-5 text-left flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Incident Reference ID
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  {this.state.correlationId || 'ERR-UI-DIAGNOSTIC-LOGGED'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Logged: {this.state.timestamp || getClientISTTimestamp()}
                </span>
              </div>
              <button
                type="button"
                onClick={this.handleCopyIncidentId}
                title="Copy Incident ID"
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-medium flex items-center space-x-1.5 transition-colors"
              >
                {this.state.copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message Details (development or readable summary) */}
            {this.state.error && (
              <div className="mb-5 text-left bg-slate-900 text-rose-200 rounded-xl p-3 text-[11px] font-mono overflow-x-auto max-h-28 border border-slate-800 leading-relaxed">
                <span className="text-slate-400 block text-[10px] uppercase mb-1">Error Message:</span>
                {this.state.error.message || this.state.error.toString()}
              </div>
            )}

            {/* Loop Alert Warning */}
            {this.state.isLooping && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-start space-x-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Multiple retries detected</strong>
                  <span>Please return to the Dashboard while the administrator investigates the incident.</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-3 pt-1">
              {!this.state.isLooping && (
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white text-xs font-semibold rounded-xl shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Page</span>
                </button>
              )}

              <a
                href={dashboardLink}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
