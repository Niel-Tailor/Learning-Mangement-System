import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../AuthContext";

const ROLES = ["student", "teacher", "admin"];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let ignore = false;

    apiRequest("/users/")
      .then((data) => {
        if (!ignore) setUsers(data);
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

  async function changeRole(user, role) {
    setSavingId(user.id);
    setError("");
    try {
      const updated = await apiRequest(`/users/${user.id}/`, {
        method: "PATCH",
        body: { role },
      });
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  async function deleteUser(user) {
    const warning =
      user.role === "teacher" ? " Their courses and those courses' enrollments will be deleted too." : "";
    if (!window.confirm(`Delete ${user.username}?${warning} This can't be undone.`)) return;

    setSavingId(user.id);
    setError("");
    try {
      await apiRequest(`/users/${user.id}/`, { method: "DELETE" });
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  const visibleUsers =
    roleFilter === "all" ? users : users.filter((user) => user.role === roleFilter);

  if (loading) return <p className="muted">Loading users...</p>;

  return (
    <section>
      <div className="page-header">
        <h1>Users</h1>
        <label className="inline-label">
          Show
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="all">All roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role[0].toUpperCase() + role.slice(1)}s
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((user) => {
              const isMe = user.id === currentUser.id;
              return (
                <tr key={user.id}>
                  <td>
                    {user.username}
                    {isMe && <span className="muted"> (you)</span>}
                  </td>
                  <td>{`${user.first_name} ${user.last_name}`.trim() || "—"}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      disabled={isMe || savingId === user.id}
                      onChange={(event) => changeRole(user, event.target.value)}
                      aria-label={`Role for ${user.username}`}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {!isMe && (
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        disabled={savingId === user.id}
                        onClick={() => deleteUser(user)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {visibleUsers.length === 0 && <p className="muted">No users with this role.</p>}
    </section>
  );
}
