import { CheckoutExperience } from "@/components/checkout/checkout-experience";
import { getCheckoutCourseBySlug, mapPublicCourseToCheckoutCourse } from "@/lib/payments";
import { getPublicCourse } from "@/lib/courses-repository";
import { buildPrivateMetadata } from "@/lib/seo";
import { getCardPaymentsEnabled } from "@/lib/payment-settings";

export const metadata = buildPrivateMetadata({
  title: "Finalizar inscripción",
  description: "Confirma tu inscripción y continúa al pago seguro.",
  path: "/checkout",
});

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string }>;
}) {
  const { curso } = await searchParams;

  const persisted = curso ? await getPublicCourse(curso) : null;
  const course = persisted
    ? mapPublicCourseToCheckoutCourse(persisted)
    : getCheckoutCourseBySlug(curso);
  const publicPaymentsValue = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED?.trim() ?? "";
  const publicPaymentsEnabled = publicPaymentsValue === "1";
  const configuredCardPayments = await getCardPaymentsEnabled();
  const cardPaymentsEnabled = Boolean(course && course.amount > 0) && publicPaymentsEnabled && configuredCardPayments;
  console.info("[checkout/payment-mode]", {
    courseSelected: Boolean(course),
    paidCourse: Boolean(course && course.amount > 0),
    publicPaymentsValue,
    publicPaymentsEnabled,
    configuredCardPayments,
    cardPaymentsEnabled,
  });

  return <CheckoutExperience course={course} cardPaymentsEnabled={cardPaymentsEnabled} />;
}
