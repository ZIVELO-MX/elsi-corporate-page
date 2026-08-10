"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Eye,
  LoaderCircle,
  PanelsTopLeft,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

type SettingKey = "payments" | "about" | "services";

type PublicSections = {
  aboutEnabled: boolean;
  servicesEnabled: boolean;
};

type SettingsCardProps = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  note: string;
  enabled: boolean;
  loading: boolean;
  saving: boolean;
  onChange: (next: boolean) => void;
};

function SettingsCard({
  id,
  icon: Icon,
  title,
  description,
  note,
  enabled,
  loading,
  saving,
  onChange,
}: SettingsCardProps) {
  return (
    <section className="admin-settings-card" aria-labelledby={`${id}-setting-title`}>
      <div className="admin-settings-card-icon">
        <Icon aria-hidden="true" />
      </div>
      <div className="admin-settings-card-copy">
        <h2 id={`${id}-setting-title`}>{title}</h2>
        <p>{description}</p>
        <small><ShieldCheck aria-hidden="true" /> {note}</small>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${enabled ? "Desactivar" : "Activar"} ${title.toLocaleLowerCase("es-MX")}`}
        className="admin-settings-switch"
        data-enabled={enabled}
        disabled={loading || saving}
        onClick={() => onChange(!enabled)}
      >
        {saving ? (
          <LoaderCircle className="admin-settings-spinner" size={16} aria-hidden="true" />
        ) : (
          <span />
        )}
      </button>
    </section>
  );
}

async function readSettings(path: string) {
  const response = await fetch(path);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || "No fue posible cargar la configuración");
  }
  return payload;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [cardEnabled, setCardEnabled] = useState(false);
  const [publicSections, setPublicSections] = useState<PublicSections>({
    aboutEnabled: true,
    servicesEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SettingKey | null>(null);

  useEffect(() => {
    Promise.all([
      readSettings("/api/admin/settings/payments"),
      readSettings("/api/admin/settings/public-sections"),
    ])
      .then(([payments, sections]) => {
        if (typeof payments.cardEnabled === "boolean") {
          setCardEnabled(payments.cardEnabled);
        }
        if (
          typeof sections.aboutEnabled === "boolean" &&
          typeof sections.servicesEnabled === "boolean"
        ) {
          setPublicSections(sections);
        }
      })
      .catch((error) => toast({
        title: error instanceof Error ? error.message : "No fue posible cargar la configuración",
        variant: "error",
      }))
      .finally(() => setLoading(false));
  }, [toast]);

  async function changePaymentMode(next: boolean) {
    setSaving("payments");
    try {
      const response = await fetch("/api/admin/settings/payments", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error);
      setCardEnabled(payload.cardEnabled === true);
      toast({
        title: next ? "Pagos con tarjeta activados" : "Pagos con tarjeta desactivados",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: error instanceof Error && error.message ? error.message : "No fue posible guardar el cambio",
        variant: "error",
      });
    } finally {
      setSaving(null);
    }
  }

  async function changePublicSection(key: "aboutEnabled" | "servicesEnabled", next: boolean) {
    const settingKey = key === "aboutEnabled" ? "about" : "services";
    const nextSections = { ...publicSections, [key]: next };
    setSaving(settingKey);
    try {
      const response = await fetch("/api/admin/settings/public-sections", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(nextSections),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error);
      setPublicSections(payload);
      toast({
        title: `${key === "aboutEnabled" ? "Nosotros" : "Servicios y soluciones"} ${next ? "visible" : "oculto"}`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: error instanceof Error && error.message ? error.message : "No fue posible guardar el cambio",
        variant: "error",
      });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="admin-settings-page">
      <header className="admin-settings-header">
        <h1 className="admin-page-title">Configuración</h1>
        <p className="admin-page-sub">Controla las opciones operativas que afectan al sitio público.</p>
      </header>

      <div className="admin-settings-list">
        <SettingsCard
          id="payments"
          icon={CreditCard}
          title="Pagos con tarjeta"
          description={cardEnabled ? "El checkout puede abrir Stripe para pagos con tarjeta." : "El checkout solicitará la inscripción por correo a ELSI."}
          note="El cambio se aplica al siguiente checkout."
          enabled={cardEnabled}
          loading={loading}
          saving={saving === "payments"}
          onChange={(next) => void changePaymentMode(next)}
        />
        <SettingsCard
          id="about"
          icon={UsersRound}
          title="Nosotros"
          description={publicSections.aboutEnabled ? "La historia institucional está disponible en /nosotros." : "La página y sus enlaces públicos están ocultos."}
          note="Ocultar no elimina el contenido y responde como página no encontrada."
          enabled={publicSections.aboutEnabled}
          loading={loading}
          saving={saving === "about"}
          onChange={(next) => void changePublicSection("aboutEnabled", next)}
        />
        <SettingsCard
          id="services"
          icon={PanelsTopLeft}
          title="Servicios y soluciones"
          description={publicSections.servicesEnabled ? "La oferta general está disponible en /soluciones." : "La página, sus detalles y enlaces públicos están ocultos."}
          note="Servicios corresponde a /soluciones en la navegación actual."
          enabled={publicSections.servicesEnabled}
          loading={loading}
          saving={saving === "services"}
          onChange={(next) => void changePublicSection("servicesEnabled", next)}
        />
      </div>

      <p className="admin-settings-discovery-note">
        <Eye aria-hidden="true" /> Los cambios también actualizan navegación, buscadores y descubrimiento para agentes.
      </p>
    </div>
  );
}
