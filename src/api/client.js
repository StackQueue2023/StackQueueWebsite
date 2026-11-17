import axios from 'axios';
import { reportUIError, resolvePageAndModule } from '../services/uiErrorMonitoringService';

const resolveBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return '/api';
};

const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Broadcast connection status to the entire UI
function notifyConnectionStatus(isConnected, details = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('backend-connection-status', {
        detail: { isConnected, timestamp: Date.now(), ...details }
      })
    );
  }
}

// Request interceptor to attach JWT token and fix FormData headers
api.interceptors.request.use((config) => {
  // Prevent duplicate /api/ prefixes when baseURL already includes /api
  if (config.url && typeof config.url === 'string') {
    if (config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    } else if (config.url === '/api') {
      config.url = '/';
    }
  }

  const token = localStorage.getItem('cq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for handling connectivity and errors gracefully
api.interceptors.response.use((response) => {
  // Successful response implies backend is reachable and healthy
  notifyConnectionStatus(true);
  return response;
}, (error) => {
  const status = error.response?.status;
  const isTimeout = error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'));
  const isNetworkFailure = !error.response && !isTimeout;
  const isServerOutage = status >= 500;
  const isGatewayOutage = status === 502 || status === 503 || status === 504;
  const isPollingUrl = error.config?.url && (error.config.url.includes('generation-status') || error.config.url.includes('monitoring'));

  // Only broadcast full backend disconnection on true network failures or gateway outages (not on isolated app 500s or background pollers)
  if ((isNetworkFailure || isGatewayOutage || isTimeout) && !isPollingUrl) {
    // Notify application that backend connection is compromised
    notifyConnectionStatus(false, {
      status,
      isNetworkFailure,
      isTimeout,
      message: error.response?.data?.message || error.message || (isTimeout ? 'Request timed out' : 'Backend connection error')
    });
  }

  // Auto-report critical API 5xx, timeout, or Network Failure to LMS monitoring system
  if (error.config?.url && !error.config.url.includes('/monitoring/frontend-errors')) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const { pageName, moduleName } = resolvePageAndModule(currentPath);

    reportUIError({
      pageName,
      route: currentPath,
      moduleName,
      errorCategory: isTimeout ? 'Request Timeout' : isNetworkFailure ? 'Network Connection Failure' : 'API Server Error',
      errorMessage: error.response?.data?.message || error.message || (isTimeout ? 'Request timed out waiting for server' : 'API operation returned server error'),
      failedApi: `${error.config.method?.toUpperCase() || 'GET'} ${error.config.url}`,
      httpStatus: status || (isTimeout ? 408 : 0),
      impact: `Operation delayed or failed for ${pageName} (${error.config.method?.toUpperCase()} ${error.config.url})`,
      isCritical: isServerOutage,
      severity: isServerOutage ? 'CRITICAL' : 'HIGH',
      diagnosticDetails: {
        apiUrl: error.config.url,
        apiMethod: error.config.method,
        httpStatus: status,
        isTimeout,
        isNetworkFailure
      }
    }).catch(() => {});
  }

  if (status === 401) {
    // Token expired or invalid session; perform full logout cleanup
    localStorage.removeItem('cq_token');
    localStorage.removeItem('cq_user');
    localStorage.removeItem('cq_profile');
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cq_') || key.toLowerCase().includes('project') || key.toLowerCase().includes('student')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
    } catch (_) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-logout'));
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register') &&
        !currentPath.includes('/forgot-password') &&
        currentPath !== '/'
      ) {
        window.location.replace('/login');
      }
    }
  }

  // Attach precise, actionable user-friendly diagnostic message based on actual failure cause
  let userMessage = error.response?.data?.message;
  if (!userMessage) {
    if (isTimeout) {
      userMessage = 'Request timed out waiting for server. Generation or background processing may still be running. Please check status or resume.';
    } else if (isNetworkFailure) {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        userMessage = 'You appear to be offline. Please check your internet connection.';
      } else {
        userMessage = 'Backend server is temporarily unreachable or restarting. Controlled reconnect in progress...';
      }
    } else if (status === 429) {
      userMessage = 'API or AI service rate limit reached. Please wait a moment before trying again.';
    } else if (status === 401) {
      userMessage = 'Authentication session expired. Please log in again.';
    } else if (status === 403) {
      userMessage = 'Access denied. Administrator privileges required.';
    } else if (status === 404) {
      userMessage = 'The requested resource or endpoint was not found on the server.';
    } else if (isServerOutage) {
      userMessage = 'A server error occurred. Our automated diagnostic monitors have recorded this incident.';
    } else {
      userMessage = error.message || 'An unexpected connection or API error occurred.';
    }
  }

  error.userMessage = userMessage;

  return Promise.reject(error);
});

