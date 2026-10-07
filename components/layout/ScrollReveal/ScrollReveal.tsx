"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main section, main [data-scroll-reveal]"),
    );

    if (reduceMotion || !("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("scroll-reveal-visible"));
      return;
    }

    sections.forEach((section, index) => {
      section.classList.add("scroll-reveal-section");
      section.style.setProperty("--scroll-reveal-delay", `${(index % 4) * 45}ms`);
      const bounds = section.getBoundingClientRect();
      if (bounds.top < window.innerHeight * 0.92 && bounds.bottom > 0) {
        section.classList.add("scroll-reveal-visible");
      }
    });
    root.classList.add("scroll-reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("scroll-reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0 },
    );

    sections
      .filter((section) => !section.classList.contains("scroll-reveal-visible"))
      .forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      root.classList.remove("scroll-reveal-ready");
    };
  }, [pathname]);

  return null;
}
