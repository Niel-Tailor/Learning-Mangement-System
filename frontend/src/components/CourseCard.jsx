import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  const students = course.enrollment_count === 1 ? "student" : "students";

  return (
    <article className="card course-card">
      <h3>
        <Link to={`/courses/${course.id}`}>{course.title}</Link>
      </h3>

      <p className="muted">Taught by {course.teacher_name}</p>

      {course.description && <p className="course-card-description">{course.description}</p>}

      <p className="course-card-footer">
        <span className="muted">
          {course.enrollment_count} {students}
        </span>
        {course.is_enrolled && <span className="badge">Enrolled</span>}
      </p>
    </article>
  );
}
