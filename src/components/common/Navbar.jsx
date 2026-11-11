import React, { useState } from 'react';
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
  const navigate = useNavigate();

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
    // Visitor Links: Only visible on public site when not logged in
    navLinks = [
      { to: '/courses', label: 'Courses' },
      { to: '/internships', label: 'Internships' },
      { to: '/products', label: 'Products' },
    ];
  } else {
    // Logged-in Admin, Tutor, and Student have NO navbar links (they use dashboard and sidebar)
    navLinks = [];
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-purple-100/90 shadow-xs">
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
          {navLinks.map((link) => (
            <NavLink
              key={link.to + link.label}
              to={link.to}
              className={({ isActive }) =>
                `relative px-5 py-2 font-semibold transition-all duration-200 group/nav
                 ${isActive && !link.to.includes('#')
                   ? 'text-[#9333EA] font-bold'
                   : 'text-[#172033] hover:text-[#9333EA]'
                 }`
              }
              style={{ fontSize: '1rem' }}
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {/* Gradient underline */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] rounded-full bg-gradient-to-r from-[#9333EA] to-[#DB2777] transition-all duration-300
                      ${isActive && !link.to.includes('#')
                        ? 'w-full opacity-100'
                        : 'w-0 opacity-0 group-hover/nav:w-full group-hover/nav:opacity-100'
                      }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Side: Auth State or Gamification Metrics */}
        <div className="flex items-center space-x-3">
          {/* If Student: Experience Points */}
          {user && isStudent && (
            <div className="hidden sm:flex items-center space-x-2">
              <div
                className="flex items-center space-x-1 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg text-xs font-bold text-purple-700"
                title="Total Experience Points"
              >
                <Zap className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />
                <span>{xp} XP</span>
              </div>
            </div>
          )}

          {/* If User Logged In: Profile Pill */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-purple-100">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-[#172033] leading-tight truncate max-w-[110px]">
                  {user.name || user.username}
                </p>
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded inline-block ${
                  isAdmin ? 'bg-purple-100 text-purple-800' : isTutor ? 'bg-fuchsia-100 text-fuchsia-800' : 'bg-pink-100 text-pink-800'
                }`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-purple-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* If Visitor: Login & Register Buttons */
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 font-bold text-[#111827] hover:text-[#E02B91] hover:bg-slate-50 rounded-xl transition"
                style={{ fontSize: '1rem' }}
              >
                Login
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger (Only for unauthenticated visitors with navLinks) */}
          {navLinks.length > 0 && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-[#111827] hover:text-[#E02B91] rounded-lg hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && navLinks.length > 0 && (
        <div className="xl:hidden border-t border-[#E5E7EB] bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to + link.label}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2 rounded-xl text-sm font-semibold text-[#111827] hover:bg-pink-50/50 hover:text-[#E02B91]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {!user && (
            <div className="pt-3 border-t border-[#E5E7EB] flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold text-[#111827] bg-slate-100 rounded-xl"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold text-white bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] rounded-xl"
              >
                Register
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
