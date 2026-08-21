import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("authenticated header exposes an accessible role-aware user menu", () => {
  const header = read("components/header.tsx");

  assert.match(header, /DropdownMenuPrimitive\.Root/);
  assert.match(header, /aria-haspopup="menu"/);
  assert.match(header, /aria-expanded=\{accountMenuOpen\}/);
  assert.match(header, /role="menu"/);
  assert.match(header, /href="\/profile"/);
  assert.match(header, /user\.role === "admin"/);
  assert.match(header, /href="\/admin"/);
  assert.match(header, /Cerrar sesión/);
  assert.match(header, /onSelect=\{\(\) => void handleLogout\(\)\}/);
});

test("logout always replaces account history with the public home page", () => {
  const auth = read("components/auth-context.tsx");
  const header = read("components/header.tsx");
  const profile = read("app/profile/page.tsx");
  const admin = read("components/admin-shell.tsx");

  assert.match(auth, /useRouter/);
  assert.match(auth, /router\.replace\("\/"\)/);
  assert.doesNotMatch(header, /router\.push\("\/login"\)/);
  assert.match(profile, /onClick=\{logout\}/);
  assert.match(admin, /onClick=\{logout\}/);
});

test("user menu motion stays anchored, symmetric, and reduced-motion safe", () => {
  const styles = read("app/globals.css");

  assert.match(styles, /transform-origin: var\(--radix-dropdown-menu-content-transform-origin\)/);
  assert.match(styles, /header-user-menu-in 200ms/);
  assert.match(styles, /header-user-menu-out 140ms/);
  assert.match(styles, /\.mobile-navigation-actions \.mobile-navigation-cta \{ background: var\(--primary-hover\)/);
  assert.match(styles, /@keyframes header-user-menu-in[\s\S]*translateY\(-5px\) scale\(\.96\)[\s\S]*translateY\(0\) scale\(1\)/);
  assert.match(styles, /@keyframes header-user-menu-out[\s\S]*translateY\(0\) scale\(1\)[\s\S]*translateY\(-5px\) scale\(\.96\)/);
  assert.match(styles, /prefers-reduced-motion: reduce[\s\S]*\.header-user-popover\[data-state\] \{ animation: none; \}/);
  assert.doesNotMatch(styles.match(/\.header-user-popover[\s\S]*?@keyframes header-user-menu-in/)?.[0] ?? "", /transition:\s*all|scale\(0\)|ease-in/);
});

test("login keeps the approved email and password flow accessible", () => {
  const login = read("app/login/page.tsx");
  const styles = read("app/globals.css");

  assert.match(login, /<label[^>]+htmlFor="email"/);
  assert.match(login, /<label[^>]+htmlFor="password"/);
  assert.match(login, /type="email"/);
  assert.match(login, /type="password"/);
  assert.match(login, /autoComplete="email"/);
  assert.match(login, /autoComplete="current-password"/);
  assert.match(login, /aria-describedby=\{errors\.email/);
  assert.match(login, /aria-describedby=\{errors\.password/);
  assert.match(login, /role="alert"/);
  assert.match(login, /pointer-fine:hover:/);
  assert.match(login, /className="accent-link/);
  assert.match(login, /signInWithOAuth/);
  assert.match(login, /provider: "google"/);
  assert.match(login, /Continuar con Google/);
  assert.match(styles, /\.accent-link \{ color: var\(--accent\); \}/);
});
