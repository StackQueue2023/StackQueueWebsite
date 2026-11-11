import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Gamepad2,
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
  CreditCard
} from 'lucide-react';

export default function Sidebar() {
  const { user, isTutor, isAdmin } = useAuth();

  if (!user) {
    return null;
  }

  const studentLinks = [
    { to: '/student',                          label: 'Dashboard',       icon: LayoutDashboard },
    { to: '/student/payments',                 label: 'My Payments',     icon: CreditCard,       badge: 'Fees' },
    { to: '/projects',                         label: 'My Final Projects', icon: FolderGit2,     badge: 'Capstone' },
    { to: '/student/attendance',               label: 'Attendance',      icon: CalendarCheck2 },
    { to: '/student/leave',                    label: 'Leave',           icon: FileText },
    { to: '/student/announcements',           label: 'Announcements',   icon: Megaphone },
    { to: '/interview-game',                   label: 'Interview Arena', icon: Code2,     badge: 'Arena' },
    { to: '/interview-game/interview-mode',    label: 'Mock Interview',  icon: Timer,     badge: 'Timed' },
    { to: '/games',                            label: 'Game Hub',        icon: Gamepad2 },
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
    { to: '/admin/domain-management', label: 'Domain Catalog', icon: Layers, badge: 'All' },
    { to: '/admin/error-monitoring', label: 'Error Monitoring', icon: Activity, badge: 'Live' },
    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone, badge: 'Email' },
    { to: '/admin/lms', label: 'LMS Management', icon: GraduationCap, badge: 'Workflow' },
    { to: '/admin/live-monitor', label: 'Live Class Monitor', icon: Radio, badge: 'Live' },
    { to: '/admin/interview-questions', label: 'Interview Questions', icon: Code2, badge: 'Bank' },
    { to: '/admin/challenges', label: 'Challenge Manager', icon: PlusCircle, badge: 'CMS' },
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
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white/95 backdrop-blur-md border-r border-purple-100/90 flex flex-col justify-between p-4 shrink-0 hidden md:flex overflow-y-auto z-20">
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400 px-3 mb-2 font-mono">
            {isAdmin ? 'Institute Admin' : isTutor ? 'Tutor Portal' : 'Student Academy'}
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to + link.label}
                  to={link.to}
                  end={link.to === '/student' || link.to === '/tutor' || link.to === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50/60 text-purple-900 border border-purple-200/80 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-purple-600' : 'text-slate-500 group-hover:text-purple-600'}`} />
                        <span>{link.label}</span>
                      </div>
                      {link.badge && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold transition-colors ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-300'
                            : 'bg-purple-50 text-purple-700 border border-purple-200 group-hover:bg-purple-100'
                        }`}>
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
