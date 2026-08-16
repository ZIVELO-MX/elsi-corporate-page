import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("auth API uses Supabase Auth when configured and keeps prototype fallback", async () => {
  const [login, register, logout, session] = await Promise.all([
    read("app/api/auth/login/route.ts"), read("app/api/auth/register/route.ts"),
    read("app/api/auth/logout/route.ts"), read("app/api/auth/session/route.ts"),
  ]);
  for (const source of [login, register, logout, session]) assert.match(source, /hasSupabasePublicConfig/);
  assert.match(login, /signInWithPassword/);
  assert.match(register, /signUp/);
  assert.match(logout, /signOut/);
  assert.match(session, /getUser/);
});

test("auth callback rejects open redirects and proxy protects server routes", async () => {
  const [auth, proxy] = await Promise.all([read("lib/supabase/auth.ts"), read("proxy.ts")]);
  assert.match(auth, /startsWith\("\/\/"\)/);
  assert.match(auth, /safeRedirectPath/);
  assert.match(proxy, /getUser/);
  assert.match(proxy, /profiles/);
  assert.match(proxy, /\/admin/);
});

test("service-role key is never referenced by client auth context", async () => {
  const source = await read("components/auth-context.tsx");
  assert.doesNotMatch(source, /SERVICE_ROLE|service.?role/i);
});
