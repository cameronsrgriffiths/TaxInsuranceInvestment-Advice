import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // Public
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("logout", "routes/logout.tsx"),

  // Login-gated tools. The layout's loader enforces auth for everything inside.
  layout("routes/app-layout.tsx", [
    route("app", "routes/dashboard.tsx"),
    route("app/notes", "routes/notes.tsx"),
    route("app/chat", "routes/chat.tsx"),
  ]),
] satisfies RouteConfig;
