import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';

// Public Pages
import HomePage from '../pages/public/HomePage';
import CoursesPage from '../pages/public/CoursesPage';
import InternshipsPage from '../pages/public/InternshipsPage';
import ProductsPage from '../pages/public/ProductsPage';
import AboutUsPage from '../pages/public/AboutUsPage';
import ContactUsPage from '../pages/public/ContactUsPage';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage';
import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import UnauthorizedPage from '../pages/public/UnauthorizedPage';
import ServerErrorPage from '../pages/public/ServerErrorPage';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import CourseDetailsPage from '../pages/student/CourseDetailsPage';
import GameHubPage from '../pages/student/GameHubPage';
import GameDetailPage from '../pages/student/GameDetailPage';
import DailyChallengePage from '../pages/student/DailyChallengePage';
import LearningPathPage from '../pages/student/LearningPathPage';
import LeaderboardPage from '../pages/student/LeaderboardPage';
import AchievementsPage from '../pages/student/AchievementsPage';
import ProgressPage from '../pages/student/ProgressPage';
import ProjectsPage from '../pages/student/ProjectsPage';
import AttendancePage from '../pages/student/AttendancePage';
import StudentLeavePage from '../pages/student/StudentLeavePage';
import StudentAnnouncementsPage from '../pages/student/StudentAnnouncementsPage';
import StudentPaymentsPage from '../pages/student/StudentPaymentsPage';

// Tutor / Trainer Pages
import TrainerDashboard from '../pages/trainer/TrainerDashboard';
import AssignedStudentsPage from '../pages/trainer/AssignedStudentsPage';
import DailyReportSubmitPage from '../pages/trainer/DailyReportSubmitPage';
import TutorAttendancePage from '../pages/trainer/TutorAttendancePage';
import TutorAnnouncementsPage from '../pages/trainer/TutorAnnouncementsPage';
import TutorLearningProgressPage from '../pages/trainer/TutorLearningProgressPage';
import TutorPaymentFollowupPage from '../pages/trainer/TutorPaymentFollowupPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminCommandCenterPage from '../pages/admin/AdminCommandCenterPage';
import AdminCourseManagementPage from '../pages/admin/AdminCourseManagementPage';
import AdminInternshipManagementPage from '../pages/admin/AdminInternshipManagementPage';
import AdminProjectManagementPage from '../pages/admin/AdminProjectManagementPage';
import AdminAnalyticsDashboard from '../pages/admin/analytics/AdminAnalyticsDashboard';
import StudentFeeManagementAnalyticsPage from '../pages/admin/analytics/StudentFeeManagementAnalyticsPage';
import CourseAnalyticsPage from '../pages/admin/analytics/CourseAnalyticsPage';
import InternshipAnalyticsPage from '../pages/admin/analytics/InternshipAnalyticsPage';
import ProductsAnalyticsPage from '../pages/admin/analytics/ProductsAnalyticsPage';
import CollegeTrainingAnalyticsPage from '../pages/admin/analytics/CollegeTrainingAnalyticsPage';
import CollegeProjectsAnalyticsPage from '../pages/admin/analytics/CollegeProjectsAnalyticsPage';
import ChallengeManagerPage from '../pages/admin/ChallengeManagerPage';
import BatchAndCollegePage from '../pages/admin/BatchAndCollegePage';
import BadgeXPConfigPage from '../pages/admin/BadgeXPConfigPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import AdminLiveMonitorPage from '../pages/admin/AdminLiveMonitorPage';
import AdminQuestionManagerPage from '../pages/admin/AdminQuestionManagerPage';
import AdminInquiriesPage from '../pages/admin/AdminInquiriesPage';
import AdminLmsManagementPage from '../pages/admin/AdminLmsManagementPage';
import AdminDomainManagementPage from '../pages/admin/AdminDomainManagementPage';
import TutorManagementPage from '../pages/admin/TutorManagementPage';
import AdminAnnouncementPage from '../pages/admin/AdminAnnouncementPage';
import AdminOffersPage from '../pages/admin/AdminOffersPage';
import AdminErrorMonitoringPage from '../pages/admin/AdminErrorMonitoringPage';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Interview & Game Pages
import ProgrammingGamesPage from '../pages/interview-game/ProgrammingGamesPage';
import QuestionWorkspacePage from '../pages/interview-game/QuestionWorkspacePage';
import InterviewModePage from '../pages/interview-game/InterviewModePage';
import InterviewProgressPage from '../pages/interview-game/InterviewProgressPage';

