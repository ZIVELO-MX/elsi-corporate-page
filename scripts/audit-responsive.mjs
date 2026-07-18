import { spawn } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const origin = process.env.AUDIT_ORIGIN ?? "http://127.0.0.1:3011";
const screenshotDir = process.env.AUDIT_SCREENSHOT_DIR;
const widths = (process.env.AUDIT_WIDTHS ?? "390,768,1024,1440")
  .split(",")
  .map(Number)
  .filter(Number.isFinite);
const routes = (process.env.AUDIT_ROUTES ?? "/,/soluciones,/soluciones/capacitacion,/cursos,/cursos/fundamentos-de-educacion-ambiental,/nosotros,/contacto,/login,/register,/profile,/profile/wireframes,/aviso-de-privacidad")
  .split(",")
  .filter(Boolean);

const profile = await mkdtemp(join(tmpdir(), "elsi-responsive-audit-"));
const chrome = spawn(chromePath, [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--hide-scrollbars",
  "--remote-debugging-port=0",
  `--user-data-dir=${profile}`,
  "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });

const browserWs = await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error("Chrome did not expose a debugging endpoint")), 10_000);
  chrome.stderr.setEncoding("utf8");
  chrome.stderr.on("data", (chunk) => {
    const match = chunk.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (!match) return;
    clearTimeout(timeout);
    resolve(match[1]);
  });
  chrome.on("exit", (code) => reject(new Error(`Chrome exited early (${code})`)));
});

const socket = new WebSocket(browserWs);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();
const events = new Map();
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
    return;
  }
  const listeners = events.get(message.method) ?? [];
  events.delete(message.method);
  listeners.forEach((resolve) => resolve(message.params));
});

function send(method, params = {}, sessionId) {
  const id = ++commandId;
  socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

function once(method, timeoutMs = 10_000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeoutMs);
    const listeners = events.get(method) ?? [];
    listeners.push((value) => {
      clearTimeout(timeout);
      resolve(value);
    });
    events.set(method, listeners);
  });
}

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);

const results = [];
if (screenshotDir) await mkdir(screenshotDir, { recursive: true });
for (const width of widths) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width <= 480,
  }, sessionId);

  for (const route of routes) {
    const loaded = once("Page.loadEventFired");
    await send("Page.navigate", { url: new URL(route, origin).href }, sessionId);
    await loaded;
    await new Promise((resolve) => setTimeout(resolve, 600));

    const { result } = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const overflow = document.documentElement.scrollWidth - viewportWidth;
        const offenders = [...document.querySelectorAll('body *')]
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              className: typeof element.className === 'string' ? element.className.slice(0, 100) : '',
              text: (element.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 80),
              left: Math.round(rect.left * 10) / 10,
              right: Math.round(rect.right * 10) / 10,
              width: Math.round(rect.width * 10) / 10,
            };
          })
          .filter((item) => item.width > 1 && (item.left < -1 || item.right > viewportWidth + 1))
          .sort((a, b) => Math.max(b.right - viewportWidth, -b.left) - Math.max(a.right - viewportWidth, -a.left))
          .slice(0, 8);
        return {
          title: document.title,
          path: location.pathname,
          viewportWidth,
          documentWidth: document.documentElement.scrollWidth,
          overflow,
          offenders: overflow > 0 ? offenders : [],
        };
      })()`,
    }, sessionId);
    results.push({ width, ...result.value });

    if (screenshotDir) {
      const { data } = await send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
        fromSurface: true,
      }, sessionId);
      const slug = route === "/" ? "home" : route.replace(/^\//, "").replaceAll("/", "-");
      await writeFile(join(screenshotDir, `${slug}-${width}.png`), Buffer.from(data, "base64"));
    }
  }
}

console.log(JSON.stringify(results, null, 2));
socket.close();
chrome.kill("SIGTERM");
