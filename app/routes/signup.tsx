import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/signup";
import { createUser } from "~/lib/auth.server";
import { createSession, getUser } from "~/lib/session.server";

export function meta() {
  return [{ title: "Sign up" }];
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

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  try {
    const user = await createUser(env, email, password);
    const cookie = await createSession(env, user.id);
    return redirect("/app", { headers: { "Set-Cookie": cookie } });
  } catch (err) {
    // UNIQUE constraint on email.
    if (err instanceof Error && /UNIQUE/i.test(err.message)) {
      return { error: "An account with that email already exists." };
    }
    throw err;
  }
}

export default function Signup({ actionData }: Route.ComponentProps) {
  return (
    <main className="container" style={{ maxWidth: 420 }}>
      <h1>Create your account</h1>
      <Form method="post">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        {actionData?.error && <p className="error">{actionData.error}</p>}
        <div style={{ marginTop: "1rem" }}>
          <button type="submit">Sign up</button>
        </div>
      </Form>
      <p className="muted" style={{ marginTop: "1rem" }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}
