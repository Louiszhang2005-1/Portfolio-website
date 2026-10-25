"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { fullPortfolioDocument, fullPortfolioPages } from "@/lib/portfolio";

/**
 * Full-screen reader for one portfolio page. The book is a scroll animation, too small to read a dense page;
 * this shows the scan at full resolution. Portalled to <body>, so colours are literal (the .proto tokens don't reach it).
 */
export default function PageViewer({
  page,
  titles,
  onClose,
  onPage,
}: {
  page: number | null;
  titles: string[];
  onClose: () => void;
  onPage: (i: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = page !== null;
  const last = fullPortfolioPages.length - 1;

  useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    // the page's scroll position drives every animation; freeze it while reading
    html.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      html.style.overflow = prevOverflow;
      returnTo?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (page === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && page < last) onPage(page + 1);
      else if (e.key === "ArrowLeft" && page > 0) onPage(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, last, onClose, onPage]);

  if (page === null || typeof document === "undefined") return null;

  const nav =
    "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Portfolio page ${page + 1}: ${titles[page]}`}
      className="fixed inset-0 z-[100] flex flex-col bg-[rgba(12,12,14,0.92)] backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 text-white sm:px-6" onClick={(e) => e.stopPropagation()}>
        <p className="min-w-0 truncate text-sm">
          <span className="font-mono text-white/60">
            {page + 1} / {last + 1}
          </span>
          <span className="ml-3 font-medium">{titles[page]}</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={fullPortfolioDocument.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-9 items-center rounded-full bg-white px-4 text-[13px] font-medium text-[#1d1d1f] sm:inline-flex"
          >
            Open the PDF
          </a>
          <button ref={closeRef} onClick={onClose} aria-label="Close" className={nav}>
            ×
          </button>
        </div>
      </div>
      {/* phones: arrows sit under the page so the scan gets the full width; pinch to zoom further */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center gap-3 px-2 pb-20 sm:gap-6 sm:px-6 sm:pb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPage(page - 1);
          }}
          disabled={page === 0}
          aria-label="Previous page"
          className={`${nav} absolute bottom-4 left-[calc(50%-56px)] shrink-0 sm:static`}
        >
          ‹
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element -- full-resolution scan, sized by the viewport */}
        <img
          src={fullPortfolioPages[page]}
          alt={`Portfolio page ${page + 1}: ${titles[page]}`}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full min-w-0 max-w-full rounded-md bg-white object-contain shadow-2xl"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPage(page + 1);
          }}
          disabled={page === last}
          aria-label="Next page"
          className={`${nav} absolute bottom-4 left-[calc(50%+12px)] shrink-0 sm:static`}
        >
          ›
        </button>
      </div>
    </div>,
    document.body
  );
}
