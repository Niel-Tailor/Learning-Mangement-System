import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Layout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <>
      <header className="navbar">
        <nav className="navbar-inner">
          <NavLink to="/" className="navbar-brand">
            LMS
          </NavLink>

          {!loading && user && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/courses" end>
                Courses
              </NavLink>
              {user.role === "student" && <NavLink to="/my-courses">My courses</NavLink>}
              {(user.role === "teacher" || user.role === "admin") && (
                <NavLink to="/courses/new">New course</NavLink>
              )}
              {user.role === "admin" && <NavLink to="/users">Users</NavLink>}
              <span className="muted">
                {user.username} ({user.role})
              </span>
              <button type="button" className="btn btn-secondary" onClick={handleLogout}>
                Log out
              </button>
            </>
          )}

          {!loading && !user && (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register" className="btn">
                Register
              </NavLink>
            </>
          )}
        </nav>
      </header>

      <main className="container">
        <Outlet />
      </main>
    </>
  );
}