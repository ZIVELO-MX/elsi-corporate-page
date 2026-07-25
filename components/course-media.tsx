import { ImageIcon } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { getCourseImage } from "@/lib/image-assets";

type CourseMediaProps = {
  course: {
    slug: string;
    title: string;
  };
  variant?: "feature" | "detail" | "thumbnail";
  sizes?: string;
  loading?: "eager" | "lazy";
};

function CourseMediaPlaceholder({
  title,
  variant,
}: {
  title: string;
  variant: NonNullable<CourseMediaProps["variant"]>;
}) {
  return (
    <div
      className="course-media-placeholder"
      data-variant={variant}
      role="img"
      aria-label={`Imagen pendiente para el curso ${title}`}
    >
      <ImageIcon aria-hidden="true" />
      <span>
        <strong>Imagen pendiente</strong>
        <small>Se integrará cuando ELSI entregue el recurso final.</small>
      </span>
    </div>
  );
}

export function CourseMedia({
  course,
  variant = "feature",
  sizes,
  loading = "lazy",
}: CourseMediaProps) {
  const asset = getCourseImage(course.slug, course.title);
  const fallback = (
    <CourseMediaPlaceholder title={course.title} variant={variant} />
  );

  if (asset.status === "pending") return fallback;

  return (
    <SafeImage
      src={asset.src}
      alt={asset.alt}
      width={variant === "detail" ? 1200 : 900}
      height={600}
      loading={loading}
      sizes={sizes}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      fallback={fallback}
    />
  );
}
