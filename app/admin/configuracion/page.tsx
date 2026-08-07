"use client";

import { useEffect, useState } from "react";
import { CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/payments")
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => { if (payload && typeof payload.cardEnabled === "boolean") setEnabled(payload.cardEnabled); })
      .catch(() => toast({ title: "No fue posible cargar la configuración", variant: "error" }))
      .finally(() => setLoading(false));
  }, [toast]);

  async function changePaymentMode(next: boolean) {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/payments", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error);
      setEnabled(payload.cardEnabled === true);
      toast({ title: next ? "Pagos con tarjeta activados" : "Pagos con tarjeta desactivados", variant: "success" });
    } catch (error) {
      toast({ title: error instanceof Error && error.message ? error.message : "No fue posible guardar el cambio", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-settings-page">
      <header className="admin-settings-header">
        <h1 className="admin-page-title">Configuración</h1>
        <p className="admin-page-sub">Controla las opciones operativas que afectan al sitio público.</p>
      </header>
      <section className="admin-settings-card" aria-labelledby="payments-setting-title">
        <div className="admin-settings-card-icon"><CreditCard aria-hidden="true" /></div>
        <div className="admin-settings-card-copy">
          <h2 id="payments-setting-title">Pagos con tarjeta</h2>
          <p>{enabled ? "El checkout puede abrir Stripe para pagos con tarjeta." : "El checkout solicitará la inscripción por correo a ELSI."}</p>
          <small><ShieldCheck aria-hidden="true" /> El cambio se aplica al siguiente checkout.</small>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={enabled ? "Desactivar pagos con tarjeta" : "Activar pagos con tarjeta"}
          className="admin-settings-switch"
          data-enabled={enabled}
          disabled={loading || saving}
          onClick={() => void changePaymentMode(!enabled)}
        >
          {saving ? <LoaderCircle className="admin-settings-spinner" size={16} aria-hidden="true" /> : <span />}
        </button>
      </section>
    </div>
  );
}
