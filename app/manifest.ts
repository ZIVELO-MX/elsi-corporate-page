import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.fullName,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F7F6F2",
    theme_color: "#4A7A7E",
    lang: "es-MX",
    icons: [
      {
        src: "/logos/elsi-full-logo.png",
        sizes: "728x747",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
