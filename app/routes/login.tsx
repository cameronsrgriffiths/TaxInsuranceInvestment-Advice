import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/login";
import { verifyLogin } from "~/lib/auth.server";
import { createSession, getUser } from "~/lib/session.server";

export function meta() {
  return [{ title: "Log in" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  if (await getUser(context.cloudflare.env, request)) throw redirect("/app");
  return null;
}

export async function action({ request, context }: Route.ActionArgs) {
  const env = context.cloudflare.env;
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");

  const user = await verifyLogin(env, email, password);
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const cookie = await createSession(env, user.id);
  return redirect("/app", { headers: { "Set-Cookie": cookie } });
}

export default function Login({ actionData }: Route.ComponentProps) {
  return (
    <main className="container" style={{ maxWidth: 420 }}>
      <h1>Log in</h1>
      <Form method="post">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {actionData?.error && <p className="error">{actionData.error}</p>}
        <div style={{ marginTop: "1rem" }}>
          <button type="submit">Log in</button>
        </div>
      </Form>
      <p className="muted" style={{ marginTop: "1rem" }}>
        Need an account? <Link to="/signup">Sign up</Link>
      </p>
    </main>
  );
}
