"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  FileClock,
  GraduationCap,
  LoaderCircle,
  Mail,
  MapPin,
  Menu,
  TicketCheck,
} from "lucide-react";

type Screen = {
  id: string;
  label: string;
  description: string;
};

const screens: Screen[] = [
  { id: "summary", label: "01 Resumen", description: "Conteos y tareas principales del alumno." },
  { id: "upcoming-place", label: "02 Próximo presencial", description: "Fecha, hora, modalidad, lugar e información general." },
  { id: "upcoming-online", label: "03 Próximo en línea", description: "El acceso se confirma por correo, nunca se expone una liga." },
  { id: "access-pending", label: "04 Acceso pendiente", description: "Inscripción pagada antes de recibir información por correo." },
  { id: "history", label: "05 Historial", description: "Cursos realizados, sin avance académico ni contenido interno." },
  { id: "certificate-ready", label: "06 Constancia disponible", description: "Archivo cargado manualmente, listo para descargar." },
  { id: "certificate-pending", label: "07 Constancia pendiente", description: "Estado explícito mientras el archivo no está publicado." },
  { id: "discover", label: "08 Descubre cursos", description: "Puerta de salida a la tienda pública." },
  { id: "empty", label: "09 Sin cursos", description: "El descubrimiento toma el lugar del resumen vacío." },
  { id: "contact", label: "10 Contacto", description: "Escala soporte al correo configurado." },
  { id: "login", label: "11 Inicio de sesión", description: "Acceso por correo y contraseña; OAuth queda fuera de alcance." },
  { id: "user-menu", label: "12 Header y menú", description: "Navegación autenticada y cierre de sesión." },
  { id: "feedback", label: "13 Carga y error", description: "Estados no bloqueantes y recuperables." },
];

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "instituteelsi@gmail.com";

type StatusTone = "teal" | "green" | "purple" | "red";

const STATUS_COLORS: Record<StatusTone, string> = {
  teal: "bg-[var(--primary-light)] text-[var(--primary-hover)]",
  green: "bg-[#edf3e8] text-[var(--moss)]",
  purple: "bg-[var(--accent-light)] text-[var(--accent)]",
  red: "bg-[#f9e8e8] text-[var(--destructive)]",
};

