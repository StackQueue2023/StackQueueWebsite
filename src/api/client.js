import axios from 'axios';
import { reportUIError, resolvePageAndModule } from '../services/uiErrorMonitoringService';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
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
  const isNetworkFailure = !error.response || error.code === 'ECONNABORTED' || error.message.includes('Network Error');
  const isServerOutage = status >= 500;

  if (isNetworkFailure || isServerOutage) {
    // Notify application that backend connection is compromised
    notifyConnectionStatus(false, {
      status,
      isNetworkFailure,
      message: error.response?.data?.message || error.message || 'Backend connection error'
    });

    // Auto-report critical API 5xx or Network Failure to LMS monitoring system
    if (error.config?.url && !error.config.url.includes('/monitoring/frontend-errors')) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      const { pageName, moduleName } = resolvePageAndModule(currentPath);

      reportUIError({
        pageName,
        route: currentPath,
        moduleName,
        errorCategory: isNetworkFailure ? 'Network Connection Failure' : 'API Server Error',
        errorMessage: error.response?.data?.message || error.message || 'API operation returned server error',
        failedApi: `${error.config.method?.toUpperCase() || 'GET'} ${error.config.url}`,
        httpStatus: status || 0,
        impact: `Data loading failed for ${pageName} (${error.config.method?.toUpperCase()} ${error.config.url})`,
        isCritical: isServerOutage,
        severity: isServerOutage ? 'CRITICAL' : 'HIGH',
        diagnosticDetails: {
          apiUrl: error.config.url,
          apiMethod: error.config.method,
          httpStatus: status
        }
      }).catch(() => {});
    }
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

  // Attach user-friendly diagnostic message while preserving original error
  error.userMessage = error.response?.data?.message || 
    (isNetworkFailure ? 'Unable to reach the server. Please check your network connection.' : 'A server error occurred. Our team has been notified.');

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
