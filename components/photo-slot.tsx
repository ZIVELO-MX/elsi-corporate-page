import { ImageIcon } from "lucide-react";

export function PhotoSlot({ src, label, ratio }: { src?: string; label?: string; ratio?: string }) {
  if (src) {
    return (
      <div className="photo-slot" style={ratio ? { aspectRatio: ratio.replace(":", "/") } : undefined}>
        <img src={src} alt={label || ""} />
      </div>
    );
  }

  return (
    <div className="photo-empty" style={ratio ? { aspectRatio: ratio.replace(":", "/") } : undefined}>
      <ImageIcon aria-hidden="true" />
      <span>Placeholder</span>
      {label && <small>{label}</small>}
    </div>
  );
}