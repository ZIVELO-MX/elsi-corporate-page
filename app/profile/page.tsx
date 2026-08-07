"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle, BookOpen, CalendarDays, CheckCircle2, Download, FileClock,
  GraduationCap, Mail, MapPin, TicketCheck,
} from "lucide-react";
import { useAuth, type User } from "@/components/auth-context";
import type { ProfilePayload, ProfileUpcoming, ProfileCertificate } from "@/app/api/profile/route";
import styles from "./profile.module.css";

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "instituteelsi@gmail.com";

type LoadState = "loading" | "error" | "ready";
type OrderStatus = "pending" | "paid" | "failed" | "canceled";
type PaymentReturnStatus = "idle" | "checking" | "pending" | "paid" | "failed" | "canceled" | "error";

type PaymentReturnFeedback = {
  status: PaymentReturnStatus;
  orderId?: string;
  courseTitle?: string;
  canRetry?: boolean;
};

type OrderResponse = {
  order: {
    id: string;
    course_title: string;
    status: OrderStatus;
  };
};

const PAYMENT_POLL_ATTEMPTS = 15;
const PAYMENT_POLL_DELAY_MS = 1_000;
const ORDER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function clearPaymentReturnQuery() {
  window.history.replaceState(null, "", "/profile");
}

/* --- Presentational pieces (ported from the approved ELS-0020 wireframe) --- */

const STATUS_TONES = {
  teal: "bg-[var(--primary-light)] text-[var(--primary-hover)]",
  green: "bg-[#edf3e8] text-[var(--moss)]",
  purple: "bg-[var(--accent-light)] text-[var(--accent)]",
};

