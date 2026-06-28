import { useEffect, useRef, useState, type FormEvent } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/chat";
import { requireUser } from "~/lib/session.server";
import { chat, type ChatMessage } from "~/lib/anthropic.server";

export function meta() {
  return [{ title: "AI chat" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  await requireUser(context.cloudflare.env, request);
  return null;
}

export async function action({ request, context }: Route.ActionArgs) {
  const env = context.cloudflare.env;
  await requireUser(env, request);

  if (!env.ANTHROPIC_API_KEY) {
    return { error: "ANTHROPIC_API_KEY is not configured on the server." };
  }

  const { messages } = (await request.json()) as { messages: ChatMessage[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: "No message provided." };
  }

  try {
    const reply = await chat(env.ANTHROPIC_API_KEY, messages);
    return { reply };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "The AI request failed.",
    };
  }
}

export default function Chat() {
  const fetcher = useFetcher<typeof action>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const lastReply = useRef<string | null>(null);

  // When the action returns a reply, append it once.
  useEffect(() => {
    const reply = fetcher.data && "reply" in fetcher.data ? fetcher.data.reply : null;
    if (reply && reply !== lastReply.current) {
      lastReply.current = reply;
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    }
  }, [fetcher.data]);

  const sending = fetcher.state !== "idle";
  const error = fetcher.data && "error" in fetcher.data ? fetcher.data.error : null;

  function send(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    fetcher.submit(
      { messages: next },
      { method: "post", encType: "application/json" },
    );
  }

  return (
    <>
      <h1>AI chat</h1>
      <p className="muted">Powered by Claude. Your API key never leaves the server.</p>

      <div className="chat-log">
        {messages.map((m, i) => (
          <div className={`msg ${m.role}`} key={i}>
            {m.content}
          </div>
        ))}
        {sending && <div className="msg assistant muted">Thinking…</div>}
      </div>

      {error && <p className="error">{error}</p>}

      <form onSubmit={send} className="row" style={{ marginTop: "1rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything…"
          autoFocus
        />
        <button type="submit" disabled={sending}>
          Send
        </button>
      </form>
    </>
  );
}
