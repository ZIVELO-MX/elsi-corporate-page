"use client";

import Image from "next/image";
import { useState } from "react";

type SafeImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
};

export function SafeImage({ src, alt, className, style, width = 1600, height = 900, loading = "lazy", fetchPriority = "auto", sizes }: SafeImageProps) {
  const [hidden, setHidden] = useState(false);
  if (hidden) {
    return (
      <div
        className={["image-fallback", className].filter(Boolean).join(" ")}
        style={style}
        role="img"
        aria-label={`Imagen no disponible: ${alt}`}
      >
        <span>Imagen no disponible</span>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      sizes={sizes}
      onError={() => setHidden(true)}
    />
  );
}
