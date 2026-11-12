import { Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext";
import RequireAuth from "./components/RequireAuth";
import Layout from "./components/Layout";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import CoursesPage from "./pages/CoursesPage";



// Temporary placeholders
function HomePlaceholder() {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  return (
    <h1>
      Home: {user ? `logged in as ${user.username} (${user.role})` : "not logged in"}
    </h1>
  );
}

function Placeholder({ title }) {
  return <h1>{title}</h1>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePlaceholder />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
        </Route>

        <Route element={<RequireAuth roles={["admin"]} />}>
          <Route path="/users" element={<Placeholder title="Users" />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}