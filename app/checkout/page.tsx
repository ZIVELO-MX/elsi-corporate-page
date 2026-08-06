import { CheckoutExperience } from "@/components/checkout/checkout-experience";
import { getCheckoutCourseBySlug, mapPublicCourseToCheckoutCourse } from "@/lib/payments";
import { getPublicCourse } from "@/lib/courses-repository";
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

  const persisted = curso ? await getPublicCourse(curso) : null;
  const course = persisted
    ? mapPublicCourseToCheckoutCourse(persisted)
    : getCheckoutCourseBySlug(curso);

  return <CheckoutExperience course={course} />;
}
