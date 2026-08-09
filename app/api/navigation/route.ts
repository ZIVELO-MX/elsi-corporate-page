import { NextResponse } from "next/server";
import { getPublicDiscoveryManifest } from "@/lib/public-discovery";

export async function GET() {
  const manifest = await getPublicDiscoveryManifest();
  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
