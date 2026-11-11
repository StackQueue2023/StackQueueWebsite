import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

/* ── Animations ── */
const ANIM = `
  @keyframes sqFloatUp   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes sqFloatDown { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
  @keyframes sqFadeInUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sqFadeInL   { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
  @keyframes sqFadeInR   { from{opacity:0;transform:translateX(18px)} to{opacity:1;transform:translateX(0)} }
  @keyframes sqImgIn     { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
  @keyframes sqDash      { to{stroke-dashoffset:-22} }
  @keyframes sqBlobDrift { 0%{transform:translate(0,0)} 50%{transform:translate(6px,-10px)} 100%{transform:translate(0,0)} }

  .sq-img   { animation: sqImgIn  .9s .1s ease both }
  .sq-cL    { animation: sqFadeInL .65s .35s ease both, sqFloatUp   4.2s 1.1s ease-in-out infinite }
  .sq-cTR   { animation: sqFadeInR .65s .55s ease both, sqFloatDown 3.8s 1.3s ease-in-out infinite }
  .sq-cBR   { animation: sqFadeInR .65s .75s ease both, sqFloatUp   4.6s 1.5s ease-in-out infinite }
  .sq-blobA { animation: sqBlobDrift 9s ease-in-out infinite }
  .sq-blobB { animation: sqBlobDrift 12s 2s ease-in-out infinite }
  .sq-dash  { animation: sqDash 1.6s linear infinite }

  @media(prefers-reduced-motion:reduce){
    .sq-img,.sq-cL,.sq-cTR,.sq-cBR,.sq-blobA,.sq-blobB,.sq-dash
    { animation:none!important }
  }
`;

/* Shared card style */
const cardBase = {
  position: 'absolute',
  background: 'white',
  borderRadius: 14,
  padding: '9px 14px 9px 10px',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  boxShadow: '0 6px 22px rgba(59,130,246,.15)',
  border: '1px solid rgba(219,234,254,.9)',
  minWidth: 138,
};

const iconBox = {
  width: 36, height: 36,
  borderRadius: 10,
  background: '#EFF6FF',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
};

