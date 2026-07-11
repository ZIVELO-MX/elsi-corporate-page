import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  const AVATAR_URL = "https://i.pinimg.com/736x/5f/af/6e/5faf6ef038c6185eb6c67e4bfccce4ee.jpg";

  const isAdmin = email === "admin@elsi.com";
  const user = {
    id: "usr_" + crypto.randomUUID().slice(0, 8),
    email,
    name: email.split("@")[0],
    role: isAdmin ? "admin" as const : "user" as const,
    avatarUrl: AVATAR_URL,
  };

  return NextResponse.json({ user });
}
