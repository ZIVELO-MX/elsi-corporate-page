import { NextResponse } from "next/server";

const MOCK_COURSES = [
  { id: "1", title: "Sostenibilidad y gestión ambiental", status: "active", url: "https://elsyacademy.me", progress: 60 },
  { id: "2", title: "Normatividad ambiental para empresas", status: "active", url: "https://elsyacademy.me", progress: 30 },
  { id: "3", title: "Comunicación de sostenibilidad", status: "inactive", url: null, progress: 0 },
];

export async function GET() {
  return NextResponse.json({
    profile: { enrolled: 2, completed: 0 },
    courses: MOCK_COURSES,
  });
}
