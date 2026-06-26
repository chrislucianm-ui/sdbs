"use client";

import { Notice } from "@/lib/db";
import { Megaphone } from "lucide-react";

interface NoticesMarqueeProps {
  items: Notice[];
}

export default function NoticesMarquee({ items }: NoticesMarqueeProps) {
  const activeNotices = items.filter((n) => n.isActive);

  if (activeNotices.length === 0) return null;

  return (
    <div className="relative w-full glass-panel-gold border-y border-gold-500/20 py-3 overflow-hidden z-25 flex items-center">
      {/* Label Badge */}
      <div className="absolute left-0 top-0 bottom-0 bg-gold-500 text-navy-950 font-bold uppercase tracking-widest text-[9px] sm:text-xs px-4 flex items-center gap-1.5 z-30 shadow-lg shadow-gold-500/20">
        <Megaphone size={14} className="animate-bounce" />
        <span>Updates</span>
      </div>

      {/* Marquee Content */}
      <div className="flex w-full select-none overflow-hidden pl-24 sm:pl-32">
        <div className="animate-marquee whitespace-nowrap flex gap-12 font-sans font-semibold text-xs tracking-wider text-navy-950">
          {activeNotices.concat(activeNotices).map((notice, index) => (
            <div key={index} className="flex items-center gap-3 shrink-0">
              <span className="px-2 py-0.5 rounded bg-gold-500 text-navy-950 border border-gold-600/30 text-[9px] uppercase font-bold">
                {notice.type}
              </span>
              <span>{notice.title}</span>
              <span className="text-navy-900/85 font-medium">({notice.date})</span>
              <span className="text-gold-500 font-bold ml-6">•</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
