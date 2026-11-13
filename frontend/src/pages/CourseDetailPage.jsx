import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../AuthContext";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadCourse = useCallback(async () => {
    try {
      setCourse(await apiRequest(`/courses/${id}/`));
      setError("");
    } catch (err) {
      setError(err.status === 404 ? "This course doesn't exist." : err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  async function runAction(action, successMessage) {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await apiRequest(`/courses/${id}/${action}/`, { method: "POST" });
      setMessage(successMessage);
      await loadCourse(); // refresh is_enrolled and the enrolled count
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${course.title}"? This can't be undone.`)) return;
    setBusy(true);
    try {
      await apiRequest(`/courses/${id}/`, { method: "DELETE" });
      navigate("/courses", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (loading) return <p className="muted">Loading course...</p>;

  if (!course) {
    return (
      <section>
        <p className="error">{error}</p>
        <Link to="/courses">Back to courses</Link>
      </section>
    );
  }

  const isStudent = user.role === "student";
  const canEdit = user.role === "admin" || course.teacher === user.id;

  return (
    <section>
      <p>
        <Link to="/courses">&larr; All courses</Link>
      </p>

      <h1>{course.title}</h1>
      <p className="muted">
        Taught by {course.teacher_name} &middot; {course.enrollment_count} enrolled
      </p>

      {course.is_enrolled && (
        <p>
          <span className="badge">You're enrolled</span>
        </p>
      )}

      <p className="course-description">{course.description}</p>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="actions">
        {isStudent &&
          (course.is_enrolled ? (
            <button
              type="button"
              className="btn btn-secondary"
              disabled={busy}
              onClick={() => runAction("unenroll", "You've left this course.")}
            >
              Unenrol
            </button>
          ) : (
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={() => runAction("enroll", "You're now enrolled!")}
            >
              Enrol
            </button>
          ))}

        {canEdit && (
          <>
            <Link to={`/courses/${id}/edit`} className="btn btn-secondary">
              Edit
            </Link>
            <button type="button" className="btn btn-danger" disabled={busy} onClick={handleDelete}>
              Delete
            </button>
          </>
        )}
      </div>
    </section>
  );
}