function Status({ children, tone = "teal" }: { children: React.ReactNode; tone?: "teal" | "green" | "purple" }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold ${STATUS_TONES[tone]}`}>{children}</span>;
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-3 text-center sm:text-left">
      <p className="font-heading text-[22px] font-bold tracking-[-0.01em] tabular-nums text-[var(--primary-hover)]">{value}</p>
      <p className="mt-1 text-[11px] font-bold text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function SectionTitle({ title, id }: { title: string; id?: string }) {
  return <h2 id={id} className="mb-3 font-heading text-[16px] font-bold text-[var(--text)]">{title}</h2>;
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 rounded-[var(--radius-sm)] bg-[var(--primary-light)] p-3 text-[11px] leading-5 text-[var(--text-muted)]">{children}</p>;
}

function ProfileSkeleton() {
  return (
    <section
      className={styles.skeleton}
      role="status"
      aria-label="Cargando tu portal"
      aria-busy="true"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className={`${styles.skeletonLine} h-3 w-24`} />
          <span className={`${styles.skeletonLine} h-6 w-48 max-w-full`} />
        </div>
        <span className={`${styles.skeletonLine} size-11 shrink-0 rounded-full`} />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {["one", "two", "three"].map((item) => (
          <span key={item} className={`${styles.skeletonLine} h-16`} />
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-2">
        <span className={`${styles.skeletonLine} h-4 w-28`} />
        <span className={`${styles.skeletonLine} h-4 w-full`} />
        <span className={`${styles.skeletonLine} h-4 w-2/3`} />
      </div>
      <span className="sr-only">Estamos preparando tus cursos y constancias.</span>
    </section>
  );
}

function UpcomingCard({ c }: { c: ProfileUpcoming }) {
  if (c.access === "access-pending") {
    return (
      <article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-4">
        <Status tone="purple"><Mail size={12} aria-hidden="true" />Información de acceso pendiente</Status>
        <h3 className="mt-3 break-words font-heading text-[15px] font-bold text-[var(--text)]">{c.title}</h3>
        <p className="mt-2 text-[12px] leading-5 text-[var(--text-muted)]">
          Tu inscripción está pagada. Recibirás la información de acceso por correo.
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className={`primary-link ${styles.control} mt-3 inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--primary)] px-3 text-[12px] font-extrabold pointer-fine:hover:bg-[var(--primary-light)]`}
        >
          Contactar soporte
        </a>
      </article>
    );
  }
  const online = c.modality === "online";
  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[.08em] text-[var(--primary-hover)]">Próximo curso</p>
          <h3 className="break-words font-heading text-[15px] font-bold text-[var(--text)]">{c.title}</h3>
        </div>
        <span className="shrink-0"><Status tone="green"><TicketCheck size={12} aria-hidden="true" />Pagado</Status></span>
      </div>
      <dl className="grid gap-2 text-[12px] text-[var(--text-muted)] sm:grid-cols-2">
        <div className="flex gap-2"><CalendarDays size={15} className="mt-0.5 shrink-0 text-[var(--primary)]" aria-hidden="true" /><div><dt className="sr-only">Fecha y hora</dt><dd>{c.date} · {c.time}</dd></div></div>
        <div className="flex gap-2"><GraduationCap size={15} className="mt-0.5 shrink-0 text-[var(--primary)]" aria-hidden="true" /><div><dt className="sr-only">Modalidad</dt><dd>{online ? "En línea" : "Presencial"}</dd></div></div>
        <div className="flex gap-2 sm:col-span-2"><MapPin size={15} className="mt-0.5 shrink-0 text-[var(--primary)]" aria-hidden="true" /><div><dt className="sr-only">Información de acceso</dt><dd>{online ? "Te enviaremos los datos de acceso por correo." : c.location}</dd></div></div>
      </dl>
    </article>
  );
}

function CertificateCard({ c }: { c: ProfileCertificate }) {
  if (c.status === "pendiente") {
    return (
      <article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-4">
        <div className="flex gap-3">
          <FileClock size={20} className="shrink-0 text-[var(--earth)]" aria-hidden="true" />
          <div className="min-w-0">
            <Status tone="purple">Constancia pendiente de publicación</Status>
            <h3 className="mt-2 break-words text-[13px] font-bold text-[var(--text)]">Constancia · {c.course}</h3>
            <p className="mt-1 text-[11px] leading-5 text-[var(--text-muted)]">Aparecerá aquí cuando el instituto la cargue. Todavía no hay descarga disponible.</p>
          </div>
        </div>
      </article>
    );
  }
  return (
    <article className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex min-w-0 gap-3">
        <div className="rounded-[var(--radius-sm)] bg-[var(--accent-light)] p-2 text-[var(--accent)]"><BookOpen size={18} aria-hidden="true" /></div>
        <div className="min-w-0">
          <Status tone="green">Disponible</Status>
          <h3 className="mt-2 break-words text-[13px] font-bold text-[var(--text)]">Constancia · {c.course}</h3>
          {c.fileLabel && <p className="mt-1 text-[11px] text-[var(--text-muted)]">{c.fileLabel}</p>}
        </div>
      </div>
      <button
        type="button"
        aria-label={`Descargar constancia de ${c.course}`}
        onClick={() => { window.open(`/api/certificates/${c.id}/download`, "_blank", "noopener,noreferrer"); }}
        className={`${styles.control} inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--primary-hover)] px-3 text-[11px] font-extrabold text-white`}
      >
        <Download size={16} aria-hidden="true" />
        <span>Descargar</span>
      </button>
    </article>
  );
}

function Discover({ empty = false }: { empty?: boolean }) {
  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--accent)] p-5 text-white">
      <p className="text-[10px] font-extrabold uppercase tracking-[.1em] text-white/70">{empty ? "Aún no tienes cursos" : "Sigue aprendiendo"}</p>
      <h2 className="mt-2 font-heading text-[18px] font-bold">Descubre nuevos cursos</h2>
      <p className="mt-2 max-w-md text-[12px] leading-5 text-white/80">Explora la oferta disponible y elige tu próxima experiencia de aprendizaje.</p>
      <Link href="/cursos" className={`accent-link ${styles.control} mt-4 inline-flex items-center rounded-[var(--radius-sm)] bg-white px-3 text-[12px] font-extrabold`}>Ver cursos</Link>
    </article>
  );
}

function PaymentReturnNotice({
  feedback,
  onRetry,
}: {
  feedback: PaymentReturnFeedback;
  onRetry: () => void;
}) {
  if (feedback.status === "idle") return null;

  if (feedback.status === "paid") {
    return (
      <section
        role="status"
        aria-live="polite"
        className="mb-6 rounded-[var(--radius-md)] border border-[var(--leaf)] bg-[#edf7ed] p-4 text-[var(--text)]"
      >
        <div className="flex gap-3">
          <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--leaf)]" size={20} aria-hidden="true" />
          <div>
            <p className="text-[13px] font-extrabold">Pago confirmado</p>
            <p className="mt-1 text-[12px] leading-5 text-[var(--text-muted)]">
              {feedback.courseTitle
                ? `Tu inscripción a ${feedback.courseTitle} ya aparece en el portal.`
                : "Tu inscripción ya aparece en el portal."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (feedback.status === "checking" || feedback.status === "pending") {
    return (
      <section
        role="status"
        aria-live="polite"
        className="mb-6 rounded-[var(--radius-md)] border border-[var(--earth)] bg-[var(--paper)] p-4 text-[var(--text)]"
      >
        <div className="flex gap-3">
          <FileClock className="mt-0.5 shrink-0 text-[var(--earth)]" size={20} aria-hidden="true" />
          <div>
            <p className="text-[13px] font-extrabold">
              {feedback.status === "checking" ? "Confirmando tu pago" : "Pago pendiente"}
            </p>
            <p className="mt-1 text-[12px] leading-5 text-[var(--text-muted)]">
              Estamos esperando la confirmación final de Stripe. Tu inscripción aparecerá automáticamente cuando termine.
            </p>
            {feedback.canRetry && (
              <button
                type="button"
                onClick={onRetry}
                className={`${styles.control} mt-3 rounded-[var(--radius-sm)] border border-[var(--earth)] px-3 text-[11px] font-extrabold text-[var(--earth)] pointer-fine:hover:bg-[var(--paper-warm)]`}
              >
                Actualizar estado
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  const canceled = feedback.status === "canceled";
  const failed = feedback.status === "failed";

  return (
    <section
      role="alert"
      className="mb-6 rounded-[var(--radius-md)] border border-[var(--destructive)] bg-[#fdf2f2] p-4 text-[var(--text)]"
    >
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 shrink-0 text-[var(--destructive)]" size={20} aria-hidden="true" />
        <div>
          <p className="text-[13px] font-extrabold text-[var(--destructive)]">
            {canceled ? "Pago cancelado" : failed ? "No se completó el pago" : "No pudimos confirmar el pago"}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[var(--text-muted)]">
            {canceled || failed
              ? "No se creó ninguna inscripción. Puedes volver al catálogo e intentarlo de nuevo."
              : "Comprueba tu conexión y vuelve a consultar el estado de la orden."}
          </p>
          {feedback.status === "error" ? (
            <button
              type="button"
              onClick={onRetry}
              className={`${styles.control} mt-3 rounded-[var(--radius-sm)] border border-[var(--destructive)] px-3 text-[11px] font-extrabold text-[var(--destructive)] pointer-fine:hover:bg-[#f9e8e8]`}
            >
              Reintentar
            </button>
          ) : (
            <Link
              href="/cursos"
              className={`${styles.control} mt-3 inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--destructive)] px-3 text-[11px] font-extrabold text-[var(--destructive)] pointer-fine:hover:bg-[#f9e8e8]`}
            >
              Volver a cursos
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function AccountSection({ user }: { user: User }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);

  return (
    <section aria-labelledby="account-title" className={`${styles.revealItem} rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4`} data-reveal-index="0">
      <div className="flex items-center justify-between gap-3">
        <h2 id="account-title" className="font-heading text-[15px] font-bold text-[var(--text)]">Datos de la cuenta</h2>
        {!editing && (
          <button type="button" onClick={() => { setEditing(true); setSaved(false); }} className={`${styles.control} inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border)] px-3 text-[12px] font-bold text-[var(--text)] pointer-fine:hover:bg-[var(--paper-warm)]`}>Editar</button>
        )}
      </div>

      {!editing ? (
        <dl className="mt-3 grid gap-2 text-[13px]">
          <div className="flex justify-between gap-3"><dt className="shrink-0 text-[var(--text-muted)]">Nombre</dt><dd className="min-w-0 break-words text-right font-bold text-[var(--text)]">{name}</dd></div>
          <div className="flex justify-between gap-3"><dt className="shrink-0 text-[var(--text-muted)]">Correo</dt><dd className="min-w-0 break-all text-right font-bold text-[var(--text)]">{user.email}</dd></div>
        </dl>
      ) : (
        <form
          className="mt-3 flex flex-col gap-3"
          onSubmit={(e) => { e.preventDefault(); setEditing(false); setSaved(true); }}
        >
          <label className="text-[12px] font-bold text-[var(--text)]">
            Nombre
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              className="mt-1 block h-9 w-full rounded-[var(--radius-sm)] border border-[var(--input)] bg-[var(--paper)] px-3 text-[13px] text-[var(--text)]"
            />
          </label>
          <label className="text-[12px] font-bold text-[var(--text-muted)]">
            Correo
            <input
              value={user.email}
              readOnly
              aria-readonly="true"
              className="mt-1 block h-9 w-full rounded-[var(--radius-sm)] border border-[var(--input)] bg-[var(--muted)] px-3 text-[13px] text-[var(--text-muted)]"
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" className={`${styles.control} inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--primary-hover)] px-3 text-[12px] font-extrabold text-white`}>Guardar</button>
            <button type="button" onClick={() => { setEditing(false); setName(user.name); }} className={`${styles.control} inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border)] px-3 text-[12px] font-bold text-[var(--text)] pointer-fine:hover:bg-[var(--paper-warm)]`}>Cancelar</button>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">Prototipo: por ahora los cambios no se guardan.</p>
        </form>
      )}

      {saved && !editing && <p role="status" className="mt-2 text-[12px] font-bold text-[var(--moss)]">Datos actualizados.</p>}
    </section>
  );
}

