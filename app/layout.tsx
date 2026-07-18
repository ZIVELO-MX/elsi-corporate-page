import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-context";
import { PrototypeNotice } from "@/components/prototype-notice";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "ELSI | Educación y soluciones ambientales",
  description: "Environment Learning & Solutions Institute. Educación, capacitación y consultoría ambiental.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body data-section-labels={siteConfig.sectionLabels ? "true" : undefined}>
        <a className="skip-link" href="#main-content">Saltar al contenido principal</a>
        <AuthProvider>
          <PrototypeNotice />
          <Header />
          <div id="main-content" className="site-content" tabIndex={-1}>{children}</div>
        </AuthProvider>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
