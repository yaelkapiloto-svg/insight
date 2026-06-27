"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { TopContentItem } from "@/types/report";

const CONTENT_TYPE_META: Record<string, { label: string; gradient: string; icon: string }> = {
  reels: { label: "הרילס המוצלח ביותר", gradient: "from-rose-500 to-pink-400", icon: "🎬" },
  stories: { label: "הסטורי המוצלח ביותר", gradient: "from-violet-500 to-purple-400", icon: "✨" },
  posts: { label: "הפוסט המוצלח ביותר", gradient: "from-blue-500 to-cyan-400", icon: "📸" },
  carousel: { label: "הקרוסלה המוצלחת ביותר", gradient: "from-amber-500 to-orange-400", icon: "🎠" },
};

const ORDER = ["reels", "stories", "posts"] as const;

interface Props {
  items: TopContentItem[];
}

export function TopContent({ items }: Props) {
  const [activeItem, setActiveItem] = useState<{ src: string; label: string; gradient: string; icon: string } | null>(null);

  useEffect(() => {
    if (!activeItem) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActiveItem(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeItem]);

  const byType = new Map(items.map((i) => [i.contentType, i]));
  const ordered = ORDER.map((t) => byType.get(t)).filter(
    (i): i is TopContentItem => i !== undefined
  );

  if (ordered.length === 0) return null;

  return (
    <>
      <section>
        <h2 className="text-xl font-bold text-[#1a1a2e] mb-4">טופ תוכן החודש</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ordered.map((item) => {
            const meta = CONTENT_TYPE_META[item.contentType] ?? {
              label: item.contentType,
              gradient: "from-gray-500 to-gray-400",
              icon: "📄",
            };
            const src = item.driveFileId
              ? `/api/drive-image/${item.driveFileId}`
              : item.screenshotUrl ?? null;

            return (
              <div
                key={item.contentType}
                className="group bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`bg-gradient-to-r ${meta.gradient} p-3 flex items-center gap-2`}>
                  <span className="text-lg">{meta.icon}</span>
                  <span className="text-white font-bold text-sm">{meta.label}</span>
                </div>

                {src && (
                  <button
                    type="button"
                    onClick={() => setActiveItem({ src, label: meta.label, gradient: meta.gradient, icon: meta.icon })}
                    className="block w-full relative aspect-[3/4] bg-[#f8f8fb] cursor-zoom-in"
                    aria-label={`הגדל תמונה: ${meta.label}`}
                  >
                    <Image
                      src={src}
                      alt={meta.label}
                      fill
                      className="object-contain group-hover:scale-[1.02] transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/50 rounded-full p-3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-6 h-6">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                          <path d="M11 8v6M8 11h6" />
                        </svg>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Lightbox */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          onClick={() => setActiveItem(null)}
        >
          {/* header */}
          <div
            className={`flex-shrink-0 bg-gradient-to-r ${activeItem.gradient} flex items-center justify-between px-5 py-3`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{activeItem.icon}</span>
              <span className="text-white font-bold">{activeItem.label}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="text-white/80 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition"
              aria-label="סגור"
            >
              ×
            </button>
          </div>

          {/* image */}
          <div
            className="flex-1 flex items-center justify-center p-4"
            onClick={() => setActiveItem(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeItem.src}
              alt={activeItem.label}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <p className="text-center text-white/40 text-xs pb-4">לחצי מחוץ לתמונה לסגירה · ESC</p>
        </div>
      )}
    </>
  );
}
