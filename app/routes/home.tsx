import { Link } from "react-router";
import type { Route } from "./+types/home";
import { getUser } from "~/lib/session.server";

export function meta() {
  return [
    { title: "Insurance — personal tools" },
    { name: "description", content: "A private workspace for notes, AI, and internal tools." },
  ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await getUser(context.cloudflare.env, request);
  return { user };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <>
      <nav className="nav">
        <strong>insurance</strong>
        <span className="spacer" />
        {user ? (
          <Link to="/app">Open app →</Link>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link className="btn" to="/signup">
              Sign up
            </Link>
          </>
        )}
      </nav>

      <main className="container">
        <section className="hero">
          <h1>Your private workspace</h1>
          <p>
            A fast, self-hosted home for notes, an AI assistant, and internal
            tools — some public, some behind a login. Built on React Router and
            Cloudflare.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link className="btn" to={user ? "/app" : "/signup"}>
              {user ? "Go to your tools" : "Get started"}
            </Link>
          </div>
        </section>

        <div className="grid">
          <div className="card">
            <h3>📝 Notes</h3>
            <p className="muted">Jot things down. Stored in your own database.</p>
          </div>
          <div className="card">
            <h3>🤖 AI chat</h3>
            <p className="muted">Talk to Claude. Your API key stays server-side.</p>
          </div>
          <div className="card">
            <h3>🔒 Private tools</h3>
            <p className="muted">Login-gated pages for whatever you build next.</p>
          </div>
        </div>
      </main>
    </>
  );
}
