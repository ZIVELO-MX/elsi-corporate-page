import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminClient } from "@/lib/admin-auth";
import {
  parsePublicSectionVisibility,
  type PublicSectionVisibility,
} from "@/lib/public-section-settings";

function publicSettingValue(visibility: PublicSectionVisibility) {
  return {
    about_enabled: visibility.aboutEnabled,
    services_enabled: visibility.servicesEnabled,
  };
}

function revalidatePublicSections() {
  revalidatePath("/", "layout");
  revalidatePath("/nosotros");
  revalidatePath("/soluciones");
  revalidatePath("/soluciones/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
  revalidatePath("/api/navigation");
}

export async function GET() {
  const client = await requireAdminClient();
  if (!client) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await client
    .from("site_settings")
    .select("value")
    .eq("key", "public_sections")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No fue posible consultar la configuración" },
      { status: 500 },
    );
  }

  return NextResponse.json(parsePublicSectionVisibility(data?.value));
}

export async function PATCH(request: Request) {
  const client = await requireAdminClient();
  if (!client) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (
    typeof body.aboutEnabled !== "boolean" ||
    typeof body.servicesEnabled !== "boolean"
  ) {
    return NextResponse.json(
      { error: "aboutEnabled y servicesEnabled deben ser booleanos" },
      { status: 400 },
    );
  }

  const visibility: PublicSectionVisibility = {
    aboutEnabled: body.aboutEnabled,
    servicesEnabled: body.servicesEnabled,
  };
  const { error } = await client.from("site_settings").upsert({
    key: "public_sections",
    value: publicSettingValue(visibility),
  });

  if (error) {
    console.error("[admin/settings/public-sections] update failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json(
      { error: "No fue posible guardar la configuración" },
      { status: 500 },
    );
  }

  revalidatePublicSections();
  return NextResponse.json(visibility);
}
