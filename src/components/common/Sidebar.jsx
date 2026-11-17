import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { detectRouteCategory, getCategoryTheme } from '../../theme/categoryTheme';
import {
  LayoutDashboard,
  Calendar,
  FolderGit2,
  Trophy,
  Award,
  BarChart3,
  CalendarCheck2,
  Users,
  UserCheck,
  PlusCircle,
  ShieldAlert,
  GraduationCap,
  Radio,
  Code2,
  Layers,
  Timer,
  Megaphone,
  FileText,
  Tag,
  Activity,
  CreditCard,
  Briefcase
} from 'lucide-react';

export default function Sidebar() {
  const { user, isTutor, isAdmin } = useAuth();

  if (!user) {
    return null;
  }

  const isTempTrainingStudent =
    user?.studentCategory === 'TRAINING_TEMPORARY' || user?.studentType === 'TRAINING_TEMPORARY';

  const studentLinks = isTempTrainingStudent
    ? [
        { to: '/student/training', label: 'Training Dashboard', icon: GraduationCap, badge: 'Training' },
        { to: '/student/attendance', label: 'Attendance', icon: CalendarCheck2 },
        { to: '/student/announcements', label: 'Announcements', icon: Megaphone },
      ]
    : [
        { to: '/student',                          label: 'Dashboard',       icon: LayoutDashboard },
        { to: '/student/internship',               label: 'Internship Portal', icon: Briefcase,     badge: '15-Day' },
        { to: '/student/payments',                 label: 'My Payments',     icon: CreditCard,       badge: 'Fees' },
        { to: '/projects',                         label: 'My Final Projects', icon: FolderGit2,     badge: 'Capstone' },
        { to: '/student/attendance',               label: 'Attendance',      icon: CalendarCheck2 },
        { to: '/student/leave',                    label: 'Leave',           icon: FileText },
        { to: '/student/announcements',           label: 'Announcements',   icon: Megaphone },
        { to: '/interview-game',                   label: 'Interview Arena', icon: Code2,     badge: 'Arena' },
        { to: '/interview-game/interview-mode',    label: 'Mock Interview',  icon: Timer,     badge: 'Timed' },
        { to: '/daily-challenge',                  label: 'Daily Challenge', icon: Calendar,     badge: '+XP' },
        { to: '/leaderboard',                      label: 'Leaderboard',     icon: Trophy },
        { to: '/progress',                         label: 'My Progress',     icon: BarChart3 },
      ];

  const tutorLinks = [
    { to: '/tutor', label: 'Tutor Studio', icon: LayoutDashboard },
    { to: '/trainer/payments', label: 'Payment Follow-Ups', icon: CreditCard, badge: 'Pending' },
    { to: '/trainer/attendance', label: 'Attendance & Leaves', icon: CalendarCheck2, badge: 'Leaves' },
    { to: '/trainer/students', label: 'Assigned Students', icon: Users },
    { to: '/trainer/learning-progress', label: 'Learning & Progress', icon: GraduationCap },
    { to: '/projects', label: 'Review Projects', icon: FolderGit2 },
    { to: '/trainer/daily-report', label: 'College Training', icon: GraduationCap },
    { to: '/trainer/announcements', label: 'Announcements', icon: Megaphone }
  ];

  const adminLinks = [
    { to: '/admin/command-center', label: 'Dashboard', icon: ShieldAlert },
    { to: '/admin/analytics', label: 'Analytics Hub', icon: BarChart3, badge: 'Students' },
    { to: '/admin/internship-payments', label: 'Internship Payments', icon: CreditCard, badge: 'Bar' },
    { to: '/admin/domain-management', label: 'Domain Catalog', icon: Layers, badge: 'All' },
    { to: '/admin/error-monitoring', label: 'Error Monitoring', icon: Activity, badge: 'Live' },
    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone, badge: 'Email' },
    { to: '/admin/lms', label: 'LMS Management', icon: GraduationCap, badge: 'Workflow' },
    { to: '/admin/live-monitor', label: 'Live Class Monitor', icon: Radio, badge: 'Live' },
    { to: '/admin/interview-questions', label: 'Interview Questions', icon: Code2, badge: 'Bank' },
    { to: '/admin/batches', label: 'Batches & Colleges', icon: GraduationCap },
    { to: '/admin/offers', label: 'Offers', icon: Tag, badge: 'Offers' },
    { to: '/admin/tutors', label: 'Tutor Management', icon: UserCheck, badge: 'Resume' },
    { to: '/admin/badges', label: 'Badges & XP Rules', icon: Award },
    { to: '/admin/users', label: 'User Management', icon: Users }
  ];

  let links = studentLinks;
  if (isTutor) links = tutorLinks;
  if (isAdmin) links = adminLinks;

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 hidden md:flex overflow-y-auto z-20">
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-sq-gradient px-3 mb-2 font-mono">
            {isAdmin ? 'Institute Admin' : isTutor ? 'Tutor Portal' : 'Student Academy'}
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const cat = detectRouteCategory(link.to);
              const theme = getCategoryTheme(cat);
              return (
                <NavLink
                  key={link.to + link.label}
                  to={link.to}
                  end={link.to === '/student' || link.to === '/tutor' || link.to === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group bg-white border ${
                      isActive
                        ? `${theme.activeNav} shadow-xs`
                        : 'border-transparent text-slate-600 hover:border-slate-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 transition-colors ${
                          isActive
                            ? (cat === 'gradient' ? 'text-white' : theme.icon)
                            : cat === 'course'
                              ? 'text-blue-600'
                              : cat === 'internship'
                                ? 'text-emerald-600'
                                : cat === 'project'
                                  ? 'text-pink-600'
                                  : 'text-[#9333EA]'
                        }`} />
                        <span className={isActive ? (cat === 'gradient' ? 'text-white font-bold' : theme.text) : ''}>{link.label}</span>
                      </div>
                      {link.badge && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold transition-colors ${isActive && cat === 'gradient' ? 'bg-white/20 text-white border border-white/30' : theme.badge}`}>
                          {link.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

    </aside>
  );
}
