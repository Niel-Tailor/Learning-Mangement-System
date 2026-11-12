import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <p className="muted">Sorry, there's nothing at this address.</p>
      <Link to="/" className="btn">
        Back to home
      </Link>
    </section>
  );
}