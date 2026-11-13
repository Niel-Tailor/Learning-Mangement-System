import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import CourseDetailPage from './pages/CourseDetailPage';
import CourseFormPage from './pages/CourseFormPage';
import CoursesPage from './pages/CoursesPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MyCoursesPage from './pages/MyCoursesPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Any logged-in user */}
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/courses" element={<RequireAuth><CoursesPage /></RequireAuth>} />
        <Route path="/courses/:id" element={<RequireAuth><CourseDetailPage /></RequireAuth>} />

        {/* Teachers and admins */}
        <Route path="/courses/new" element={<RequireAuth roles={['teacher', 'admin']}><CourseFormPage /></RequireAuth>} />
        <Route path="/courses/:id/edit" element={<RequireAuth roles={['teacher', 'admin']}><CourseFormPage /></RequireAuth>} />

        {/* Students only */}
        <Route path="/my-courses" element={<RequireAuth roles={['student']}><MyCoursesPage /></RequireAuth>} />

        {/* Admins only */}
        <Route path="/users" element={<RequireAuth roles={['admin']}><UsersPage /></RequireAuth>} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