/* --- Page --- */

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<ProfilePayload | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [paymentReturn, setPaymentReturn] = useState<PaymentReturnFeedback>({ status: "idle" });
  const activePaymentRequest = useRef<AbortController | null>(null);
  const confirmedOrder = useRef<string | null>(null);

  // Setting state lives inside the async then/catch (not synchronously in the
  // effect), so the initial fetch doesn't trigger a cascading render. Initial
  // state is already "loading"; the retry handler resets it before calling load.
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      if (!response.ok) throw new Error("bad status");
      const profile = await response.json() as ProfilePayload;
      setData(profile);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  const pollPaymentReturn = useCallback(async (orderId: string) => {
    activePaymentRequest.current?.abort();
    const controller = new AbortController();
    activePaymentRequest.current = controller;

    await Promise.resolve();
    if (controller.signal.aborted) return;
    setPaymentReturn({ status: "checking", orderId });

    try {
      for (let attempt = 0; attempt < PAYMENT_POLL_ATTEMPTS; attempt += 1) {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("order lookup failed");

        const { order } = await response.json() as OrderResponse;
        if (order.id !== orderId) throw new Error("order mismatch");

        if (order.status === "paid") {
          await load();
          if (controller.signal.aborted) return;

          setPaymentReturn({ status: "paid", orderId, courseTitle: order.course_title });
          if (confirmedOrder.current !== orderId) {
            confirmedOrder.current = orderId;
            toast.success("Pago confirmado", {
              id: `payment-confirmed-${orderId}`,
              description: `${order.course_title} ya aparece en tu perfil.`,
            });
          }
          clearPaymentReturnQuery();
          return;
        }

        if (order.status === "failed" || order.status === "canceled") {
          setPaymentReturn({ status: order.status, orderId, courseTitle: order.course_title });
          clearPaymentReturnQuery();
          return;
        }

        const lastAttempt = attempt === PAYMENT_POLL_ATTEMPTS - 1;
        setPaymentReturn({
          status: "pending",
          orderId,
          courseTitle: order.course_title,
          canRetry: lastAttempt,
        });
        if (!lastAttempt) {
          await new Promise((resolve) => window.setTimeout(resolve, PAYMENT_POLL_DELAY_MS));
        }
      }
    } catch (error) {
      if (controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
      setPaymentReturn({ status: "error", orderId, canRetry: true });
    }
  }, [load]);

  useEffect(() => {
    if (user) void Promise.resolve().then(() => load());
  }, [user, load]);

  useEffect(() => {
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "success") return;

    const orderId = params.get("order_id") ?? "";
    if (!ORDER_ID_PATTERN.test(orderId)) {
      clearPaymentReturnQuery();
      void Promise.resolve().then(() => {
        setPaymentReturn({ status: "error" });
      });
      return;
    }

    void Promise.resolve().then(() => pollPaymentReturn(orderId));
    return () => activePaymentRequest.current?.abort();
  }, [user, pollPaymentReturn]);

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-heading text-xl font-bold text-[var(--text)]">Inicia sesión para ver tu perfil</h1>
        <p className="mt-2 text-[13px] leading-6 text-[var(--text-muted)]">Tu perfil, cursos y constancias aparecen después de identificarte.</p>
        <Link
          href="/login"
          className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] bg-[var(--primary-hover)] px-4 text-[12px] font-extrabold text-white transition-colors pointer-fine:hover:bg-[color-mix(in_oklab,var(--primary-hover),#000_14%)] pointer-fine:hover:text-white"
        >
          Ir a iniciar sesión
        </Link>
      </main>
    );
  }

  const firstName = user.name.split(" ")[0];
  const isEmpty = data && data.upcoming.length === 0 && data.history.length === 0 && data.certificates.length === 0;

  return (
    <main className={`${styles.portalContent} mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12`}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[var(--primary)]">Portal del alumno</p>
          <h1 className="mt-1 break-words font-heading text-2xl font-bold tracking-[-0.01em] text-[var(--text)]">Hola, {firstName}</h1>
        </div>
        <div className="flex items-center gap-2">
          {user.role === "admin" && (
            <Link href="/admin" className={`${styles.control} inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-bold text-[var(--text)] pointer-fine:hover:bg-[var(--paper-warm)]`}>Panel admin</Link>
          )}
          <button type="button" onClick={logout} className={`${styles.control} inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-bold text-[var(--text)] pointer-fine:hover:bg-[var(--paper-warm)]`}>Cerrar sesión</button>
        </div>
      </header>

      <PaymentReturnNotice
        feedback={paymentReturn}
        onRetry={() => {
          if (paymentReturn.orderId) void pollPaymentReturn(paymentReturn.orderId);
        }}
      />

      {/* At-a-glance summary spans the full width; the detailed content and the
          account rail split into two columns on desktop. */}
      {state === "ready" && data && !isEmpty && (
        <section aria-label="Resumen" className={`${styles.revealItem} mb-6`} data-reveal-index="0">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <Metric value={data.summary.upcoming} label="Próximos" />
            <Metric value={data.summary.completed} label="Realizados" />
            <Metric value={data.summary.certificates} label="Constancias" />
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-start">
        {/* Main column, activity depends on load state */}
        <div className="flex min-w-0 flex-col gap-8">
          {state === "loading" && (
            <ProfileSkeleton />
          )}

          {state === "error" && (
            <div role="alert" className={`${styles.revealItem} rounded-[var(--radius-md)] border border-[var(--destructive)] bg-[#fdf2f2] p-4`} data-reveal-index="0">
              <div className="flex gap-3">
                <AlertCircle className="shrink-0 text-[var(--destructive)]" size={19} aria-hidden="true" />
                <div>
                  <p className="text-[13px] font-bold text-[var(--destructive)]">No pudimos cargar tu portal</p>
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">Comprueba tu conexión e inténtalo de nuevo.</p>
                  <button type="button" onClick={() => { setState("loading"); load(); }} className={`${styles.control} mt-3 rounded-[var(--radius-sm)] border border-[var(--destructive)] px-3 text-[11px] font-extrabold text-[var(--destructive)] pointer-fine:hover:bg-[#f9e8e8]`}>Reintentar</button>
                </div>
              </div>
            </div>
          )}

          {state === "ready" && data && isEmpty && <div className={styles.revealItem} data-reveal-index="1"><Discover empty /></div>}

          {state === "ready" && data && !isEmpty && (
            <>
              {data.upcoming.length > 0 && (
                <section aria-labelledby="next-title" className={styles.revealItem} data-reveal-index="1">
                  <SectionTitle id="next-title" title="Lo siguiente" />
                  <div className="flex flex-col gap-3">
                    {data.upcoming.map((c) => <UpcomingCard key={c.id} c={c} />)}
                  </div>
                  <InfoNote>La liga de los cursos en línea no aparece en el perfil: se envía únicamente por correo.</InfoNote>
                </section>
              )}

              {data.history.length > 0 && (
                <section aria-labelledby="history-title" className={styles.revealItem} data-reveal-index="2">
                  <SectionTitle id="history-title" title="Historial" />
                  <div className="divide-y divide-[var(--border)] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-4">
                    {data.history.map((h) => (
                      <div key={h.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="break-words text-[13px] font-bold text-[var(--text)]">{h.title}</p>
                          <p className="mt-1 text-[11px] text-[var(--text-muted)]">Realizado · {h.year}</p>
                        </div>
                        <CheckCircle2 className="shrink-0 text-[var(--leaf)]" size={18} aria-label="Realizado" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {data.certificates.length > 0 && (
                <section aria-labelledby="cert-title" className={styles.revealItem} data-reveal-index="3">
                  <SectionTitle id="cert-title" title="Constancias" />
                  <div className="flex flex-col gap-3">
                    {data.certificates.map((c) => <CertificateCard key={c.id} c={c} />)}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* Account rail, persistent identity and support on desktop */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-6">
          <AccountSection user={user} />

          {state === "ready" && data && !isEmpty && (
            <section aria-label="Descubre nuevos cursos" className={styles.revealItem} data-reveal-index="2"><Discover /></section>
          )}

          <section aria-labelledby="help-title" className={`${styles.revealItem} rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-4`} data-reveal-index="3">
            <Mail className="text-[var(--primary)]" size={22} aria-hidden="true" />
            <h2 id="help-title" className="mt-3 font-heading text-[15px] font-bold text-[var(--text)]">¿Necesitas ayuda?</h2>
            <p className="mt-2 text-[12px] leading-5 text-[var(--text-muted)]">Para dudas sobre inscripciones, acceso o constancias, escribe al canal de soporte.</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className={`${styles.control} mt-3 inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--primary-hover)] px-3 text-[12px] font-extrabold text-white`}>Enviar correo</a>
          </section>
        </aside>
      </div>
    </main>
  );
}