// Sandboxes
import ChallengeEngine from '../engine/ChallengeEngine';

// Auth Layout (Navbar only — NO Footer)
function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FC] text-[#172033]">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}

// Public Layout (Navbar + Page + Footer)
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FC] text-[#172033]">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

// App Layout (Navbar + Fixed Sidebar + Content)
function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const isLmsPage = location.pathname.startsWith('/admin/lms');

  return (
    <div className={`min-h-screen flex flex-col bg-[#F8F7FC] text-[#172033] ${isLmsPage ? 'h-screen max-h-screen overflow-hidden' : ''}`}>
      <Navbar />
      {/* Sidebar is fixed, only render when authenticated */}
      {user && <Sidebar />}
      {/* Main content: offset by sidebar width on md+ only when sidebar is present */}
      <main className={`flex-1 ${user ? 'md:ml-64' : ''} ${isLmsPage ? 'min-h-0 overflow-y-auto p-3 md:p-5' : 'overflow-y-auto p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)]'} bg-[#F8F7FC] text-[#172033]`}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}

// Challenge Layout (Fullscreen sandbox with light theme container)
function SandboxLayout() {
  return (
    <div className="h-screen max-h-screen flex flex-col bg-[#F8F7FC] text-[#172033] overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    </div>
  );
}

// Public Only Route Guard — Guest Only (Homepage, Login, Register, Forgot Password)
function PublicOnlyRoute() {
  const { user, loading, getRoleDashboard } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs font-semibold">
        Authenticating session...
      </div>
    );
  }

  if (user) {
    return <Navigate to={getRoleDashboard(user.role)} replace />;
  }

  return <Outlet />;
}

