"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ClientTitleCleaner() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanTitle = () => {
      if (typeof document !== "undefined" && document.title) {
        if (document.title.includes("🔴") || /EN\s*VIVO/i.test(document.title)) {
          const newTitle = document.title
            .replace(/🔴\s*EN\s*VIVO\s*\|\s*/gi, "")
            .replace(/^🔴\s*/g, "")
            .trim();
          if (newTitle !== document.title) {
            document.title = newTitle;
          }
        }
      }
    };

    // Clean immediately on mount and route change
    cleanTitle();

    // Catch Next.js async metadata hydration updates
    const t1 = setTimeout(cleanTitle, 50);
    const t2 = setTimeout(cleanTitle, 200);
    const t3 = setTimeout(cleanTitle, 500);

    // Observe changes to <title> tag in <head>
    const titleEl = document.querySelector("title");
    let observer: MutationObserver | null = null;

    if (titleEl) {
      observer = new MutationObserver(() => {
        cleanTitle();
      });
      observer.observe(titleEl, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [pathname]);

  return null;
}