function SQIllustration() {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', minHeight: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(145deg,#EEF2FF 0%,#E8EEFF 45%,#DBEAFE 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <style>{ANIM}</style>

      {/* Background decorative blobs — matching reference */}
      <div className="sq-blobA" style={{
        position:'absolute', top:-50, right:-50,
        width:200, height:200, borderRadius:'50%',
        background:'rgba(199,210,254,.55)', pointerEvents:'none',
      }}/>
      <div className="sq-blobA" style={{
        position:'absolute', top:-10, right:-10,
        width:120, height:120, borderRadius:'50%',
        background:'rgba(191,219,254,.4)', pointerEvents:'none',
        animationDelay:'.4s',
      }}/>
      <div className="sq-blobB" style={{
        position:'absolute', bottom:-60, left:-40,
        width:220, height:220, borderRadius:'50%',
        background:'rgba(191,219,254,.4)', pointerEvents:'none',
      }}/>

      {/* Wrapper: image + overlay cards */}
      <div className="sq-img" style={{
        position: 'relative',
        width: '90%',
        maxWidth: 520,
        zIndex: 1,
      }}>
        {/* ── THE EXACT REFERENCE IMAGE ── */}
        <img
          src="/sq-login-illustration.png"
          alt="Stack Queue — Learn, Build, Grow"
          style={{
            width: '100%', height: 'auto',
            display: 'block',
            userSelect: 'none', pointerEvents: 'none',
            borderRadius: 8,
          }}
          draggable={false}
        />

        {/* SVG overlay — dashed connector lines only */}
        <svg viewBox="0 0 520 420" fill="none"
          style={{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible',pointerEvents:'none'}}
          xmlns="http://www.w3.org/2000/svg">
          {/* Learn → illustration */}
          <path className="sq-dash"
            d="M 148 108 Q 188 128 208 156"
            stroke="#93C5FD" strokeWidth="1.6" strokeDasharray="6 4" fill="none" opacity=".75"/>
          {/* Build → illustration */}
          <path className="sq-dash"
            d="M 374 114 Q 344 132 318 156"
            stroke="#93C5FD" strokeWidth="1.6" strokeDasharray="6 4" fill="none" opacity=".75"
            style={{animationDelay:'.4s'}}/>
          {/* Grow → illustration */}
          <path className="sq-dash"
            d="M 374 272 Q 350 278 330 276"
            stroke="#93C5FD" strokeWidth="1.6" strokeDasharray="6 4" fill="none" opacity=".75"
            style={{animationDelay:'.8s'}}/>
        </svg>

        {/* ── LEARN card — top left ── */}
        <div className="sq-cL" style={{ ...cardBase, top: '6%', left: '-4%' }}>
          <div style={iconBox}>
            {/* Graduation cap SVG icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 4L19 8.5L11 13L3 8.5L11 4Z" fill="#3B82F6"/>
              <path d="M17 10.5V14.5C17 16.5 14.3 18 11 18C7.7 18 5 16.5 5 14.5V10.5" stroke="#3B82F6" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
              <line x1="19" y1="8.5" x2="19" y2="12.5" stroke="#3B82F6" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:'#1E3A8A',lineHeight:1.2}}>Learn</div>
            <div style={{fontSize:10,color:'#3B82F6',fontWeight:500,marginTop:2}}>New Skills</div>
          </div>
        </div>

        {/* ── BUILD card — top right ── */}
        <div className="sq-cTR" style={{ ...cardBase, top: '4%', right: '-4%' }}>
          <div style={{...iconBox, fontFamily:'monospace', fontSize:15, fontWeight:700, color:'#3B82F6'}}>
            {'</>'}
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:'#1E3A8A',lineHeight:1.2}}>Build</div>
            <div style={{fontSize:10,color:'#3B82F6',fontWeight:500,marginTop:2}}>Real Projects</div>
          </div>
        </div>

        {/* ── GROW card — bottom right ── */}
        <div className="sq-cBR" style={{ ...cardBase, bottom: '22%', right: '-4%' }}>
          <div style={iconBox}>
            {/* Bar chart icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="3"  y="14" width="4" height="5" rx="1" fill="#3B82F6"/>
              <rect x="9"  y="10" width="4" height="9" rx="1" fill="#3B82F6" opacity=".8"/>
              <rect x="15" y="6"  width="4" height="13" rx="1" fill="#3B82F6" opacity=".7"/>
            </svg>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:'#1E3A8A',lineHeight:1.2}}>Grow</div>
            <div style={{fontSize:10,color:'#3B82F6',fontWeight:500,marginTop:2}}>Your Career</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Login Page ── */
export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const redirectByRole = useCallback((role) => {
    if (role === 'admin') navigate('/admin', { replace: true });
    else if (role === 'tutor' || role === 'trainer') navigate('/tutor', { replace: true });
    else navigate('/student', { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (user) {
      redirectByRole(user.role);
    }
  }, [user, redirectByRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await login(identifier, password);
      redirectByRole(data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid Student ID or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* LEFT — Form (unchanged) */}
      <div className="flex-1 flex flex-col justify-center py-8 px-8 sm:px-12 bg-white lg:max-w-[50%] overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
            Sign In to{' '}
            <span className="bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] bg-clip-text text-transparent">
              STACK QUEUE
            </span>
          </h2>
          <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl shadow-lg border border-[#E5E7EB] space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E02B91] to-[#8B2BE2]"/>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0"/>
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#111827] font-bold uppercase tracking-wider">Student ID</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3"/>
                  <input type="text" required value={identifier}
                    onChange={e=>setIdentifier(e.target.value)} placeholder="Student ID"
                    className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl pl-9 pr-3.5 py-2.5 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#E02B91] focus:bg-white transition"/>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[#111827] font-bold uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3"/>
                  <input type={showPassword ? 'text' : 'password'} required value={password}
                    onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl pl-9 pr-10 py-2.5 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#E02B91] focus:bg-white transition"/>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-[#E02B91]" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
                <div className="flex justify-end pt-0.5">
                  <Link to="/forgot-password" className="text-[11px] font-semibold text-[#E02B91] hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] hover:opacity-95 text-white rounded-full font-bold shadow-md shadow-pink-500/20 hover:shadow-lg transition disabled:opacity-60 text-xs flex items-center justify-center space-x-2">
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4"/>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* RIGHT — Exact illustration + animated cards */}
      <div className="hidden lg:flex flex-1 items-stretch">
        <SQIllustration/>
      </div>
    </div>
  );
}
