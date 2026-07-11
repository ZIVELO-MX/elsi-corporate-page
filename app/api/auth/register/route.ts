import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, name, phone, password } = await req.json();

  if (!email || !name || !phone || !password) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }

  const AVATAR_URL = "https://i.pinimg.com/736x/5f/af/6e/5faf6ef038c6185eb6c67e4bfccce4ee.jpg";

  const user = {
    id: "usr_" + crypto.randomUUID().slice(0, 8),
    email,
    name,
    phone,
    role: "user" as const,
    avatarUrl: AVATAR_URL,
  };

  return NextResponse.json({ user });
}
