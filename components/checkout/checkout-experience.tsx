"use client";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  CreditCard,
  LockKeyhole,
  PackageOpen,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useAuth } from "@/components/auth-context";
import { PrototypeDataNote } from "@/components/prototype-data-note";
import {
  createMockPaymentGateway,
  formatPaymentAmount,
  normalizeBuyer,
  validateBuyer,
  type BuyerErrors,
  type CheckoutCourse,
  type CheckoutSession,
  type PaymentBuyer,
  type PaymentScenario,
  type PaymentState,
} from "@/lib/payments";
import styles from "./checkout.module.css";

type CheckoutExperienceProps = {
  course: CheckoutCourse | null;
};

type StatusCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

const TERMINAL_STATES: PaymentState[] = [
  "pending",
  "succeeded",
  "declined",
  "unavailable",
];

const STATUS_COPY: Record<PaymentState, StatusCopy> = {
  collecting: {
    eyebrow: "Paso 1 de 2",
    title: "Confirma tus datos",
    description: "Los usaremos para identificar tu inscripción y enviarte la confirmación.",
  },
  "creating-session": {
    eyebrow: "Preparando pago",
    title: "Creando una sesión segura",
    description: "Estamos preparando el importe y la referencia de esta inscripción.",
  },
  "loading-provider": {
    eyebrow: "Paso 2 de 2",
    title: "Conectando con Stripe",
    description: "Stripe está preparando el espacio protegido de pago.",
  },
  ready: {
    eyebrow: "Paso 2 de 2",
    title: "Realiza tu pago",
    description: "El Payment Element de Stripe aparecerá aquí cuando los pagos estén habilitados.",
  },
  processing: {
    eyebrow: "Procesando",
    title: "Confirmando la operación",
    description: "Conserva esta ventana abierta mientras recibimos el resultado.",
  },
  pending: {
    eyebrow: "Confirmación pendiente",
    title: "Tu pago está en revisión",
    description: "La inscripción se confirmará cuando el servidor reciba el estado autoritativo.",
  },
  succeeded: {
    eyebrow: "Pago confirmado",
    title: "Tu lugar está reservado",
    description: "En producción, recibirás por correo la confirmación y los siguientes pasos.",
  },
  declined: {
    eyebrow: "Pago no autorizado",
    title: "No pudimos completar el pago",
    description: "No se realizó ningún cargo. Podrás intentarlo de nuevo o usar otro método.",
  },
  unavailable: {
    eyebrow: "Proveedor no disponible",
    title: "No pudimos abrir el pago",
    description: "Tus datos siguen aquí. Intenta nuevamente cuando estés listo.",
  },
};

function hasErrors(errors: BuyerErrors) {
  return Object.keys(errors).length > 0;
}

function StatusPanel({
  state,
  children,
}: {
  state: PaymentState;
  children: ReactNode;
}) {
  const copy = STATUS_COPY[state];

  return (
    <div className={styles.statePanel} data-payment-state={state}>
      <div className={styles.panelHeading}>
        <span className={styles.stepLabel}>{copy.eyebrow}</span>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </div>
      {children}
    </div>
  );
}

function OrderSummary({
  course,
  formattedAmount,
}: {
  course: CheckoutCourse;
  formattedAmount: string;
}) {
  return (
    <aside className={styles.summaryCard} aria-labelledby="order-summary-title">
      <div className={styles.summaryTopline}>
        <span>Resumen · Datos de ejemplo</span>
        <ShieldCheck aria-hidden="true" />
      </div>
      <h2 id="order-summary-title">{course.title}</h2>
      <p className={styles.courseMeta}>{course.category}</p>

      <dl className={styles.courseDetails}>
        <div>
          <dt>Duración</dt>
          <dd>{course.duration}</dd>
        </div>
        <div>
          <dt>Constancia</dt>
          <dd>{course.certificateType}</dd>
        </div>
      </dl>

      <div className={styles.totalBlock}>
        <div>
          <span>{course.priceLabel}</span>
          <small>Pago único · {course.currency}</small>
        </div>
        <strong>{formattedAmount}</strong>
      </div>

      <div className={styles.securityNote}>
        <LockKeyhole aria-hidden="true" />
        <p>Stripe procesará el pago. ELSI no almacenará datos de tu tarjeta.</p>
      </div>
    </aside>
  );
}

