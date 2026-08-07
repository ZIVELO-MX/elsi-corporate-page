"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CourseAction({ href, children, className }: { href: string; children: React.ReactNode; className: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <a
      href={href}
      className={`${className}${pending ? " is-loading" : ""}`}
      aria-disabled={pending}
      onClick={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        setPending(true);
        router.push(href);
      }}
    >
      {pending ? "Abriendo…" : children}
    </a>
  );
}
