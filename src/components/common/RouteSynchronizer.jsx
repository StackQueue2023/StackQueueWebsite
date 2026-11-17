import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * RouteSynchronizer
 * - Reconciles hash routes (/#/, /#/dashboard, /#/courses, etc.) to standard SPA paths
 * - Supports Capacitor Android back button without unexpected app exits
 * - Guarantees seamless browser back and forward navigation
 */
export default function RouteSynchronizer() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Hash Route Synchronization (/#/path -> /path)
  useEffect(() => {
    const handleHashSync = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash;
        if (hash.startsWith('#/')) {
          const targetPath = hash.slice(1); // remove '#'
          if (targetPath && targetPath !== location.pathname) {
            navigate(targetPath, { replace: true });
          }
        }
      }
    };

    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, [location.pathname, navigate]);

  // 2. Capacitor Android Hardware Back Button Listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cleanupListener = null;

    const setupCapacitorBackButton = async () => {
      try {
        const capacitor = window.Capacitor;
        if (capacitor && capacitor.Plugins && capacitor.Plugins.App) {
          const { App } = capacitor.Plugins;
          if (typeof App.addListener === 'function') {
            const listenerHandle = await App.addListener('backButton', ({ canGoBack }) => {
              const path = window.location.pathname;
              const isRootPage = path === '/' || path === '/login';

              if (isRootPage) {
                // Exit app gracefully from root or login
                App.exitApp();
              } else if (canGoBack || window.history.length > 1) {
                window.history.back();
              } else {
                navigate('/', { replace: true });
              }
            });

            cleanupListener = () => {
              if (listenerHandle && typeof listenerHandle.remove === 'function') {
                listenerHandle.remove();
              }
            };
          }
        }
      } catch (e) {
        console.warn('[Capacitor BackButton Listener Init Warning]:', e);
      }
    };

    setupCapacitorBackButton();

    return () => {
      if (cleanupListener) cleanupListener();
    };
  }, [navigate]);

  return null;
}
