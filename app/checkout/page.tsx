import type { Metadata } from "next";
import { CheckoutExperience } from "@/components/checkout/checkout-experience";
import { CHECKOUT_COURSE } from "@/lib/payments";

export const metadata: Metadata = {
  title: "Finalizar inscripción | ELSI",
  description: "Confirma tu inscripción y continúa al pago seguro.",
};

export default function CheckoutPage() {
  return <CheckoutExperience course={CHECKOUT_COURSE} />;
}
