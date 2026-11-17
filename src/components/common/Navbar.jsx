import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Zap,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import LogoutConfirmModal from './LogoutConfirmModal';

export default function Navbar() {
  const { user, profile, logout, isStudent, isTutor, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [xpToast, setXpToast] = useState(null);
  const [xpPulsing, setXpPulsing] = useState(false);
  const xpTimerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleXpUpdated = (e) => {
      const awarded = Number(e?.detail?.xpAwarded || 0);
      if (awarded > 0) {
        setXpToast({ amount: awarded, key: e?.detail?.timestamp || Date.now() });
        setXpPulsing(true);
        if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
        xpTimerRef.current = setTimeout(() => {
          setXpToast(null);
          setXpPulsing(false);
        }, 3200);
      }
    };
    window.addEventListener('sq-xp-updated', handleXpUpdated);
    return () => {
      window.removeEventListener('sq-xp-updated', handleXpUpdated);
      if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
    };
  }, []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/');
      return;
    }

    // When any logged-in user clicks Logo, ask: "Are you sure you want to logout?"
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const xp = profile?.totalXp ?? 0;

  // 1. Navigation items based on role — NO links for any logged-in user (admin, tutor, student)
  let navLinks = [];

  if (!user) {
    // Visitor Links: Category-coded text colors on pure white navbar
    navLinks = [
      { to: '/courses', label: 'Courses', category: 'course' },
      { to: '/internships', label: 'Internships', category: 'internship' },
      { to: '/products', label: 'Products', category: 'project' },
    ];
  } else {
    // Logged-in Admin, Tutor, and Student have NO navbar links (they use dashboard and sidebar)
    navLinks = [];
  }

  const getNavColors = () => ({
    active: 'text-[#9333EA] font-semibold',
    idle: 'text-[#0F172A] hover:text-[#9333EA]',
    bar: 'bg-gradient-to-r from-[#8B2BE2] via-[#C026D3] to-[#EC4899]'
  });

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto  sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        {/* Left: Brand Logo — 10rem */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center group shrink-0 cursor-pointer bg-transparent border-0 p-0 focus:outline-none"
          title="STACK QUEUE — Inclusive Learning"
        >
          <img
            src="/stackqueue-logo-light.png"
            alt="STACK QUEUE — Inclusive Learning"
            className="w-auto object-contain group-hover:opacity-90 transition-opacity"
            style={{ height: '5rem', imageRendering: 'auto' }}
          />
        </button>

        {/* Center: Main Navigation Desktop */}
        <nav className="hidden xl:flex items-center space-x-2">
          {navLinks.map((link) => {
            const colors = getNavColors();
            return (
            <NavLink
              key={link.to + link.label}
              to={link.to}
              className={({ isActive }) =>
                `relative px-5 py-2 font-semibold transition-all duration-200 group/nav bg-white
                 ${isActive && !link.to.includes('#')
                   ? colors.active
                   : colors.idle
                 }`
              }
              style={{ fontSize: '1rem' }}
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {/* Category underline */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] rounded-full ${colors.bar} transition-all duration-300
                      ${isActive && !link.to.includes('#')
                        ? 'w-full opacity-100'
                        : 'w-0 opacity-0 group-hover/nav:w-full group-hover/nav:opacity-100'
                      }`}
                  />
                </>
              )}
            </NavLink>
            );
          })}
        </nav>

        {/* Right Side: Auth State or Gamification Metrics */}
        <div className="flex items-center space-x-3">
          {/* If Student: Experience Points */}
          {user && isStudent && (
            <div className="relative hidden sm:flex items-center space-x-2">
              <div
                className={`flex items-center space-x-1 bg-white border border-purple-300 px-2.5 py-1 rounded-lg text-xs font-bold text-[#9333EA] transition-transform duration-300 ${xpPulsing ? 'scale-110 ring-2 ring-[#DB2777]/40' : ''}`}
                title="Total Experience Points"
              >
                <Zap className={`w-3.5 h-3.5 text-[#9333EA] ${xpPulsing ? 'animate-pulse' : ''}`} />
                <span className="text-sq-gradient">{xp} XP</span>
              </div>

              {xpToast && (
                <div
                  key={xpToast.key}
                  className="absolute right-0 top-full mt-2 z-50 whitespace-nowrap bg-white border border-[#9333EA] rounded-full px-3 py-1 shadow-md pointer-events-none animate-bounce"
                >
                  <span className="text-xs font-extrabold text-sq-gradient">
                    +{xpToast.amount} XP Earned
                  </span>
                </div>
              )}
            </div>
          )}

          {/* If User Logged In: Profile Pill */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#9333EA] flex items-center justify-center font-bold text-xs shadow-xs">
                <span className="text-sq-gradient">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-[#172033] leading-tight truncate max-w-[110px]">
                  {user.name || user.username}
                </p>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded inline-block bg-white border border-purple-200 text-[#9333EA]">
                  {user.role}
                </span>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                title="Logout"
                className="p-1.5 bg-white text-slate-500 hover:text-slate-900 rounded-lg border border-transparent hover:border-slate-200 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* If Visitor: Login Button */
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 font-bold bg-white border border-purple-200 hover:border-[#DB2777] rounded-xl transition"
                style={{ fontSize: '1rem' }}
              >
                <span className="text-sq-gradient">Login</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger (Only for unauthenticated visitors with navLinks) */}
          {navLinks.length > 0 && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 bg-white text-[#9333EA] hover:border hover:border-purple-200 rounded-lg transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && navLinks.length > 0 && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const colors = getNavColors();
              return (
              <Link
                key={link.to + link.label}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2 rounded-xl text-sm font-semibold bg-white border border-transparent hover:border-slate-200 ${colors.idle}`}
              >
                {link.label}
              </Link>
              );
            })}
          </div>

          {!user && (
            <div className="pt-3 border-t border-slate-200 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold bg-white border border-slate-300 text-slate-800 rounded-xl"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold bg-white border border-[#9333EA] rounded-xl"
              >
                <span className="text-sq-gradient">Register</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </header>
  );
}