function BuyerForm({
  errors,
  defaultName,
  defaultEmail,
  action,
}: {
  errors: BuyerErrors;
  defaultName: string;
  defaultEmail: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form className={styles.buyerForm} action={action} noValidate>
      <div className={styles.field}>
        <label htmlFor="checkout-name">Nombre completo</label>
        <input
          id="checkout-name"
          name="name"
          type="text"
          autoComplete="name"
          defaultValue={defaultName}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "checkout-name-error" : undefined}
        />
        {errors.name && (
          <span id="checkout-name-error" className={styles.fieldError}>
            {errors.name}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="checkout-email">Correo electrónico</label>
        <input
          id="checkout-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          defaultValue={defaultEmail}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={
            errors.email ? "checkout-email-error" : "checkout-email-hint"
          }
        />
        {errors.email ? (
          <span id="checkout-email-error" className={styles.fieldError}>
            {errors.email}
          </span>
        ) : (
          <span id="checkout-email-hint" className={styles.fieldHint}>
            Aquí enviaremos tu confirmación.
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="checkout-phone">Teléfono</label>
        <input
          id="checkout-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="477 123 4567"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
        />
        {errors.phone && (
          <span id="checkout-phone-error" className={styles.fieldError}>
            {errors.phone}
          </span>
        )}
      </div>

      <button className={styles.primaryAction} type="submit">
        Continuar al pago
        <CreditCard aria-hidden="true" />
      </button>
    </form>
  );
}

function ProviderPanel({
  state,
  scenario,
  formattedAmount,
  onScenarioChange,
  onEdit,
  onPay,
}: {
  state: PaymentState;
  scenario: PaymentScenario;
  formattedAmount: string;
  onScenarioChange: (scenario: PaymentScenario) => void;
  onEdit: () => void;
  onPay: () => void;
}) {
  const isProcessing = state === "processing";

  return (
    <div className={styles.providerArea} aria-label="Área segura de pago de Stripe">
      <div className={styles.providerHeader}>
        <div>
          <span className={styles.providerName}>
            <LockKeyhole aria-hidden="true" />
            Stripe Payment Element
          </span>
          <small>Prototipo visual · no realiza cargos</small>
        </div>
        <span className={styles.demoBadge}>Demo</span>
      </div>

      <div className={styles.providerPlaceholder}>
        <div className={styles.providerMethod}>
          <CreditCard aria-hidden="true" />
          <div>
            <strong>Tarjeta y métodos compatibles</strong>
            <span>El formulario cifrado se cargará desde Stripe.</span>
          </div>
          <Check aria-hidden="true" />
        </div>
        <p>No ingreses datos reales en este prototipo.</p>
      </div>

      <details className={styles.demoControls}>
        <summary>
          Configurar resultado del prototipo
          <ChevronDown aria-hidden="true" />
        </summary>
        <div>
          <label htmlFor="checkout-scenario">Escenario</label>
          <select
            id="checkout-scenario"
            value={scenario}
            onChange={(event) =>
              onScenarioChange(event.target.value as PaymentScenario)
            }
          >
            <option value="succeeded">Pago aprobado</option>
            <option value="pending">Pago pendiente</option>
            <option value="declined">Pago rechazado</option>
            <option value="unavailable">Proveedor no disponible</option>
          </select>
        </div>
      </details>

      <div className={styles.providerActions}>
        <button
          className={styles.secondaryAction}
          type="button"
          onClick={onEdit}
          disabled={isProcessing}
        >
          Editar datos
        </button>
        <button
          className={styles.primaryAction}
          type="button"
          onClick={onPay}
          disabled={isProcessing}
        >
          {isProcessing ? "Confirmando…" : `Pagar ${formattedAmount}`}
          {isProcessing ? (
            <Clock3 aria-hidden="true" />
          ) : (
            <LockKeyhole aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

function CheckoutResult({
  state,
  session,
  headingRef,
  onRetry,
}: {
  state: (typeof TERMINAL_STATES)[number];
  session: CheckoutSession | null;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onRetry: () => void;
}) {
  const copy = STATUS_COPY[state];
  const icon =
    state === "succeeded" ? (
      <CheckCircle2 aria-hidden="true" />
    ) : state === "pending" ? (
      <Clock3 aria-hidden="true" />
    ) : (
      <CircleAlert aria-hidden="true" />
    );

  return (
    <div
      className={styles.resultPanel}
      data-result={state}
      role={state === "declined" || state === "unavailable" ? "alert" : "status"}
    >
      <div className={styles.resultIcon}>{icon}</div>
      <span className={styles.stepLabel}>{copy.eyebrow}</span>
      <h2 ref={headingRef} tabIndex={-1}>
        {copy.title}
      </h2>
      <p>{copy.description}</p>

      {session && (
        <div className={styles.orderReference}>
          <span>Referencia del prototipo</span>
          <code>{session.orderId}</code>
        </div>
      )}

      <div className={styles.resultActions}>
        {state === "succeeded" || state === "pending" ? (
          <Link className={styles.primaryAction} href="/profile">
            Ir a mi perfil
          </Link>
        ) : (
          <button className={styles.primaryAction} type="button" onClick={onRetry}>
            <RotateCcw aria-hidden="true" />
            Intentar nuevamente
          </button>
        )}
        <Link className={styles.secondaryAction} href="/cursos">
          Volver al curso
        </Link>
      </div>
    </div>
  );
}

function CheckoutEmptyState() {
  return (
    <main className={styles.checkoutPage}>
      <section
        className={styles.checkoutShell}
        data-section-label="Pago / Sin curso seleccionado"
        aria-labelledby="checkout-empty-title"
      >
        <Link
          className={styles.backLink}
          href="/cursos"
        >
          <ArrowLeft aria-hidden="true" />
          Volver a cursos
        </Link>

        <div className={styles.emptyCheckout}>
          <div className={styles.emptyCheckoutIcon}>
            <PackageOpen aria-hidden="true" />
          </div>
          <p className={styles.emptyCheckoutLabel}>Inscripción</p>
          <h1 id="checkout-empty-title">Aún no seleccionas un curso</h1>
          <p>
            Explora la oferta de demostración y abre el detalle del curso antes
            de continuar. La selección real se conectará cuando ELSI entregue
            su catálogo aprobado.
          </p>
          <Link className={styles.primaryAction} href="/cursos">
            Explorar cursos
          </Link>
        </div>
      </section>
    </main>
  );
}

function CheckoutFlow({ course }: { course: CheckoutCourse }) {
  const { user } = useAuth();
  const gateway = useMemo(() => createMockPaymentGateway(), []);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const [state, setState] = useState<PaymentState>("collecting");
  const [errors, setErrors] = useState<BuyerErrors>({});
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [scenario, setScenario] = useState<PaymentScenario>("succeeded");

  useEffect(() => {
    if (TERMINAL_STATES.includes(state)) {
      resultHeadingRef.current?.focus();
    }
  }, [state]);

  const formattedAmount = formatPaymentAmount(course.amount, course.currency);
  const isBusy = [
    "creating-session",
    "loading-provider",
    "processing",
  ].includes(state);

  async function handleBuyerSubmit(formData: FormData) {
    const buyer: PaymentBuyer = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    };
    const nextErrors = validateBuyer(buyer);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      const firstInvalid = Object.keys(nextErrors)[0];
      document.getElementById(`checkout-${firstInvalid}`)?.focus();
      return;
    }

    setState("creating-session");
    try {
      const checkoutSession = await gateway.createSession({
        courseId: course.id,
        buyer: normalizeBuyer(buyer),
      });
      setSession(checkoutSession);
      setState("loading-provider");
      await gateway.loadProvider(checkoutSession);
      setState("ready");
    } catch {
      setState("unavailable");
    }
  }

  async function handlePayment() {
    if (!session) {
      setState("unavailable");
      return;
    }

    setState("processing");
    const result = await gateway.confirmPayment(session, scenario);
    setState(result.state);
  }

  function resetCheckout() {
    setErrors({});
    setSession(null);
    setState("collecting");
  }

  return (
    <main className={styles.checkoutPage}>
      <section
        className={styles.checkoutShell}
        data-section-label="Pago / Checkout Stripe"
        aria-labelledby="checkout-title"
      >
        <Link
          className={styles.backLink}
          href="/cursos"
        >
          <ArrowLeft aria-hidden="true" />
          Volver al curso
        </Link>

        <header className={styles.pageHeading}>
          <span className="section-kicker">Inscripción segura</span>
          <h1 id="checkout-title">Finaliza tu inscripción</h1>
          <p>Revisa el curso, confirma tus datos y continúa al pago.</p>
          <PrototypeDataNote>
            Curso, importe y confirmaciones son fixtures de integración; no se
            realizan cargos ni inscripciones reales.
          </PrototypeDataNote>
        </header>

        <div className={styles.checkoutGrid}>
          <OrderSummary course={course} formattedAmount={formattedAmount} />

          <div className={styles.paymentCard} aria-busy={isBusy}>
            <p className={styles.srOnly} role="status" aria-live="polite">
              {STATUS_COPY[state].title}
            </p>
            {(state === "collecting" || state === "creating-session") && (
              <StatusPanel state={state}>
                {state === "collecting" ? (
                  <BuyerForm
                    errors={errors}
                    defaultName={user?.name ?? ""}
                    defaultEmail={user?.email ?? ""}
                    action={handleBuyerSubmit}
                  />
                ) : (
                  <div className={styles.waitingState}>
                    <Clock3 aria-hidden="true" />
                    <span>Validando curso e importe…</span>
                  </div>
                )}
              </StatusPanel>
            )}

            {(["loading-provider", "ready", "processing"] as PaymentState[]).includes(state) && (
              <StatusPanel state={state}>
                {state === "loading-provider" ? (
                  <div className={styles.waitingState}>
                    <ShieldCheck aria-hidden="true" />
                    <span>Preparando el componente protegido…</span>
                  </div>
                ) : (
                  <ProviderPanel
                    state={state}
                    scenario={scenario}
                    formattedAmount={formattedAmount}
                    onScenarioChange={setScenario}
                    onEdit={resetCheckout}
                    onPay={() => void handlePayment()}
                  />
                )}
              </StatusPanel>
            )}

            {TERMINAL_STATES.includes(state) && (
              <CheckoutResult
                state={state}
                session={session}
                headingRef={resultHeadingRef}
                onRetry={
                  state === "declined" ? () => setState("ready") : resetCheckout
                }
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export function CheckoutExperience({ course }: CheckoutExperienceProps) {
  return course ? <CheckoutFlow course={course} /> : <CheckoutEmptyState />;
}
