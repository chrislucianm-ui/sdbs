"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Eye, Pin, Calendar, Search, SlidersHorizontal, AlertCircle, RefreshCw } from "lucide-react";
import { Notice } from "@/lib/db";

interface AnnouncementsClientProps {
  initialAnnouncements: Notice[];
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
    month: "long",
    year: "numeric",
  });
}

export default function AnnouncementsClient({ initialAnnouncements = [] }: AnnouncementsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(6);

  const categories = ["all", "academic", "event", "admission", "general"];

  // Filter announcements by search query and category tab
  const filteredAnnouncements = initialAnnouncements.filter((a) => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === "all" || a.type === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const visibleAnnouncements = filteredAnnouncements.slice(0, visibleCount);
  const hasMore = filteredAnnouncements.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
    setVisibleCount(6);
  };

  return (
    <div className="py-12 md:py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Breadcrumb & Title */}
        <div className="text-left mb-10">
          <span className="text-brand-red-700 text-xs sm:text-sm font-extrabold uppercase tracking-widest block mb-2">
            CAMPUS HIGHLIGHTS
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-navy-900 tracking-tight">
            School Announcements
          </h1>
          <div className="h-[3px] bg-brand-red-700 w-16 mt-4 rounded-full" />
        </div>

        {/* Search & Filter Bar Component */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-10">
          {/* Search box */}
          <div className="relative w-full md:max-w-md shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search announcements title or detail..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(6); // Reset pagination on search
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-red-700 font-semibold"
            />
          </div>

          {/* Filter badges */}
          <div className="flex flex-wrap gap-2 justify-end w-full">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold uppercase tracking-wider mr-2">
              <SlidersHorizontal size={14} />
              <span>Filters:</span>
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveFilter(cat);
                  setVisibleCount(6); // Reset pagination on tab change
                }}
                className={`px-4 py-2 text-[10px] sm:text-xs uppercase tracking-wider font-extrabold rounded-full transition-all border ${
                  activeFilter === cat
                    ? "bg-brand-red-700 border-brand-red-700 text-white shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:text-navy-900 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements Cards Grid */}
        <motion.div 
          layout 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {visibleAnnouncements.map((ann) => {
              const colors = typeColors[ann.type] || typeColors.general;
              const hasPdf = !!ann.pdfUrl && ann.pdfUrl.trim() !== "";

              return (
                <motion.div
                  layout
                  key={ann.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-white p-6 rounded-2xl border flex flex-col justify-between shadow-sm relative transition-all duration-300 hover:shadow-md hover:border-slate-350 ${
                    ann.isPinned 
                      ? "border-gold-500/50 bg-gold-500/[0.01]" 
                      : "border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      {/* Notice Category Badge */}
                      <span className={`px-2.5 py-0.5 rounded border text-[9px] font-extrabold uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border}`}>
                        {ann.type}
                      </span>

                      {/* Pin Tag */}
                      {ann.isPinned && (
                        <span className="flex items-center gap-1 text-gold-600 font-extrabold text-[10px] uppercase tracking-wider">
                          <Pin size={10} className="fill-current" />
                          Pinned
                        </span>
                      )}
                    </div>

                    {/* Publish Date */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-750 font-bold mb-3">
                      <Calendar size={12} className="text-slate-600" />
                      <span>{formatDate(ann.date)}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif font-bold text-base sm:text-lg text-navy-900 mb-3 tracking-wide leading-snug">
                      {ann.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-800 text-xs sm:text-sm font-normal leading-relaxed mb-6 whitespace-pre-line">
                      {ann.content}
                    </p>
                  </div>

                  {/* PDF Download Section */}
                  <div className="pt-4 border-t border-slate-200 mt-auto">
                    {hasPdf ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        {/* View PDF */}
                        <a
                          href={ann.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-brand-red-700 text-brand-red-700 hover:bg-brand-red-700 hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300"
                          title="View PDF Attachment"
                        >
                          <Eye size={12} />
                          <span>View PDF</span>
                        </a>

                        {/* Download PDF */}
                        <a
                          href={ann.pdfUrl}
                          download
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-red-700 hover:bg-brand-red-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 shadow-sm"
                          title="Download PDF document"
                        >
                          <Download size={12} />
                          <span>Download</span>
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-normal italic">
                        <AlertCircle size={12} className="text-slate-500 shrink-0" />
                        <span>No PDF document attached.</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty Search State */}
        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-4 max-w-lg mx-auto">
            <AlertCircle size={32} className="text-slate-500" />
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-navy-900">No matching announcements found</h3>
              <p className="text-slate-750 text-xs max-w-xs mx-auto">Try refining your search terms or choosing a different filter tab category.</p>
            </div>
            <button
              onClick={handleResetFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 border border-brand-red-700 text-brand-red-700 hover:bg-brand-red-700 hover:text-white text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all duration-300"
            >
              <RefreshCw size={12} />
              Reset Filters
            </button>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-red-700 hover:bg-brand-red-800 text-white text-xs uppercase tracking-wider font-extrabold rounded-lg shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer"
            >
              <span>Load More Announcements</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
