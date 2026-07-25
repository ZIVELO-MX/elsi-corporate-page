"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

type SafeImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width: number;
  height: number;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  preload?: boolean;
  sizes?: string;
  fallback?: ReactNode;
};

export function SafeImage({
  src,
  alt,
  className,
  style,
  width,
  height,
  loading,
  fetchPriority,
  preload = false,
  sizes,
  fallback,
}: SafeImageProps) {
  const [hidden, setHidden] = useState(false);
  if (hidden) {
    if (fallback) return fallback;

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
      loading={preload ? undefined : loading}
      fetchPriority={preload ? undefined : fetchPriority}
      preload={preload}
      sizes={sizes}
      onError={() => setHidden(true)}
    />
  );
}
