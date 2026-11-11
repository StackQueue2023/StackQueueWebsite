import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';
import BackendConnectionBanner from './components/common/BackendConnectionBanner';
import ErrorBoundary from './components/common/ErrorBoundary';

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <BackendConnectionBanner />
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}