// Role Protected Route Guard
function RoleProtectedRoute({ allowedRoles }) {
  const { user, loading, getRoleDashboard } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs font-semibold">
        Authenticating role permissions...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const effectiveRole = user.role === 'trainer' ? 'tutor' : user.role;
  const isAuthorized = allowedRoles.includes(effectiveRole) || (allowedRoles.includes('tutor') && user.role === 'trainer');

  if (!isAuthorized) {
    return <Navigate to={getRoleDashboard(user.role)} replace />;
  }

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Guest-Only Homepage & Auth Pages */}
      <Route element={<PublicOnlyRoute />}>
        {/* Main Website Homepage for Logged-Out Visitors */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Login & Forgot Password Pages */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
      </Route>

      {/* Public Pages with Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/internships" element={<InternshipsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/server-error" element={<ServerErrorPage />} />
        <Route path="/404" element={<NotFoundPage />} />
      </Route>

      {/* Fullscreen Sandbox Challenge Engine & Mock Interview Workspace */}
      <Route element={<SandboxLayout />}>
        <Route path="/challenges/:id" element={<ChallengeEngine />} />
        <Route path="/interview-game/question/:id" element={<QuestionWorkspacePage />} />
        <Route path="/interview-game/interview-mode" element={<InterviewModePage />} />
      </Route>

      {/* Authenticated / App Layout Pages */}
      <Route element={<AppLayout />}>
        {/* Games & Practice Arena (Accessible to visitors & authenticated users) */}
        <Route path="/games" element={<GameHubPage />} />
        <Route path="/games/:slug" element={<GameDetailPage />} />
        <Route path="/interview-game" element={<ProgrammingGamesPage />} />
        <Route path="/interview-game/progress" element={<InterviewProgressPage />} />

        {/* Shared Authenticated Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['student', 'tutor', 'trainer', 'admin']} />}>
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Route>

        {/* Student-Only Protected Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/course" element={<CourseDetailsPage />} />
          <Route path="/student/domain" element={<Navigate to="/student/course" replace />} />
          <Route path="/daily-challenge" element={<DailyChallengePage />} />
          <Route path="/learning-path" element={<LearningPathPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/student/attendance" element={<AttendancePage />} />
          <Route path="/student/leave" element={<StudentLeavePage />} />
          <Route path="/student/announcements" element={<StudentAnnouncementsPage />} />
          <Route path="/student/payments" element={<StudentPaymentsPage />} />
        </Route>

        {/* Tutor / Trainer Protected Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['tutor', 'trainer']} />}>
          <Route path="/tutor" element={<TrainerDashboard />} />
          <Route path="/tutor/dashboard" element={<TrainerDashboard />} />
          <Route path="/trainer" element={<TrainerDashboard />} />
          <Route path="/trainer/students" element={<AssignedStudentsPage />} />
          <Route path="/trainer/daily-report" element={<DailyReportSubmitPage />} />
          <Route path="/trainer/learning-progress" element={<TutorLearningProgressPage />} />
          <Route path="/trainer/attendance" element={<TutorAttendancePage />} />
          <Route path="/attendance" element={<TutorAttendancePage />} />
          <Route path="/trainer/announcements" element={<TutorAnnouncementsPage />} />
          <Route path="/trainer/payments" element={<TutorPaymentFollowupPage />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminCommandCenterPage />} />
          <Route path="/admin/dashboard" element={<AdminCommandCenterPage />} />
          <Route path="/admin/command-center" element={<AdminCommandCenterPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsDashboard />} />
          <Route path="/admin/analytics/fees" element={<StudentFeeManagementAnalyticsPage />} />
          <Route path="/admin/fee-management" element={<Navigate to="/admin/analytics/fees" replace />} />
          <Route path="/admin/analytics/courses" element={<CourseAnalyticsPage />} />
          <Route path="/admin/analytics/internships" element={<InternshipAnalyticsPage />} />
          <Route path="/admin/analytics/products" element={<ProductsAnalyticsPage />} />
          <Route path="/admin/analytics/college-training" element={<CollegeTrainingAnalyticsPage />} />
          <Route path="/admin/analytics/college-projects" element={<CollegeProjectsAnalyticsPage />} />
          <Route path="/admin/courses" element={<AdminCourseManagementPage />} />
          <Route path="/admin/internships" element={<AdminInternshipManagementPage />} />
          <Route path="/admin/projects" element={<AdminProjectManagementPage />} />
          <Route path="/admin/announcements" element={<AdminAnnouncementPage />} />
          <Route path="/admin/live-monitor" element={<AdminLiveMonitorPage />} />
          <Route path="/admin/interview-questions" element={<AdminQuestionManagerPage />} />
          <Route path="/admin/challenges" element={<ChallengeManagerPage />} />
          <Route path="/admin/batches" element={<BatchAndCollegePage />} />
          <Route path="/admin/offers" element={<AdminOffersPage />} />
          <Route path="/admin/tutors" element={<TutorManagementPage />} />
          <Route path="/admin/badges" element={<BadgeXPConfigPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
          <Route path="/admin/lms" element={<AdminLmsManagementPage />} />
          <Route path="/admin/syllabus" element={<Navigate to="/admin/domain-management" replace />} />
          <Route path="/admin/domain-management" element={<AdminDomainManagementPage />} />
          <Route path="/admin/error-monitoring" element={<AdminErrorMonitoringPage />} />
        </Route>
      </Route>

      {/* Root Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
