import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Correo electrónico requerido" }, { status: 400 });
  }

  const isAdmin = email === "admin@elsi.com";
  const user = {
    id: "usr_" + crypto.randomUUID().slice(0, 8),
    email,
    name: email.split("@")[0],
    role: isAdmin ? "admin" as const : "user" as const,
  };

  return NextResponse.json({ user });
}
