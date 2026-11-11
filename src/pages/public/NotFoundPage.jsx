import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FileQuestion } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

export default function NotFoundPage() {
  const { user } = useAuth();
  const dashboardLink = user?.role === 'admin' ? '/admin' : user?.role === 'tutor' || user?.role === 'trainer' ? '/tutor' : '/student';

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl p-8 text-center shadow-sm space-y-6">
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto border border-purple-200/80">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-600 font-mono">Error 404</span>
          <h1 className="text-2xl font-black text-slate-900">Page Not Found</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page or coding challenge you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {user ? (
            <Link to={dashboardLink} className="w-full sm:w-auto">
              <Button variant="primary" icon={Home} className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="primary" icon={Home} className="w-full">
                Return Home
              </Button>
            </Link>
          )}
          <Link to="/games" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full">
              Browse Games
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
