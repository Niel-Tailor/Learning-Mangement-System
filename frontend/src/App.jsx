import { Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext";
import RequireAuth from "./components/RequireAuth";
import Layout from "./components/Layout";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

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
  console.log("Hello");
  return <h1>{title}</h1>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePlaceholder />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
        </Route>

        <Route element={<RequireAuth roles={["admin"]} />}>
          <Route path="/users" element={<Placeholder title="Users" />} />
        </Route>

        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Route>
    </Routes>
  );
}