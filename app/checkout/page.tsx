import { CheckoutExperience } from "@/components/checkout/checkout-experience";
import { getCheckoutCourseBySlug } from "@/lib/payments";
import { buildPrivateMetadata } from "@/lib/seo";

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

  return <CheckoutExperience course={getCheckoutCourseBySlug(curso)} />;
}
