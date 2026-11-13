import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../AuthContext";

export default function CourseFormPage() {
  const { id } = useParams(); // only set on /courses/:id/edit
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [notAllowed, setNotAllowed] = useState(false);
  const [saving, setSaving] = useState(false);

  // In edit mode, load the course and fill in the form.
  useEffect(() => {
    if (!isEdit) return;
    let ignore = false;

    apiRequest(`/courses/${id}/`)
      .then((course) => {
        if (ignore) return;
        if (user.role !== "admin" && course.teacher !== user.id) {
          setNotAllowed(true);
        }
        setForm({ title: course.title, description: course.description });
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.status === 404 ? "This course doesn't exist." : err.message);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id, isEdit, user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const saved = await apiRequest(isEdit ? `/courses/${id}/` : "/courses/", {
        method: isEdit ? "PATCH" : "POST",
        body: form,
      });
      navigate(`/courses/${saved.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Loading course...</p>;

  if (notAllowed) {
    return (
      <section>
        <p className="error">You can only edit your own courses.</p>
        <Link to={`/courses/${id}`}>Back to the course</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>{isEdit ? "Edit course" : "New course"}</h1>

      <form className="form form-wide" onSubmit={handleSubmit}>
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} maxLength={200} required />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="actions">
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create course"}
          </button>
          <Link to={isEdit ? `/courses/${id}` : "/courses"} className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}