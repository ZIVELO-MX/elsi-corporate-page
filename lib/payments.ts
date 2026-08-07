export const PAYMENT_STATES = [
  "collecting",
  "creating-session",
  "loading-provider",
  "ready",
  "processing",
  "pending",
  "succeeded",
  "declined",
  "unavailable",
] as const;

export type PaymentState = (typeof PAYMENT_STATES)[number];

export const PAYMENT_SCENARIOS = [
  "succeeded",
  "pending",
  "declined",
  "unavailable",
] as const;

export type PaymentScenario = (typeof PAYMENT_SCENARIOS)[number];

export type CheckoutCourse = {
  id: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  certificateType: string;
  amount: number;
  currency: "MXN";
  priceLabel: string;
  contentStatus: "fixture" | "verified";
};

export type PaymentBuyer = {
  name: string;
  email: string;
  phone: string;
};

export type BuyerField = keyof PaymentBuyer;
export type BuyerErrors = Partial<Record<BuyerField, string>>;

export type CheckoutSession = {
  orderId: string;
  checkoutRequestId: string;
  course: CheckoutCourse;
  buyer: PaymentBuyer;
  status: "pending";
  clientSecret?: string | null;
};

export type PaymentResult = {
  orderId: string;
  state: Extract<PaymentState, "pending" | "succeeded" | "declined" | "unavailable">;
};

export type CreateCheckoutRequest = {
  courseId: string;
  buyer: PaymentBuyer;
};

export type PaymentGateway = {
  createSession: (request: CreateCheckoutRequest) => Promise<CheckoutSession>;
  loadProvider: (session: CheckoutSession) => Promise<void>;
  confirmPayment: (
    session: CheckoutSession,
    scenario: PaymentScenario,
  ) => Promise<PaymentResult>;
};

type MockGatewayOptions = {
  delay?: (milliseconds: number) => Promise<void>;
};

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const PAYMENT_AMOUNT_FORMATTERS: Record<
  CheckoutCourse["currency"],
  Intl.NumberFormat
> = {
  MXN: new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }),
};

export const CHECKOUT_COURSE: CheckoutCourse = {
  id: "manejo-integral-residuos-dc3",
  slug: "manejo-integral-de-residuos",
  title: "Manejo Integral de Residuos",
  category: "Normatividad ambiental",
  duration: "4 horas · En línea",
  certificateType: "DC-3",
  amount: 55_000,
  currency: "MXN",
  priceLabel: "Recuperación",
  contentStatus: "fixture",
};

export function getCheckoutCourseBySlug(
  slug: string | undefined,
): CheckoutCourse | null {
  return slug === CHECKOUT_COURSE.slug ? CHECKOUT_COURSE : null;
}

export function mapPublicCourseToCheckoutCourse(course: {
  id: string;
  slug: string;
  title: string;
  category?: string;
  duration?: string;
  certificateType?: string;
  price: number;
  currency?: string;
  priceLabel?: string;
  contentStatus?: "fixture" | "verified";
}): CheckoutCourse | null {
  if (course.currency && course.currency !== "MXN") return null;
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    category: course.category || "Curso ELSI",
    duration: course.duration || "Por confirmar",
    certificateType: course.certificateType || "Constancia de participación",
    amount: Math.round(course.price * 100),
    currency: "MXN",
    priceLabel: course.priceLabel || "Pago único",
    contentStatus: course.contentStatus ?? "verified",
  };
}

export function formatPaymentAmount(
  amount: number,
  currency: CheckoutCourse["currency"],
): string {
  return PAYMENT_AMOUNT_FORMATTERS[currency].format(amount / 100);
}

export function normalizeBuyer(input: PaymentBuyer): PaymentBuyer {
  return {
    name: input.name.trim().replace(/\s+/g, " "),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.replace(/[^\d+]/g, ""),
  };
}

export function validateBuyer(input: PaymentBuyer): BuyerErrors {
  const buyer = normalizeBuyer(input);
  const errors: BuyerErrors = {};

  if (buyer.name.length < 2) {
    errors.name = "Escribe tu nombre completo.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email)) {
    errors.email = "Escribe un correo válido.";
  }
  if (!/^\+?\d{10,15}$/.test(buyer.phone)) {
    errors.phone = "Escribe un teléfono de 10 a 15 dígitos.";
  }

  return errors;
}

export function createMockPaymentGateway(
  options: MockGatewayOptions = {},
): PaymentGateway {
  const delay = options.delay ?? wait;

  return {
    async createSession(request) {
      await delay(240);

      if (request.courseId !== CHECKOUT_COURSE.id) {
        throw new Error("El curso solicitado no está disponible para este prototipo.");
      }

      const errors = validateBuyer(request.buyer);
      if (Object.keys(errors).length > 0) {
        throw new Error("Los datos del comprador no son válidos.");
      }

      const buyer = normalizeBuyer(request.buyer);
      return {
        orderId: `demo-order-${CHECKOUT_COURSE.id}`,
        checkoutRequestId: `demo-checkout-${CHECKOUT_COURSE.id}`,
        course: CHECKOUT_COURSE,
        buyer,
        status: "pending",
      };
    },

    async loadProvider(session) {
      if (session.course.id !== CHECKOUT_COURSE.id) {
        throw new Error("La sesión no corresponde al curso canónico.");
      }
      await delay(320);
    },

    async confirmPayment(session, scenario) {
      await delay(420);
      return {
        orderId: session.orderId,
        state: scenario,
      };
    },
  };
}
