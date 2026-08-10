import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-context";
import { siteConfig } from "@/lib/site-config";
import { getVisiblePrimaryNavigation } from "@/lib/navigation";
import { getPublicSectionVisibility } from "@/lib/public-section-settings";
import {
  DISCOVERY_ALTERNATES,
  SITE,
  SOCIAL_IMAGE,
  indexable,
} from "@/lib/seo";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "ELSI | Educación y soluciones ambientales",
    template: "%s · ELSI",
  },
  description: SITE.description,
  applicationName: SITE.name,
  creator: SITE.name,
  publisher: SITE.name,
  category: "Educación ambiental",
  alternates: { types: DISCOVERY_ALTERNATES },
  robots: indexable
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      }
    : { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/logos/elsi-full-logo.png",
    apple: "/logos/elsi-full-logo.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: "ELSI | Educación y soluciones ambientales",
    description: SITE.description,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "ELSI | Educación y soluciones ambientales",
    description: SITE.description,
    images: [SOCIAL_IMAGE.url],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const visibility = await getPublicSectionVisibility();
  const navigation = getVisiblePrimaryNavigation(visibility);

  return (
    <html lang={SITE.language} className={`${manrope.variable} ${sora.variable}`}>
      <body data-section-labels={siteConfig.sectionLabels ? "true" : undefined}>
        <a className="skip-link" href="#main-content">Saltar al contenido principal</a>
        <AuthProvider>
          <Header navigation={navigation} />
          <div id="main-content" className="site-content" tabIndex={-1}>{children}</div>
        </AuthProvider>
        <Footer navigation={navigation} />
        <Toaster />
      </body>
    </html>
  );
}
