import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Send,
  Eye,
  Check,
  Server,
  Database,
  ExternalLink,
  HelpCircle,
  FileCode,
  Zap,
  Activity
} from 'lucide-react';

export default function AdminErrorMonitoringPage() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({
    totalErrors: 0,
    criticalErrors: 0,
    highErrors: 0,
    pendingAlerts: 0,
    resolvedErrors: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 20
  });
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState(null);
  const [pingLatency, setPingLatency] = useState(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [resolvedFilter, setResolvedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Action States
  const [selectedLog, setSelectedLog] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isTestingAlert, setIsTestingAlert] = useState(false);
  const [isSimulating500, setIsSimulating500] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Fetch Health Telemetry
  const checkHealth = useCallback(async () => {
    const t0 = performance.now();
    try {
      const res = await api.get('/health');
      const t1 = performance.now();
      setPingLatency(Math.round(t1 - t0));
      setHealthStatus(res.data);
    } catch (err) {
      setHealthStatus({ status: 'unreachable', database: 'disconnected' });
      setPingLatency(null);
    }
  }, []);

  // Fetch Error Logs
  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        severity: severityFilter,
        isResolved: resolvedFilter === 'OPEN' ? 'false' : resolvedFilter === 'RESOLVED' ? 'true' : 'ALL',
        search: searchQuery
      };

      const res = await api.get('/admin/error-logs', { params });
      if (res.data?.success) {
        setLogs(res.data.data.errorLogs || []);
        setPagination(res.data.data.pagination || { page: 1, pages: 1, total: 0 });
        setSummary(res.data.data.summary || {});
      }
    } catch (err) {
      console.error('Failed to load error logs:', err);
    } finally {
      setLoading(false);
    }
  }, [severityFilter, resolvedFilter, searchQuery]);

  useEffect(() => {
    fetchLogs(1);
    checkHealth();
  }, [fetchLogs, checkHealth]);

  // Trigger Real Test Alert Email
  const handleTestAlert = async () => {
    setIsTestingAlert(true);
    setActionMessage(null);
    try {
      const res = await api.post('/admin/error-logs/test-alert');
      if (res.data?.success) {
        setActionMessage({
          type: 'success',
          text: `Test Alert Dispatched! Error ID: ${res.data.errorId}. Check admin inbox.`
        });
        fetchLogs(1);
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to dispatch test alert email.'
      });
    } finally {
      setIsTestingAlert(false);
    }
  };

  // Trigger Real Test Frontend UI Error Alert
  const handleTestFrontendAlert = async () => {
    setIsTestingAlert(true);
    setActionMessage(null);
    try {
      const res = await api.post('/admin/error-logs/test-frontend-alert');
      if (res.data?.success) {
        setActionMessage({
          type: 'success',
          text: `Frontend UI Alert Dispatched! Correlation ID: ${res.data.correlationId}. Check admin inbox.`
        });
        fetchLogs(1);
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to dispatch test frontend alert.'
      });
    } finally {
      setIsTestingAlert(false);
    }
  };

  // Trigger Simulated 500 Internal Server Error
  const handleSimulate500 = async () => {
    setIsSimulating500(true);
    setActionMessage(null);
    try {
      await api.post('/admin/error-logs/simulate-500');
    } catch (err) {
      setActionMessage({
        type: 'info',
        text: `Simulated 500 error triggered & captured! Request ID: ${err.response?.data?.requestId || 'Logged'}.`
      });
      setTimeout(() => {
        fetchLogs(1);
      }, 1000);
    } finally {
      setIsSimulating500(false);
    }
  };

  // Mark Error as Resolved
  const handleResolveError = async (id) => {
    setIsResolving(true);
    try {
      const res = await api.patch(`/admin/error-logs/${id}/resolve`, { resolutionNotes });
      if (res.data?.success) {
        setActionMessage({
          type: 'success',
          text: `Issue marked as resolved.`
        });
        setSelectedLog(null);
        setResolutionNotes('');
        fetchLogs(pagination.page);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve error');
    } finally {
      setIsResolving(false);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-200">Critical</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">High</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">{sev}</span>;
    }
  };

  const getAlertBadge = (status) => {
    switch (status) {
      case 'SENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center space-x-1"><Check className="w-2.5 h-2.5 inline mr-1" />Alert Sent</span>;
      case 'THROTTLED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">Throttled (Cooldown)</span>;
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">Pending</span>;
      case 'FAILED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">Alert Failed</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Real-Time Backend Error Monitoring
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping" />
                  Live Event Alerting
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Instant Nodemailer admin alerts, stable fingerprint deduplication, and automated fault recovery.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTestFrontendAlert}
            disabled={isTestingAlert}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            title="Dispatch simulated Frontend UI rendering failure alert to admin email"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${isTestingAlert ? 'animate-spin' : ''}`} />
            <span>{isTestingAlert ? 'Dispatching...' : 'Test UI Failure Alert'}</span>
          </button>

          <button
            onClick={handleTestAlert}
            disabled={isTestingAlert}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            title="Dispatch simulated critical backend error alert to admin email via Nodemailer"
          >
            <Send className={`w-3.5 h-3.5 ${isTestingAlert ? 'animate-spin' : ''}`} />
            <span>{isTestingAlert ? 'Dispatching...' : 'Test Backend Alert'}</span>
          </button>

          <button
            onClick={handleSimulate500}
            disabled={isSimulating500}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            title="Trigger an intentional 500 error to verify Express error middleware capture"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isSimulating500 ? 'Testing...' : 'Simulate API 500'}</span>
          </button>

          <button
            onClick={() => { fetchLogs(pagination.page); checkHealth(); }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
          actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          actionMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-purple-50 text-purple-800 border-purple-200'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600 ml-4">✕</button>
        </div>
      )}

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Total Tracked</span>
            <Activity className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.totalErrors || 0}</p>
          <span className="text-[11px] text-slate-500">Persistent error records</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/20 shadow-sm">
          <div className="flex items-center justify-between text-red-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Critical Open</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-red-600">{summary.criticalErrors || 0}</p>
          <span className="text-[11px] text-red-600 font-medium">Require immediate review</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">High Severity</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-600">{summary.highErrors || 0}</p>
          <span className="text-[11px] text-amber-600 font-medium">Active degraded states</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Pending Alerts</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-700">{summary.pendingAlerts || 0}</p>
          <span className="text-[11px] text-purple-600 font-medium">Outbox / retrying</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{summary.resolvedErrors || 0}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Addressed by admin</span>
        </div>
      </div>

      {/* Live System Health Badge Card */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-800 rounded-xl text-purple-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              LMS Backend API Process
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                healthStatus?.status === 'healthy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {healthStatus?.status === 'healthy' ? 'Online' : 'Degraded'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Platform: {healthStatus?.platform || 'STACK QUEUE API'} | Ping: {pingLatency !== null ? `${pingLatency}ms` : 'Connecting...'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-800 rounded-xl text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              MongoDB Atlas Cluster
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                healthStatus?.database === 'connected' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {healthStatus?.database || 'Unknown'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Cluster: stackqueue_2 | Fallback File Queue Active
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Error ID, message, endpoint, file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Severity & Status Dropdowns */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
            </select>
          </div>

          <select
            value={resolvedFilter}
            onChange={(e) => setResolvedFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Issues</option>
            <option value="OPEN">Unresolved / Open</option>
            <option value="RESOLVED">Resolved Only</option>
          </select>
        </div>
      </div>

      {/* Error Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
            Loading real-time error logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Backend Errors Detected</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All backend endpoints, database services, and email schedulers are operating cleanly without active faults.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Error ID &amp; Time</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Service &amp; Endpoint</th>
                  <th className="py-3 px-4">Error Message</th>
                  <th className="py-3 px-4 text-center">Hits</th>
                  <th className="py-3 px-4">Alert Status</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Error ID & Time */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{log.errorId}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 inline" />
                        {new Date(log.lastOccurredAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4">
                      {getSeverityBadge(log.severity)}
                    </td>

                    {/* Service & Endpoint */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-800 truncate flex items-center gap-1.5" title={log.service}>
                        {log.isFrontend ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-700 uppercase tracking-wide">Frontend UI</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 uppercase">Backend API</span>
                        )}
                        <span>{log.pageName || log.service}</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 truncate" title={`${log.method} ${log.endpoint}`}>
                        <span className="font-bold text-slate-700">{log.method}</span> {log.endpoint}
                      </div>
                    </td>

                    {/* Message */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-medium text-slate-800 truncate" title={log.message}>
                        {log.message}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {log.fileName}:{log.lineNumber || '?'}
                      </span>
                    </td>

                    {/* Hits / Occurrences */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 font-mono">
                        {log.occurrences || 1}
                      </span>
                    </td>

                    {/* Alert Status */}
                    <td className="py-3.5 px-4">
                      {getAlertBadge(log.alertStatus)}
                      {log.dispatchLatencyMs && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {log.dispatchLatencyMs}ms latency
                        </div>
                      )}
                    </td>

                    {/* Resolution State */}
                    <td className="py-3.5 px-4">
                      {log.isResolved ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Resolved
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Open
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => { setSelectedLog(log); setResolutionNotes(log.resolutionNotes || ''); }}
                          className="p-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-600 text-slate-600 rounded-lg transition-colors"
                          title="View Diagnostic Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {!log.isResolved && (
                          <button
                            onClick={() => handleResolveError(log._id)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-lg transition-colors"
                            title="Mark as Resolved"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total items)
            </span>
            <div className="flex space-x-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchLogs(pagination.page - 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchLogs(pagination.page + 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono font-bold text-slate-900 text-sm">
                    {selectedLog.errorId}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Fingerprint: <span className="font-mono">{selectedLog.fingerprint?.slice(0, 16)}...</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {getSeverityBadge(selectedLog.severity)}
                {getAlertBadge(selectedLog.alertStatus)}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  HTTP {selectedLog.statusCode || 500}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700">
                  {selectedLog.occurrences} total occurrence(s)
                </span>
              </div>

              {/* Message */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <p className="font-bold text-slate-900">{selectedLog.message}</p>
                <div className="mt-1 text-[11px] text-slate-500 flex flex-wrap gap-x-4">
                  <span>Service: <strong>{selectedLog.service}</strong></span>
                  <span>Endpoint: <strong className="font-mono">{selectedLog.method} {selectedLog.endpoint}</strong></span>
                  <span>Request ID: <strong className="font-mono">{selectedLog.requestId}</strong></span>
                </div>
              </div>

              {/* Remediation Hint */}
              {selectedLog.remediationHint && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>Immediate Remediation Guidance</span>
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    {selectedLog.remediationHint}
                  </p>
                </div>
              )}

              {/* Source Location */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                <div>Source File: <strong className="text-slate-800">{selectedLog.fileName}</strong> (Line {selectedLog.lineNumber || '?'})</div>
                <div>Function: <strong className="text-slate-800">{selectedLog.functionName || 'anonymous'}()</strong></div>
                <div>First Hit: {new Date(selectedLog.firstOccurredAt).toLocaleString()}</div>
                <div>Last Hit: {new Date(selectedLog.lastOccurredAt).toLocaleString()}</div>
              </div>

              {/* Sanitized Stack Trace */}
              {selectedLog.stack && (
                <div>
                  <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Sanitized Stack Trace</span>
                  </div>
                  <pre className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-44 whitespace-pre-wrap word-break-all">
                    {selectedLog.stack}
                  </pre>
                </div>
              )}

              {/* Resolution Section */}
              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-800 mb-1.5">Resolution Notes &amp; Status</h4>
                {selectedLog.isResolved ? (
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
                    <div className="font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Marked as Resolved by {selectedLog.resolvedByName || 'Administrator'}
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      Resolved At: {new Date(selectedLog.resolvedAt).toLocaleString()}
                    </div>
                    {selectedLog.resolutionNotes && (
                      <p className="mt-2 text-slate-700 bg-white/70 p-2 rounded-lg">
                        {selectedLog.resolutionNotes}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      placeholder="Add notes on how this incident was fixed or investigated..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleResolveError(selectedLog._id)}
                      disabled={isResolving}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isResolving ? 'Resolving...' : 'Mark Incident as Resolved'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
