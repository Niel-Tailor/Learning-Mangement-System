import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <section>
      <h1>Learning Management System</h1>
      <p className="muted">
        Browse courses, enrol in the ones you like, and track your progress.
        Teachers can create and manage their own courses.
      </p>

      {user ? (
        <>
          <p>Welcome back, {user.first_name || user.username}.</p>
          <p>
            <Link to="/dashboard" className="btn">
              Go to your dashboard
            </Link>{" "}
            <Link to="/courses" className="btn btn-secondary">
              Browse courses
            </Link>
          </p>
        </>
      ) : (
        <p>
          <Link to="/register" className="btn">
            Get started
          </Link>{" "}
          <Link to="/login" className="btn btn-secondary">
            Log in
          </Link>
        </p>
      )}
    </section>
  );
}