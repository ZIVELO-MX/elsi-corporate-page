import { NextResponse } from "next/server";

// Mock del portal del alumno (ELS-0006). Datos simulados: no hay backend,
// descargas ni correo reales. La liga de acceso NUNCA se expone aquí: para
// cursos en línea sólo se indica que llega por correo (regla del wireframe).
export type ProfileUpcoming = {
  id: string;
  title: string;
  modality: "presencial" | "online";
  // "paid" = con datos de acceso; "access-pending" = pagado, información aún por correo
  access: "paid" | "access-pending";
  date: string;
  time: string;
  location?: string; // sólo presencial
};

export type ProfileHistory = { id: string; title: string; year: number };

export type ProfileCertificate = {
  id: string;
  course: string;
  status: "disponible" | "pendiente";
  fileLabel?: string; // p.ej. "PDF · Publicada el 05 jun 2026"
};

export type ProfilePayload = {
  summary: { upcoming: number; completed: number; certificates: number };
  upcoming: ProfileUpcoming[];
  history: ProfileHistory[];
  certificates: ProfileCertificate[];
};

const DATA: ProfilePayload = {
  summary: { upcoming: 2, completed: 3, certificates: 2 },
  upcoming: [
    { id: "u1", title: "Gestión ambiental aplicada", modality: "presencial", access: "paid", date: "18 jul", time: "09:00–13:00", location: "Campus ELSI · Av. Universidad 1200" },
    { id: "u2", title: "Auditoría ambiental para organizaciones", modality: "online", access: "access-pending", date: "02 ago", time: "17:00–19:00" },
  ],
  history: [
    { id: "h1", title: "Introducción a la sostenibilidad", year: 2024 },
    { id: "h2", title: "Normatividad ambiental", year: 2023 },
    { id: "h3", title: "Economía circular", year: 2023 },
  ],
  certificates: [
    { id: "c1", course: "Economía circular", status: "disponible", fileLabel: "PDF · Publicada el 05 jun 2026" },
    { id: "c2", course: "Gestión ambiental aplicada", status: "pendiente" },
  ],
};

export async function GET() {
  return NextResponse.json(DATA);
}
