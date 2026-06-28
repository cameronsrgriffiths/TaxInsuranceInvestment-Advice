import { Form, Link, Outlet } from "react-router";
import type { Route } from "./+types/app-layout";
import { requireUser } from "~/lib/session.server";

// This loader runs for every route nested under the layout, so auth is enforced
// in one place for all the login-gated tools.
export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context.cloudflare.env, request);
  return { user };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <>
      <nav className="nav">
        <Link to="/app">
          <strong style={{ color: "var(--text)" }}>insurance</strong>
        </Link>
        <Link to="/app/notes">Notes</Link>
        <Link to="/app/chat">AI chat</Link>
        <span className="spacer" />
        <span className="muted">{user.email}</span>
        <Form method="post" action="/logout">
          <button className="secondary" type="submit">
            Log out
          </button>
        </Form>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
