/**
 * Unified Frontend UI Loading Failure & Runtime Error Monitoring Service
 * Automatically captures rendering crashes, API failures, page load timeouts,
 * and navigation/action issues, and dispatches sanitized diagnostic alerts to
 * the LMS administrator email notification system.
 */

// In-memory client deduplication cache to prevent alert flooding during render loops
const clientCache = new Map();
const CLIENT_DEDUPE_MS = 30000; // 30 seconds local debounce

// Active page loading watch timers
const activePageWatchers = new Map();

/**
 * Dynamically resolve Page Name and Module Name from Route path
 */
export function resolvePageAndModule(pathname = '') {
  const cleanRoute = (pathname || window?.location?.pathname || '/').toLowerCase().split('?')[0];

  // Admin Analytics Hub
  if (cleanRoute.startsWith('/admin/analytics/fees') || cleanRoute.startsWith('/admin/fee-management')) return { pageName: 'Fee Management Analytics', moduleName: 'Fee Management' };
  if (cleanRoute.startsWith('/admin/analytics/courses')) return { pageName: 'Course Analytics', moduleName: 'Course Analytics' };
  if (cleanRoute.startsWith('/admin/analytics/internships')) return { pageName: 'Internship Analytics', moduleName: 'Internship Analytics' };
  if (cleanRoute.startsWith('/admin/analytics/products')) return { pageName: 'Product Analytics', moduleName: 'Product Analytics' };
  if (cleanRoute.startsWith('/admin/analytics/college-training')) return { pageName: 'College Training Analytics', moduleName: 'College Training' };
  if (cleanRoute.startsWith('/admin/analytics/college-projects')) return { pageName: 'College Projects Analytics', moduleName: 'College Projects' };
  if (cleanRoute === '/admin/analytics' || cleanRoute.startsWith('/admin/analytics/')) return { pageName: 'Admin Analytics Dashboard', moduleName: 'Analytics Overview' };

  // Admin Core Management
  if (cleanRoute.startsWith('/admin/courses')) return { pageName: 'Course Management', moduleName: 'Course Management' };
  if (cleanRoute.startsWith('/admin/internships')) return { pageName: 'Internship Management', moduleName: 'Internship Management' };
  if (cleanRoute.startsWith('/admin/projects')) return { pageName: 'Project Management', moduleName: 'Project Management' };
  if (cleanRoute.startsWith('/admin/batches')) return { pageName: 'Batch Management', moduleName: 'Batch & College' };
  if (cleanRoute.startsWith('/admin/tutors')) return { pageName: 'Tutor Management', moduleName: 'Tutor Management' };
  if (cleanRoute.startsWith('/admin/offers')) return { pageName: 'Offers Management', moduleName: 'Offers' };
  if (cleanRoute.startsWith('/admin/users')) return { pageName: 'User Management', moduleName: 'User Management' };
  if (cleanRoute.startsWith('/admin/error-logs')) return { pageName: 'Error Monitoring', moduleName: 'Diagnostics' };
  if (cleanRoute.startsWith('/admin/domain-management')) return { pageName: 'Domain Management', moduleName: 'Domains' };
  if (cleanRoute.startsWith('/admin/announcements')) return { pageName: 'Admin Announcements', moduleName: 'Announcements' };
  if (cleanRoute.startsWith('/admin/live-monitor')) return { pageName: 'Live Class Monitor', moduleName: 'Live Classes' };
  if (cleanRoute.startsWith('/admin/questions')) return { pageName: 'Question Manager', moduleName: 'Interview Prep' };
  if (cleanRoute.startsWith('/admin/inquiries')) return { pageName: 'Inquiries Management', moduleName: 'Inquiries' };
  if (cleanRoute.startsWith('/admin/lms')) return { pageName: 'LMS Settings', moduleName: 'LMS Platform' };
  if (cleanRoute.startsWith('/admin/command-center') || cleanRoute === '/admin' || cleanRoute === '/admin/') return { pageName: 'Admin Dashboard', moduleName: 'Admin Dashboard' };

  // Student Portal
  if (cleanRoute.startsWith('/student/courses')) return { pageName: 'Course Details', moduleName: 'Student Learning' };
  if (cleanRoute.startsWith('/student/payments')) return { pageName: 'Student Payments', moduleName: 'Payments' };
  if (cleanRoute.startsWith('/student/attendance')) return { pageName: 'Student Attendance', moduleName: 'Attendance' };
  if (cleanRoute.startsWith('/student/games')) return { pageName: 'Game Hub', moduleName: 'Student Games' };
  if (cleanRoute.startsWith('/student/challenges')) return { pageName: 'Daily Challenge', moduleName: 'Daily Challenges' };
  if (cleanRoute.startsWith('/student/learning-path')) return { pageName: 'Learning Path', moduleName: 'Learning Path' };
  if (cleanRoute.startsWith('/student/leaderboard')) return { pageName: 'Leaderboard', moduleName: 'Leaderboard' };
  if (cleanRoute.startsWith('/student/achievements')) return { pageName: 'Achievements', moduleName: 'Achievements' };
  if (cleanRoute.startsWith('/student/progress')) return { pageName: 'Student Progress', moduleName: 'Student Progress' };
  if (cleanRoute.startsWith('/student/projects')) return { pageName: 'Student Projects', moduleName: 'Projects' };
  if (cleanRoute.startsWith('/student/leave')) return { pageName: 'Leave Application', moduleName: 'Leave' };
  if (cleanRoute.startsWith('/student/announcements')) return { pageName: 'Announcements', moduleName: 'Announcements' };
  if (cleanRoute.startsWith('/student/dashboard') || cleanRoute.startsWith('/student')) return { pageName: 'Student Dashboard', moduleName: 'Student Dashboard' };

  // Tutor / Trainer Portal
  if (cleanRoute.startsWith('/trainer/assigned-students')) return { pageName: 'Assigned Students', moduleName: 'Trainer Management' };
  if (cleanRoute.startsWith('/trainer/daily-report')) return { pageName: 'Daily Report Submit', moduleName: 'Trainer Reports' };
  if (cleanRoute.startsWith('/trainer/attendance')) return { pageName: 'Tutor Attendance', moduleName: 'Attendance' };
  if (cleanRoute.startsWith('/trainer/announcements')) return { pageName: 'Tutor Announcements', moduleName: 'Announcements' };
  if (cleanRoute.startsWith('/trainer/learning-progress')) return { pageName: 'Learning Progress', moduleName: 'Learning Progress' };
  if (cleanRoute.startsWith('/trainer/payment-followup')) return { pageName: 'Payment Follow-up', moduleName: 'Payments' };
  if (cleanRoute.startsWith('/trainer/dashboard') || cleanRoute.startsWith('/trainer')) return { pageName: 'Trainer Dashboard', moduleName: 'Trainer' };

  // Public Routes
  if (cleanRoute.startsWith('/courses')) return { pageName: 'Courses Directory', moduleName: 'Public Portal' };
  if (cleanRoute.startsWith('/internships')) return { pageName: 'Internships Directory', moduleName: 'Public Portal' };
  if (cleanRoute.startsWith('/products')) return { pageName: 'Products Directory', moduleName: 'Public Portal' };
  if (cleanRoute.startsWith('/login')) return { pageName: 'Login Page', moduleName: 'Authentication' };
  if (cleanRoute.startsWith('/contact')) return { pageName: 'Contact Us', moduleName: 'Public Portal' };
  if (cleanRoute.startsWith('/about')) return { pageName: 'About Us', moduleName: 'Public Portal' };

  // Fallback: title-case the path segments
  const segments = cleanRoute.split('/').filter(Boolean);
  if (segments.length > 0) {
    const title = segments.map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')).join(' - ');
    return { pageName: title, moduleName: segments[0].toUpperCase() };
  }

  return { pageName: 'Main Page', moduleName: 'LMS Platform' };
}

