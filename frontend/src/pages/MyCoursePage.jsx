import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let ignore = false;

    apiRequest("/enrollments/")
      .then((data) => {
        if (!ignore) setEnrollments(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function toggleComplete(enrollment) {
    setSavingId(enrollment.id);
    setError("");
    try {
      const updated = await apiRequest(`/enrollments/${enrollment.id}/`, {
        method: "PATCH",
        body: { completed: !enrollment.completed },
      });
      setEnrollments((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  const completedCount = enrollments.filter((item) => item.completed).length;
  const percent = enrollments.length
    ? Math.round((completedCount / enrollments.length) * 100)
    : 0;

  if (loading) return <p className="muted">Loading your courses...</p>;

  return (
    <section>
      <h1>My courses</h1>

      {error && <p className="error">{error}</p>}

      {enrollments.length === 0 ? (
        <p className="muted">
          You're not enrolled in any courses yet. <Link to="/courses">Browse courses</Link>
        </p>
      ) : (
        <>
          <div className="card progress-summary">
            <p>
              <strong>
                {completedCount} of {enrollments.length}
              </strong>{" "}
              courses completed ({percent}%)
            </p>
            <progress value={completedCount} max={enrollments.length} aria-label="Courses completed" />
          </div>

          <ul className="enrollment-list">
            {enrollments.map((enrollment) => (
              <li key={enrollment.id} className="card enrollment">
                <div>
                  <h3>
                    <Link to={`/courses/${enrollment.course.id}`}>{enrollment.course.title}</Link>
                  </h3>
                  <p className="muted">
                    Taught by {enrollment.course.teacher_name} &middot; enrolled{" "}
                    {new Date(enrollment.enrolled_at).toLocaleDateString("en-GB")}
                  </p>
                </div>

                <div className="enrollment-status">
                  {enrollment.completed && <span className="badge">Completed</span>}
                  <button
                    type="button"
                    className={enrollment.completed ? "btn btn-secondary" : "btn"}
                    disabled={savingId === enrollment.id}
                    onClick={() => toggleComplete(enrollment)}
                  >
                    {enrollment.completed ? "Mark not complete" : "Mark complete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}