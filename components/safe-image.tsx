"use client";

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
};

export function SafeImage({ src, alt, className, style, width, height, loading = "lazy", fetchPriority = "auto" }: SafeImageProps) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return <div className="image-fallback" aria-hidden="true" />;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={loading === "eager" ? "sync" : "async"}
      onError={() => setHidden(true)}
    />
  );
}
