"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const sequenceSelectors = [
  ".page-hero-inner",
  ".section-header",
  ".hero-copy-reference",
  ".hero-benefit-card",
  ".testimonial-card",
  ".premium-ingredients-header",
  ".allergen-warning-panel",
  ".allergen-visual-overlay",
  ".storage-gallery-overlay",
  ".storage-instruction-panel",
  ".storage-care-step",
  ".serving-guide-intro",
  ".serving-timeline-focus",
  ".faq-studio-intro",
  ".faq-stack-modern",
  ".buy-figma-heading",
  ".buy-figma-size-block",
  ".buy-figma-summary",
  ".buy-figma-section-header",
  ".buy-figma-benefit-card",
  ".buy-figma-included-card",
  ".buy-figma-security",
  ".buy-figma-cta-inner",
  ".buy-figma-help-inner",
  ".cta-band-inner > div"
];

export default function ScrollRevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [pathname]);

  useEffect(() => {
    const knownNodes = new WeakSet();
    const revealIfInView = (node) => {
      const rect = node.getBoundingClientRect();
      const inView = rect.top <= window.innerHeight * 0.9 && rect.bottom >= 0;

      if (inView) {
        node.classList.add("is-visible");
      }

      return inView;
    };

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -10% 0px"
      }
    )
        : null;

    const processElements = () => {
      sequenceSelectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((node) => node.classList.add("reveal-sequence"));
      });

      const elements = Array.from(document.querySelectorAll(".reveal, .reveal-sequence"));
      elements.forEach((node) => {
        if (knownNodes.has(node)) {
          return;
        }

        knownNodes.add(node);
        node.classList.remove("is-visible");

        if (!observer || revealIfInView(node)) {
          if (!observer) {
            node.classList.add("is-visible");
          }
          return;
        }

        observer.observe(node);
      });
    };

    const frame = window.requestAnimationFrame(() => {
      processElements();
    });

    const mutationObserver = new MutationObserver(() => {
      processElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("resize", processElements);
    window.addEventListener("scroll", processElements, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      mutationObserver.disconnect();
      window.removeEventListener("resize", processElements);
      window.removeEventListener("scroll", processElements);
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
