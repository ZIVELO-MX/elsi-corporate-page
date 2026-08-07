import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("account data persists the authenticated user's editable profile fields", async () => {
  const [route, migration, auth, context, page, types] = await Promise.all([
    read("app/api/profile/route.ts"),
    read("supabase/migrations/20260811000000_profile_account_data.sql"),
    read("lib/supabase/auth.ts"),
    read("components/auth-context.tsx"),
    read("app/profile/page.tsx"),
    read("lib/supabase/types.ts"),
  ]);

  assert.match(route, /export async function PATCH/);
  assert.match(route, /auth\.user\.id/);
  assert.match(route, /\.update\(\{ full_name: name, phone \}\)/);
  assert.match(route, /No autenticado/);
  assert.match(migration, /add column if not exists phone/);
  assert.match(migration, /profiles_update_self/);
  assert.match(auth, /select\("full_name, phone, role, avatar_url"\)/);
  assert.match(context, /updateUser/);
  assert.match(page, /method: "PATCH"/);
  assert.match(page, /autoComplete="tel"/);
  assert.match(page, /Foto de perfil de/);
  assert.match(page, /disabled=\{saving\}/);
  assert.doesNotMatch(page, /Prototipo: por ahora los cambios no se guardan/);
  assert.match(types, /phone: string \| null/);
});