function Status({ children, tone = "teal" }: { children: React.ReactNode; tone?: StatusTone }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold ${STATUS_COLORS[tone]}`}>{children}</span>;
}

function CourseCard({ online = false }: { online?: boolean }) {
  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-sm)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[.08em] text-[var(--primary-hover)]">Próximo curso</p>
          <h3 className="font-heading text-[15px] font-bold text-[var(--text)]">Gestión ambiental aplicada</h3>
        </div>
        <Status tone="green"><TicketCheck size={12} aria-hidden="true" />Pagado</Status>
      </div>
      <dl className="grid gap-2 text-[12px] text-[var(--text-muted)] sm:grid-cols-2">
        <div className="flex gap-2"><CalendarDays size={15} className="mt-0.5 shrink-0 text-[var(--primary)]" aria-hidden="true" /><div><dt className="sr-only">Fecha y hora</dt><dd>18 jul · 09:00-13:00</dd></div></div>
        <div className="flex gap-2"><GraduationCap size={15} className="mt-0.5 shrink-0 text-[var(--primary)]" aria-hidden="true" /><div><dt className="sr-only">Modalidad</dt><dd>{online ? "En línea" : "Presencial"}</dd></div></div>
        <div className="flex gap-2 sm:col-span-2"><MapPin size={15} className="mt-0.5 shrink-0 text-[var(--primary)]" aria-hidden="true" /><div><dt className="sr-only">Información de acceso</dt><dd>{online ? "Te enviaremos los datos de acceso por correo." : "Campus ELSI · Av. Universidad 1200"}</dd></div></div>
      </dl>
    </article>
  );
}

function ScreenContent({ id }: { id: string }) {
  if (id === "summary") return <><section className="grid grid-cols-3 gap-2"><Metric value="3" label="Próximos" /><Metric value="5" label="Realizados" /><Metric value="2" label="Constancias" /></section><section className="mt-4"><SectionTitle title="Lo siguiente" action="Ver próximos" /><CourseCard /></section><section className="mt-4"><Discover compact /></section></>;
  if (id === "upcoming-place") return <><SectionTitle title="Próximos cursos" /><CourseCard /><InfoNote>Los datos generales se muestran aquí. No incluye mapas ni recomendaciones de llegada.</InfoNote></>;
  if (id === "upcoming-online") return <><SectionTitle title="Próximos cursos" /><CourseCard online /><InfoNote>La liga del curso no aparece en el perfil; se envía únicamente por correo.</InfoNote></>;
  if (id === "access-pending") return <><SectionTitle title="Próximos cursos" /><article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-4"><Status tone="purple"><Mail size={12} aria-hidden="true" />Información de acceso pendiente</Status><h3 className="mt-3 font-heading text-[15px] font-bold">Auditoría ambiental para organizaciones</h3><p className="mt-2 text-[12px] leading-5 text-[var(--text-muted)]">Tu inscripción está pagada. Recibirás la información necesaria por correo.</p><button type="button" className="mt-3 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[var(--primary)] px-3 text-[12px] font-extrabold text-[var(--primary-hover)]">Contactar soporte</button></article></>;
  if (id === "history") return <><SectionTitle title="Historial" /><div className="divide-y divide-[var(--border)] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-4">{["Introducción a la sostenibilidad", "Normatividad ambiental", "Economía circular"].map((course, index) => <div className="flex items-center justify-between gap-3 py-3" key={course}><div><p className="text-[13px] font-bold">{course}</p><p className="mt-1 text-[11px] text-[var(--text-muted)]">Realizado · {2024 - index}</p></div><CheckCircle2 className="shrink-0 text-[var(--leaf)]" size={18} aria-label="Realizado" /></div>)}</div></>;
  if (id === "certificate-ready") return <><SectionTitle title="Constancias" /><article className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4"><div className="flex gap-3"><div className="rounded-[var(--radius-sm)] bg-[var(--accent-light)] p-2 text-[var(--accent)]"><BookOpen size={18} aria-hidden="true" /></div><div><Status tone="green">Disponible</Status><h3 className="mt-2 text-[13px] font-bold">Constancia · Economía circular</h3><p className="mt-1 text-[11px] text-[var(--text-muted)]">PDF · Publicada el 05 jun 2026</p></div></div><button type="button" aria-label="Descargar constancia de Economía circular" className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary-hover)] text-white"><Download size={16} aria-hidden="true" /></button></article></>;
  if (id === "certificate-pending") return <><SectionTitle title="Constancias" /><article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-4"><div className="flex gap-3"><FileClock size={20} className="shrink-0 text-[var(--earth)]" aria-hidden="true" /><div><Status tone="purple">Constancia pendiente de publicación</Status><h3 className="mt-2 text-[13px] font-bold">Constancia · Gestión ambiental aplicada</h3><p className="mt-1 text-[11px] leading-5 text-[var(--text-muted)]">Aparecerá aquí cuando el instituto la cargue. No hay una descarga disponible todavía.</p></div></div></article></>;
  if (id === "discover" || id === "empty") return <Discover empty={id === "empty"} />;
  if (id === "contact") return <><SectionTitle title="¿Necesitas ayuda?" /><article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-4"><Mail className="text-[var(--primary)]" size={22} aria-hidden="true" /><h3 className="mt-3 font-heading text-[15px] font-bold">Contacta al instituto</h3><p className="mt-2 text-[12px] leading-5 text-[var(--text-muted)]">Para dudas sobre inscripciones, acceso o constancias, escribe al canal de soporte configurado.</p><a href={`mailto:${supportEmail}`} className="mt-3 inline-flex min-h-9 items-center rounded-[var(--radius-sm)] bg-[var(--primary-hover)] px-3 text-[12px] font-extrabold text-white">Enviar correo</a></article></>;
  if (id === "login") return <section className="mx-auto max-w-sm rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)]"><p className="text-[11px] font-extrabold uppercase tracking-[.08em] text-[var(--primary)]">Portal ELSI</p><h2 className="mt-2 font-heading text-[19px] font-bold">Iniciar sesión</h2><p className="mt-1 text-[12px] text-[var(--text-muted)]">Consulta tus inscripciones y constancias.</p><label className="mt-4 block text-[11px] font-bold">Correo electrónico<input className="mt-1 block h-9 w-full rounded-[var(--radius-sm)] border border-[var(--input)] bg-white px-3 text-[12px]" placeholder="tu@correo.com" type="email" /></label><label className="mt-3 block text-[11px] font-bold">Contraseña<input className="mt-1 block h-9 w-full rounded-[var(--radius-sm)] border border-[var(--input)] bg-white px-3 text-[12px]" placeholder="••••••••" type="password" /></label><button type="button" className="mt-4 h-9 w-full rounded-[var(--radius-sm)] bg-[var(--primary-hover)] text-[12px] font-extrabold text-white">Entrar</button><p className="mt-3 text-center text-[11px] text-[var(--text-muted)]">¿No tienes cuenta? <Link href="/register" className="font-bold text-[var(--accent)]">Crear cuenta</Link></p></section>;
  if (id === "user-menu") return <><div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-3"><span className="font-heading text-[14px] font-bold text-[var(--accent)]">ELSI</span><button type="button" className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--border)] px-2 text-[12px] font-bold"><span className="grid size-6 place-items-center rounded-full bg-[var(--accent)] text-[10px] text-white">AM</span>Ana <ChevronDown size={14} aria-hidden="true" /></button></div><div className="mt-2 ml-auto w-48 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-1 shadow-[var(--shadow-sm)]"><Link href="/profile" className="block rounded-[var(--radius-sm)] px-3 py-2 text-[12px] font-bold pointer-fine:hover:bg-[var(--primary-light)]">Mi perfil</Link><button type="button" className="w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-[12px] font-bold pointer-fine:hover:bg-[var(--primary-light)]">Cerrar sesión</button></div></>;
  return <><SectionTitle title="Mis cursos" /><div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-5"><div className="flex items-center gap-3"><LoaderCircle className="animate-spin text-[var(--primary)] motion-reduce:animate-none" size={20} aria-hidden="true" /><div><p className="text-[13px] font-bold">Cargando tus cursos</p><p className="mt-1 text-[11px] text-[var(--text-muted)]">Esto puede tomar unos segundos.</p></div></div></div><div className="mt-3 rounded-[var(--radius-md)] border border-[var(--destructive)] bg-[#fdf2f2] p-4"><div className="flex gap-3"><AlertCircle className="shrink-0 text-[var(--destructive)]" size={19} aria-hidden="true" /><div><p className="text-[13px] font-bold text-[var(--destructive)]">No pudimos cargar tus cursos</p><p className="mt-1 text-[11px] text-[var(--text-muted)]">Comprueba tu conexión e inténtalo de nuevo.</p><button type="button" className="mt-3 min-h-8 rounded-[var(--radius-sm)] border border-[var(--destructive)] px-3 text-[11px] font-extrabold text-[var(--destructive)]">Reintentar</button></div></div></div></>;
}

function Metric({ value, label }: { value: string; label: string }) { return <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-3"><p className="font-heading text-[20px] font-bold text-[var(--primary)]">{value}</p><p className="mt-1 text-[10px] font-bold text-[var(--text-muted)]">{label}</p></div>; }
function SectionTitle({ title, action }: { title: string; action?: string }) { return <div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-heading text-[16px] font-bold">{title}</h2>{action && <span className="text-[11px] font-extrabold text-[var(--accent)]">{action}</span>}</div>; }
function InfoNote({ children }: { children: React.ReactNode }) { return <p className="mt-3 rounded-[var(--radius-sm)] bg-[var(--primary-light)] p-3 text-[11px] leading-5 text-[var(--text-muted)]">{children}</p>; }
function Discover({ empty = false, compact = false }: { empty?: boolean; compact?: boolean }) { return <article className={`rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--accent)] text-white ${compact ? "p-4" : "p-5"}`}><p className="text-[10px] font-extrabold uppercase tracking-[.1em] text-white/70">{empty ? "Aún no tienes cursos" : "Sigue aprendiendo"}</p><h2 className="mt-2 font-heading text-[18px] font-bold">Descubre nuevos cursos</h2><p className="mt-2 max-w-md text-[12px] leading-5 text-white/80">Explora la oferta disponible y elige tu próxima experiencia de aprendizaje.</p><Link href="/cursos" className="mt-4 inline-flex min-h-9 items-center rounded-[var(--radius-sm)] bg-white px-3 text-[12px] font-extrabold text-[var(--accent)]">Cursos</Link></article>; }

function Artboard({ label, mobile, children }: { label: string; mobile?: boolean; children: React.ReactNode }) {
  return <section data-viewport={mobile ? "mobile" : "desktop"} className={`wireframe-artboard overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--paper-warm)] p-3 ${mobile ? "mx-auto w-full max-w-[390px]" : "w-full"}`} aria-label={`${label} del wireframe`}><p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.1em] text-[var(--text-muted)]">{label}</p><div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] p-4">{children}</div></section>;
}

export default function ProfileWireframesPage() {
  const [screenId, setScreenId] = useState("summary");
  const screen = screens.find((item) => item.id === screenId) ?? screens[0];
  return <main className="bg-[var(--bg)] py-8 sm:py-12"><div className="mx-auto max-w-7xl px-4 sm:px-6"><Link href="/profile" className="text-[12px] font-extrabold text-[var(--accent)]">← Perfil actual</Link><div className="mt-4 max-w-3xl"><p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[var(--primary)]">ELS-0020 · Referencia de wireframes</p><h1 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">Portal del alumno</h1><p className="mt-3 text-[13px] leading-6 text-[var(--text-muted)]">Trece pantallas y estados de referencia. Las tarjetas son demostrativas: no conectan backend, descargas ni correo.</p></div><div className="mt-6 grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]"><nav aria-label="Pantallas del wireframe" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">{screens.map((item) => <button key={item.id} type="button" onClick={() => setScreenId(item.id)} aria-current={item.id === screenId ? "page" : undefined} className={`shrink-0 rounded-[var(--radius-sm)] border px-3 py-2 text-left text-[11px] font-bold transition-colors ${item.id === screenId ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary-hover)]" : "border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] pointer-fine:hover:bg-[var(--paper-warm)]"}`}>{item.label}</button>)}</nav><div><section className="mb-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4"><h2 className="font-heading text-[16px] font-bold">{screen.label}</h2><p className="mt-1 text-[12px] text-[var(--text-muted)]">{screen.description}</p></section><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]"><Artboard label="Desktop · 1440 px"><div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3"><span className="font-heading text-[15px] font-bold text-[var(--accent)]">ELSI</span><span className="text-[11px] font-bold text-[var(--text-muted)]">Ana Martínez · Mi perfil</span></div><ScreenContent id={screenId} /></Artboard><Artboard label="Mobile · 390 px" mobile><div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3"><span className="font-heading text-[14px] font-bold text-[var(--accent)]">ELSI</span><button type="button" aria-label="Abrir menú" className="inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)]"><Menu size={16} aria-hidden="true" /></button></div><ScreenContent id={screenId} /></Artboard></div></div></div></div></main>;
}