/**
 * Generate a client correlation ID: ERR-UI-YYYYMMDD-XXXXXX
 */
export function generateCorrelationId() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ERR-UI-${yyyy}${mm}${dd}-${rand}`;
}

/**
 * Format IST timestamp for client display and logging
 */
export function getClientISTTimestamp() {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(new Date()) + ' IST';
  } catch (e) {
    return new Date().toISOString();
  }
}

/**
 * Primary Reporter: Dispatches sanitized failure report to backend alert service
 */
export async function reportUIError({
  pageName,
  route,
  moduleName,
  errorCategory = 'React Render Error',
  errorMessage,
  error,
  failedApi,
  httpStatus,
  component,
  stack,
  impact,
  diagnosticDetails = {},
  isCritical = true,
  severity
}) {
  try {
    const currentRoute = route || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/');
    const resolved = resolvePageAndModule(currentRoute);

    const finalPageName = pageName || resolved.pageName;
    const finalModuleName = moduleName || resolved.moduleName;
    const rawMessage = errorMessage || (error?.message) || String(error) || 'Unknown UI Error';

    // Filter harmless non-actionable errors
    if (
      rawMessage.includes('ResizeObserver') ||
      rawMessage.includes('CanceledError') ||
      rawMessage.includes('AbortError') ||
      rawMessage.includes('chrome-extension://') ||
      rawMessage.includes('moz-extension://') ||
      rawMessage.includes('window.__REACT_DEVTOOLS_')
    ) {
      return null;
    }

    // Client-side debounce to prevent flood on re-render cycles
    const dedupeKey = `${currentRoute}|${errorCategory}|${rawMessage.slice(0, 80)}`;
    const now = Date.now();
    const lastReported = clientCache.get(dedupeKey);
    if (lastReported && now - lastReported < CLIENT_DEDUPE_MS) {
      console.warn(`[UI Monitor Throttled] Repeated client error throttled (${errorCategory}): ${rawMessage}`);
      return null;
    }
    clientCache.set(dedupeKey, now);

    const correlationId = generateCorrelationId();
    const finalStack = stack || error?.stack || (error?.componentStack) || '';

    // Collect safe client diagnostics
    const fullDiagnostics = {
      browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      screenResolution: typeof window !== 'undefined' ? `${window.screen?.width}x${window.screen?.height}` : 'Unknown',
      viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown',
      online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      currentUrl: typeof window !== 'undefined' ? window.location.href : currentRoute,
      clientIST: getClientISTTimestamp(),
      ...diagnosticDetails
    };

    const payload = {
      correlationId,
      pageName: finalPageName,
      route: currentRoute,
      moduleName: finalModuleName,
      errorCategory,
      errorMessage: rawMessage,
      failedApi: failedApi || '',
      httpStatus: httpStatus || 0,
      component: component || '',
      stack: finalStack,
      impact: impact || (isCritical ? `Entire ${finalPageName} page failed to load or crashed` : `${finalPageName} feature encountered an unexpected failure`),
      diagnosticDetails: fullDiagnostics,
      isCritical,
      severity: severity || (isCritical ? 'CRITICAL' : 'HIGH')
    };

    console.error(`[UI Failure Monitor Alerting] ${correlationId} | ${finalPageName} | ${errorCategory}:`, rawMessage);

    // Send to backend monitoring endpoint via fetch with keepalive
    try {
      const response = await fetch('/api/monitoring/frontend-errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        keepalive: true
      });

      if (!response.ok) {
        // Fallback to admin error logs endpoint if monitoring router failed
        await fetch('/api/admin/error-logs/frontend-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      }
    } catch (networkErr) {
      console.warn('[UI Monitor Dispatch Network Error]:', networkErr.message);
    }

    return correlationId;
  } catch (fatalErr) {
    console.error('[UI Monitor Internal Failure]:', fatalErr);
    return null;
  }
}

/**
 * Watch page loading state: alerts if page load remains unfinished after timeout
 * @param {string} routeName - current pathname
 * @param {number} timeoutMs - milliseconds to wait before considering hung (default: 15s)
 */
export function startPageLoadWatch(routeName, timeoutMs = 15000) {
  if (typeof window === 'undefined') return;
  const path = routeName || window.location.pathname;

  // Clear existing watcher for this route if any
  if (activePageWatchers.has(path)) {
    clearTimeout(activePageWatchers.get(path));
  }

  const timer = setTimeout(() => {
    const { pageName, moduleName } = resolvePageAndModule(path);
    reportUIError({
      pageName,
      route: path,
      moduleName,
      errorCategory: 'Page Loading Timeout',
      errorMessage: `Page content failed to load within ${Math.round(timeoutMs / 1000)} seconds. Loading indicator remained unresolved.`,
      impact: `Entire ${pageName} page failed to load for user (hung loading state)`,
      isCritical: true,
      severity: 'CRITICAL',
      diagnosticDetails: { timeoutMs, triggeredAt: getClientISTTimestamp() }
    });
    activePageWatchers.delete(path);
  }, timeoutMs);

  activePageWatchers.set(path, timer);
}

/**
 * Cancel page load watch upon successful data load
 */
export function finishPageLoadWatch(routeName) {
  if (typeof window === 'undefined') return;
  const path = routeName || window.location.pathname;
  if (activePageWatchers.has(path)) {
    clearTimeout(activePageWatchers.get(path));
    activePageWatchers.delete(path);
  }
}

/**
 * Monitor a critical user action (Submit, Save, Update, Delete, Upload)
 * @param {string} actionName - e.g. "Save Course", "Delete Student", "Submit Payment"
 * @param {Function} asyncFn - The action function to execute
 * @param {Object} context - Optional context details
 */
export async function monitorCriticalAction(actionName, asyncFn, context = {}) {
  try {
    return await asyncFn();
  } catch (actionErr) {
    const route = context.route || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const { pageName, moduleName } = resolvePageAndModule(route);

    reportUIError({
      pageName,
      route,
      moduleName,
      errorCategory: 'Critical UI Action Failure',
      errorMessage: `Critical action "${actionName}" failed: ${actionErr.message || String(actionErr)}`,
      error: actionErr,
      failedApi: context.api || '',
      httpStatus: actionErr.response?.status || 0,
      impact: `User could not complete "${actionName}" on ${pageName}`,
      isCritical: false,
      severity: 'HIGH',
      diagnosticDetails: {
        action: actionName,
        ...context
      }
    });

    throw actionErr;
  }
}

/**
 * Global Unhandled Exception & Rejection Handlers Setup
 */
export function initUIErrorMonitoring() {
  if (typeof window === 'undefined') return;

  // Unhandled JavaScript Runtime Errors
  window.addEventListener('error', (event) => {
    // Check if error is from asset load failure (<script>, <link>, etc.)
    const target = event.target;
    if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      const src = target.src || target.href || 'Unknown asset';
      // Only alert if asset is a vital bundle
      if (src.includes('.js') || src.includes('.css')) {
        const { pageName, moduleName } = resolvePageAndModule(window.location.pathname);
        reportUIError({
          pageName,
          route: window.location.pathname,
          moduleName,
          errorCategory: 'Asset Loading Failure',
          errorMessage: `Critical application asset failed to load: ${src}`,
          impact: 'Essential application bundle failed to load; page may be unusable',
          isCritical: true,
          severity: 'CRITICAL',
          diagnosticDetails: { assetUrl: src, tagName: target.tagName }
        });
      }
      return;
    }

    if (!event.error && !event.message) return;

    const { pageName, moduleName } = resolvePageAndModule(window.location.pathname);
    reportUIError({
      pageName,
      route: window.location.pathname,
      moduleName,
      errorCategory: 'JavaScript Runtime Error',
      errorMessage: event.message || event.error?.message || 'Unhandled Runtime Script Error',
      error: event.error,
      stack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
      impact: `Unhandled JavaScript error prevented ${pageName} component from executing correctly`,
      isCritical: false,
      severity: 'HIGH',
      diagnosticDetails: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });

  // Unhandled Asynchronous Promise Rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || String(reason) || 'Unhandled Promise Rejection';

    // Ignore intentional aborts
    if (
      message.includes('CanceledError') ||
      message.includes('AbortError') ||
      message.includes('ResizeObserver')
    ) {
      return;
    }

    const { pageName, moduleName } = resolvePageAndModule(window.location.pathname);
    reportUIError({
      pageName,
      route: window.location.pathname,
      moduleName,
      errorCategory: 'Unhandled Promise Rejection',
      errorMessage: message,
      error: reason instanceof Error ? reason : undefined,
      stack: reason?.stack || '',
      impact: `Asynchronous data or event failure on ${pageName}`,
      isCritical: false,
      severity: 'HIGH'
    });
  });

  console.log('[UI Error Monitoring Service] Initialized successfully with automatic route detection and admin alerts.');
}
