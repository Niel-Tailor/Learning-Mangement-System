import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../AuthContext";
import CourseCard from "../components/CourseCard";

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let ignore = false;

    apiRequest("/courses/")
      .then((data) => {
        if (!ignore) setCourses(data);
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

  const search = query.trim().toLowerCase();
  const filtered = courses.filter((course) =>
    `${course.title} ${course.description} ${course.teacher_name}`
      .toLowerCase()
      .includes(search),
  );

  const canCreate = user.role === "teacher" || user.role === "admin";

  return (
    <section>
      <div className="page-header">
        <h1>Courses</h1>
        {canCreate && (
          <Link to="/courses/new" className="btn">
            New course
          </Link>
        )}
      </div>

      <input
        type="search"
        className="search"
        placeholder="Search by title, description or teacher"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search courses"
      />

      {loading && <p className="muted">Loading courses...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="muted">
          {courses.length === 0 ? "No courses yet." : "No courses match your search."}
        </p>
      )}

      <div className="card-grid">
        {filtered.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}