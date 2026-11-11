import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Mail, Lock, CheckCircle2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [demoOtpNotice, setDemoOtpNotice] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { identifier });
      if (res.data.success) {
        setStep(2);
        if (res.data.demoOtp) {
          setDemoOtpNotice(res.data.demoOtp);
          setOtp(res.data.demoOtp); // pre-populate for frictionless testing
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP. Please verify your username or email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Reset with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        identifier,
        otp,
        newPassword,
        confirmPassword
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Password reset successfully!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-8 sm:p-10">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-3 group" title="STACK QUEUE — Inclusive Learning">
            <img
              src="/stackqueue-logo-light.png"
              alt="STACK QUEUE — Inclusive Learning"
              className="h-16 w-auto mx-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reset Account Password</h1>
          <p className="text-xs text-slate-500 mt-1">
            {step === 1
              ? 'Enter your registered email or username to receive a 6-digit OTP'
              : 'Enter the 6-digit verification code and your new password'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-sm">Password Reset Complete!</p>
              <p>{successMsg}</p>
            </div>
            <Link
              to="/login"
              className="inline-block w-full py-3 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/20 transition"
            >
              Proceed to Sign In
            </Link>
          </div>
        ) : step === 1 ? (
          /* Step 1 Form */
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username or Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. student01 or student@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Sending Code...' : 'Send 6-Digit OTP'}
            </button>
          </form>
        ) : (
          /* Step 2 Form */
          <form onSubmit={handleResetPassword} className="space-y-4">
            {demoOtpNotice && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                <span>Demo OTP Code: <strong className="font-mono text-sm">{demoOtpNotice}</strong></span>
                <span className="text-[10px] bg-amber-200/70 px-1.5 py-0.5 rounded font-semibold">Pre-filled</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                6-Digit Verification Code (OTP) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4 text-purple-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 text-purple-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Updating Password...' : 'Save New Password & Log In'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <Link to="/login" className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-purple-600 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
