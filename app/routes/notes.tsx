import { Form } from "react-router";
import type { Route } from "./+types/notes";
import { requireUser } from "~/lib/session.server";

type Note = {
  id: string;
  title: string;
  body: string;
  updated_at: number;
};

export function meta() {
  return [{ title: "Notes" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const user = await requireUser(env, request);
  const { results } = await env.DB.prepare(
    "SELECT id, title, body, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
  )
    .bind(user.id)
    .all<Note>();
  return { notes: results ?? [] };
}

export async function action({ request, context }: Route.ActionArgs) {
  const env = context.cloudflare.env;
  const user = await requireUser(env, request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "create") {
    const title = String(form.get("title") ?? "").trim();
    const body = String(form.get("body") ?? "").trim();
    if (!title) return { error: "Title is required." };
    const now = Date.now();
    await env.DB.prepare(
      "INSERT INTO notes (id, user_id, title, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(crypto.randomUUID(), user.id, title, body, now, now)
      .run();
    return { ok: true };
  }

  if (intent === "delete") {
    const id = String(form.get("id") ?? "");
    // Scope the delete to the owner so users can't delete others' notes.
    await env.DB.prepare("DELETE FROM notes WHERE id = ? AND user_id = ?")
      .bind(id, user.id)
      .run();
    return { ok: true };
  }

  return { error: "Unknown action." };
}

export default function Notes({ loaderData, actionData }: Route.ComponentProps) {
  const { notes } = loaderData;
  return (
    <>
      <h1>Notes</h1>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <Form method="post">
          <input type="hidden" name="intent" value="create" />
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required />
          <label htmlFor="body">Body</label>
          <textarea id="body" name="body" rows={3} />
          {actionData?.error && <p className="error">{actionData.error}</p>}
          <div style={{ marginTop: "0.75rem" }}>
            <button type="submit">Add note</button>
          </div>
        </Form>
      </div>

      {notes.length === 0 ? (
        <p className="muted">No notes yet.</p>
      ) : (
        notes.map((note) => (
          <div className="note" key={note.id}>
            <div className="row">
              <h3 style={{ flex: 1 }}>{note.title}</h3>
              <Form method="post">
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={note.id} />
                <button className="danger" type="submit">
                  Delete
                </button>
              </Form>
            </div>
            {note.body && <p style={{ whiteSpace: "pre-wrap" }}>{note.body}</p>}
          </div>
        ))
      )}
    </>
  );
}
