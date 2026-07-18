import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, name, phone, password } = await req.json();

  if (!email || !name || !phone || !password) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }

  const user = {
    id: "usr_" + crypto.randomUUID().slice(0, 8),
    email,
    name,
    phone,
    role: "user" as const,
  };

  return NextResponse.json({ user });
}