// In-Memory API Cache & In-Flight Request Deduplication
const apiCache = new Map();
const inFlightRequests = new Map();

export const clearApiCache = (pattern = null) => {
  if (!pattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  }
};

// Automatic cache invalidation on mutations
const invalidateOnMutation = (url) => {
  if (!url) return;
  const cleanUrl = url.split('?')[0];
  if (cleanUrl.includes('/domain-management') || cleanUrl.includes('/courses') || cleanUrl.includes('/categories')) {
    clearApiCache('/domain-management');
    clearApiCache('/courses');
  } else if (cleanUrl.includes('/lms')) {
    clearApiCache('/lms');
    clearApiCache('/admin/batches');
  } else if (cleanUrl.includes('/batches')) {
    clearApiCache('/admin/batches');
    clearApiCache('/lms');
  } else if (cleanUrl.includes('/colleges')) {
    clearApiCache('/admin/colleges');
    clearApiCache('/admin/batches');
  } else if (cleanUrl.includes('/projects')) {
    clearApiCache('/projects');
  } else if (cleanUrl.includes('/tutors') || cleanUrl.includes('/users')) {
    clearApiCache('/admin/tutors');
    clearApiCache('/admin/users');
  } else if (cleanUrl.includes('/analytics')) {
    clearApiCache('/admin/analytics');
  } else {
    const segments = cleanUrl.split('/').filter(Boolean);
    if (segments.length > 0) {
      clearApiCache(segments[0]);
    }
  }
};

// Wrap api.get with caching and deduplication
const defaultGet = api.get.bind(api);
const defaultDelete = api.delete.bind(api);

api.peekCache = (url, params = {}) => {
  const cacheKey = `${url}__${JSON.stringify(params || {})}`;
  const entry = apiCache.get(cacheKey);
  if (entry && (Date.now() - entry.timestamp < 60000)) {
    return entry.response.data;
  }
  return null;
};

api.clearCache = clearApiCache;

api.get = function (url, config = {}) {
  const ttl = config.cacheTTL || 30000; // 30 seconds default
  const cacheKey = `${url}__${JSON.stringify(config.params || {})}`;

  // Check valid cache
  if (!config.skipCache && !config.forceRefresh) {
    const cached = apiCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < ttl)) {
      return Promise.resolve(cached.response);
    }
  }

  // Deduplicate identical in-flight requests
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const promise = defaultGet(url, config)
    .then((response) => {
      if (response && response.data && response.data.success !== false) {
        apiCache.set(cacheKey, {
          timestamp: Date.now(),
          response
        });
      }
      return response;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, promise);
  return promise;
};

const wrapMutation = (originalFn) => {
  return function (url, data, config) {
    return originalFn(url, data, config).then((response) => {
      invalidateOnMutation(url);
      return response;
    });
  };
};

api.post = wrapMutation(api.post.bind(api));
api.put = wrapMutation(api.put.bind(api));
api.patch = wrapMutation(api.patch.bind(api));
api.delete = function (url, config) {
  return defaultDelete(url, config).then((response) => {
    invalidateOnMutation(url);
    return response;
  });
};

if (typeof window !== 'undefined') {
  window.addEventListener('auth-logout', () => {
    clearApiCache();
  });
}

export default api;
