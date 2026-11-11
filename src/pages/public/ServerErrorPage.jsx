import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function ServerErrorPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-red-600 font-mono">Server Error (500)</span>
          <h1 className="text-2xl font-black text-slate-900">Something Went Wrong</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            An unexpected error occurred while communicating with the platform services. Our team has been notified.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            icon={RotateCcw}
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
          >
            Reload Page
          </Button>
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" icon={Home} className="w-full">
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
