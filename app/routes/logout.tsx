import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { destroySession } from "~/lib/session.server";

export async function action({ request, context }: Route.ActionArgs) {
  const cookie = await destroySession(context.cloudflare.env, request);
  return redirect("/", { headers: { "Set-Cookie": cookie } });
}

// Hitting /logout directly just bounces home.
export async function loader() {
  return redirect("/");
}
