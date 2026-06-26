import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts & Guards
import ProtectedRoute from './components/guards/ProtectedRoute';
import RoleGuard from './components/guards/RoleGuard';
import AdminLayout from './components/layouts/AdminLayout';
import TeacherLayout from './components/layouts/TeacherLayout';

// Features
import LoginPage from './features/auth/pages/LoginPage';
import AdminDashboard from './features/dashboard/pages/AdminDashboard';
import TeacherDashboard from './features/dashboard/pages/TeacherDashboard';
import StudentListPage from './features/students/pages/StudentListPage';
import StudentFormPage from './features/students/pages/StudentFormPage';
import StudentProfilePage from './features/students/pages/StudentProfilePage';
import TeacherListPage from './features/teachers/pages/TeacherListPage';
import TeacherFormPage from './features/teachers/pages/TeacherFormPage';
import MarkAttendancePage from './features/attendance/pages/MarkAttendancePage';
import AdminAttendancePage from './features/attendance/pages/AdminAttendancePage';
import FeeOverviewPage from './features/fees/pages/FeeOverviewPage';
import EventListPage from './features/events/pages/EventListPage';
import EventFormPage from './features/events/pages/EventFormPage';
import EventGalleryPage from './features/events/pages/EventGalleryPage';
import NotificationCenterPage from './features/notifications/pages/NotificationCenterPage';
import SettingsPage from './features/settings/pages/SettingsPage';
import UploadMarksPage from './features/marks/pages/UploadMarksPage';

// Create React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin']}>
                  <AdminLayout />
                </RoleGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentListPage />} />
            <Route path="students/new" element={<StudentFormPage />} />
            <Route path="students/edit/:id" element={<StudentFormPage />} />
            <Route path="students/:id" element={<StudentProfilePage />} />
            <Route path="teachers" element={<TeacherListPage />} />
            <Route path="teachers/new" element={<TeacherFormPage />} />
            <Route path="teachers/edit/:id" element={<TeacherFormPage />} />
            <Route path="attendance" element={<AdminAttendancePage />} />
            <Route path="attendance/mark" element={<MarkAttendancePage />} />
            <Route path="fees" element={<FeeOverviewPage />} />
            <Route path="events" element={<EventListPage />} />
            <Route path="events/new" element={<EventFormPage />} />
            <Route path="events/edit/:id" element={<EventFormPage />} />
            <Route path="events/gallery" element={<EventGalleryPage />} />
            <Route path="notifications" element={<NotificationCenterPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Protected Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['teacher']}>
                  <TeacherLayout />
                </RoleGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="attendance" element={<MarkAttendancePage />} />
            <Route path="marks" element={<UploadMarksPage />} />
          </Route>


          {/* Fallbacks */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
