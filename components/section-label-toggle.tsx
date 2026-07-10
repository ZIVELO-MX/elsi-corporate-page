"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SectionLabelToggle() {
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("sections");
    const storedMode = window.sessionStorage.getItem("section-labels");
    const enabled =
      mode === "1" ||
      mode === "true" ||
      (mode === null && storedMode === "true") ||
      document.body.dataset.sectionLabels === "true";

    if (mode === "1" || mode === "true") {
      window.sessionStorage.setItem("section-labels", "true");
    }

    if (mode === "0" || mode === "false") {
      window.sessionStorage.removeItem("section-labels");
    }

    document.querySelectorAll(".section-feedback-pill").forEach((node) => {
      node.remove();
    });

    if (enabled && mode !== "0" && mode !== "false") {
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
