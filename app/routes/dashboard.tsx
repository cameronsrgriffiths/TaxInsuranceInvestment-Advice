import { Link } from "react-router";

export function meta() {
  return [{ title: "Your tools" }];
}

export default function Dashboard() {
  return (
    <>
      <h1>Your tools</h1>
      <p className="muted">Everything here is private to your account.</p>
      <div className="grid">
        <Link className="card" to="/app/notes">
          <h3>📝 Notes</h3>
          <p className="muted">Create and manage notes.</p>
        </Link>
        <Link className="card" to="/app/chat">
          <h3>🤖 AI chat</h3>
          <p className="muted">Ask Claude anything.</p>
        </Link>
      </div>
    </>
  );
}
