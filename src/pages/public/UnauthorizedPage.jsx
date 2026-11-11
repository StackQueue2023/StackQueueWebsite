import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const dashboardLink = user?.role === 'admin' ? '/admin' : user?.role === 'tutor' || user?.role === 'trainer' ? '/tutor' : '/student';

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-red-600 font-mono">Access Denied (403)</span>
          <h1 className="text-2xl font-black text-slate-900">Permission Required</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your current account role does not have authorization to view this section of the academy portal.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {user ? (
            <Link to={dashboardLink} className="w-full sm:w-auto">
              <Button variant="primary" icon={Home} className="w-full">
                My Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full">
                Login with Different Account
              </Button>
            </Link>
          )}
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
