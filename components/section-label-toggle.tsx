"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SectionLabelToggle() {
  const pathname = usePathname();

  useEffect(() => {
    const enabled = document.body.dataset.sectionLabels === "true";

    document.querySelectorAll(".section-feedback-pill").forEach((node) => {
      node.remove();
    });

    if (enabled) {
      document.body.dataset.sectionLabels = "true";

      document.querySelectorAll<HTMLElement>("section[data-section-label]").forEach((section) => {
        const label = section.dataset.sectionLabel;
        if (!label) return;

        const pill = document.createElement("span");
        pill.className = "section-feedback-pill";
        pill.setAttribute("aria-hidden", "true");
        pill.textContent = label;
        section.prepend(pill);
      });
    } else {
      delete document.body.dataset.sectionLabels;
    }
  }, [pathname]);

  return null;
}
