import Anthropic from "@anthropic-ai/sdk";

export type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Send a conversation to Claude and return the assistant's text reply.
 * The API key lives only in the Worker (a Cloudflare secret) and never reaches
 * the browser.
 */
export async function chat(
  apiKey: string,
  messages: ChatMessage[],
): Promise<string> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system:
      "You are a concise, helpful assistant embedded in a personal tools app. " +
      "Answer directly and lead with the answer.",
    messages,
  });

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}
