import type { Metadata } from "next";
import { CheckoutExperience } from "@/components/checkout/checkout-experience";
import { getCheckoutCourseBySlug } from "@/lib/payments";

export const metadata: Metadata = {
  title: "Finalizar inscripción | ELSI",
  description: "Confirma tu inscripción y continúa al pago seguro.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string }>;
}) {
  const { curso } = await searchParams;

  return <CheckoutExperience course={getCheckoutCourseBySlug(curso)} />;
}
