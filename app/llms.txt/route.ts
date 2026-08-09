import { buildLlmsText } from "@/lib/agentic-navigation";
import { getPublicDiscoveryManifest } from "@/lib/public-discovery";

export async function GET() {
  const manifest = await getPublicDiscoveryManifest();
  return new Response(buildLlmsText(manifest), {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
