"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Eye, Pin, Calendar, AlertCircle } from "lucide-react";
import { Notice } from "@/lib/db";

interface AnnouncementsProps {
  items: Notice[];
}

const typeColors: Record<Notice["type"], { bg: string; text: string; border: string }> = {
  academic: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  event: { bg: "bg-gold-50", text: "text-gold-800", border: "border-gold-200" },
  admission: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  general: { bg: "bg-slate-50", text: "text-slate-800", border: "border-slate-200" },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Announcements({ items = [] }: AnnouncementsProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const categories = ["all", "academic", "event", "admission", "general"];

  const filteredNotices = items.filter((notice) => {
    if (activeFilter === "all") return true;
    return notice.type === activeFilter;
  });

  return (
    <section id="announcements" className="pt-16 pb-24 md:pt-20 md:pb-28 bg-white border-t border-slate-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-brand-red-700 text-xs sm:text-sm font-extrabold uppercase tracking-widest block mb-3">
            Latest Bulletins
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-5xl text-navy-900 tracking-tight">
            Notice Board & Announcements
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-sm sm:text-base text-slate-800 font-normal leading-relaxed">
            Stay updated with official notifications regarding registrations, examinations, extracurricular milestones, and school events.
          </p>
          <div className="h-[3px] bg-brand-red-700 w-20 mx-auto mt-5 rounded-full" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 text-xs uppercase tracking-wider font-extrabold rounded-full transition-all border ${
                activeFilter === cat
                  ? "bg-brand-red-700 border-brand-red-700 text-white shadow-md"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:text-navy-900 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notices Board / Grid */}
        <motion.div 
          layout 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {filteredNotices.map((notice) => {
              const colors = typeColors[notice.type] || typeColors.general;
              const hasPdf = !!notice.pdfUrl && notice.pdfUrl.trim() !== "";

              return (
                <motion.div
                  layout
                  key={notice.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className={`bg-slate-50 p-6 rounded-2xl border flex flex-col justify-between shadow-sm relative transition-all duration-300 hover:shadow-md hover:border-slate-300 ${
                    notice.isPinned 
                      ? "border-gold-500/40 bg-gold-50/5 hover:border-gold-500/60" 
                      : "border-slate-200"
                  }`}
                >
                  {/* Top indicators */}
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      {/* Notice Category Badge */}
                      <span className={`px-2.5 py-0.5 rounded border text-[9px] font-extrabold uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border}`}>
                        {notice.type}
                      </span>

                      {/* Pin Tag */}
                      {notice.isPinned && (
                        <span className="flex items-center gap-1 text-gold-600 font-extrabold text-[10px] uppercase tracking-wider">
                          <Pin size={10} className="fill-current" />
                          Pinned
                        </span>
                      )}
                    </div>

                    {/* Publish Date */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-bold mb-2">
                      <Calendar size={12} className="text-slate-600" />
                      <span>{formatDate(notice.date)}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif font-bold text-lg text-navy-900 mb-3 tracking-wide leading-snug">
                      {notice.title}
                    </h3>

                    {/* Description / Content */}
                    <p className="text-slate-800 text-xs sm:text-sm font-normal leading-relaxed mb-6 whitespace-pre-line">
                      {notice.content}
                    </p>
                  </div>

                  {/* Attachment Section (Bottom Align) */}
                  <div className="pt-4 border-t border-slate-200 mt-auto">
                    {hasPdf ? (
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        {/* View PDF */}
                        <a
                          href={notice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-brand-red-700 text-brand-red-700 hover:bg-brand-red-700 hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300"
                          title="Open PDF in a new tab"
                        >
                          <Eye size={13} />
                          <span>View PDF</span>
                        </a>

                        {/* Download PDF */}
                        <a
                          href={notice.pdfUrl}
                          download
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-brand-red-700 hover:bg-brand-red-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 shadow-sm"
                          title="Download PDF attachment to device"
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs font-normal italic">
                        <AlertCircle size={13} className="text-slate-500 shrink-0" />
                        <span>No PDF document attached.</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredNotices.length === 0 && (
          <div className="text-center py-16 text-slate-700 text-sm font-bold uppercase tracking-wider">
            No notices published under this category.
          </div>
        )}
      </div>
    </section>
  );
}
