import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-context";
import { PrototypeNotice } from "@/components/prototype-notice";
import { siteConfig } from "@/lib/site-config";

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
  title: "ELSI | Educación y soluciones ambientales",
  description: "Environment Learning & Solutions Institute. Educación, capacitación y consultoría ambiental.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${manrope.variable} ${sora.variable}`}>
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
