"use client";

import Link from "next/link";
import { FileText, ArrowRight, Bell, Pin, Calendar, AlertCircle } from "lucide-react";
import { Notice } from "@/lib/db";

interface BulletinsPreviewProps {
  notices: Notice[];
  announcements: Notice[];
}

const typeColors: Record<Notice["type"], { bg: string; text: string; border: string }> = {
  academic: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-250" },
  event: { bg: "bg-gold-50", text: "text-gold-700", border: "border-gold-250" },
  admission: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-250" },
  general: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-250" },
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

export default function BulletinsPreview({ notices = [], announcements = [] }: BulletinsPreviewProps) {
  // Take latest 3 active notices
  const latestNotices = notices.slice(0, 3);
  
  // Take latest 3 active announcements
  const latestAnnouncements = announcements.slice(0, 3);

  return (
    <section id="announcements" className="pt-16 pb-24 md:pt-20 md:pb-28 bg-slate-50 border-t border-slate-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-brand-red-700 text-xs sm:text-sm font-extrabold uppercase tracking-widest block mb-3">
            Campus Bulletins
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-5xl text-navy-900 tracking-tight">
            Latest School Updates
          </h2>
          <div className="h-[3px] bg-brand-red-700 w-20 mx-auto mt-5 rounded-full" />
        </div>

        {/* Dashboard Preview Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          
          {/* Left: Notices Panel */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-150">
                <div className="w-10 h-10 rounded-lg bg-brand-red-50 flex items-center justify-center text-brand-red-700 shrink-0 shadow-sm">
                  <Bell size={20} className="animate-swing" />
                </div>
                <div className="text-left">
                  <h3 className="font-serif font-black text-xl text-navy-900 leading-none">School Notices</h3>
                  <span className="text-[10px] text-slate-700 uppercase tracking-widest font-extrabold block mt-1">Official Directives</span>
                </div>
              </div>

              {/* List */}
              <div className="space-y-4 mb-8">
                {latestNotices.length > 0 ? (
                  latestNotices.map((notice) => {
                    const colors = typeColors[notice.type] || typeColors.general;
                    const hasPdf = !!notice.pdfUrl && notice.pdfUrl.trim() !== "";
                    return (
                      <Link
                        key={notice.id}
                        href="/notices"
                        className="group flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-brand-red-700/25 bg-slate-50/50 hover:bg-white transition-all duration-300 text-left items-start cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}>
                              {notice.type}
                            </span>
                            {notice.isPinned && (
                              <span className="flex items-center gap-0.5 text-gold-600 font-extrabold text-[8px] uppercase tracking-wider bg-gold-50 px-1.5 py-0.5 rounded border border-gold-200">
                                <Pin size={8} className="fill-current" />
                                Pin
                              </span>
                            )}
                            <span className="text-[10px] text-slate-700 font-bold ml-auto flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDate(notice.date)}
                            </span>
                          </div>
                          
                          <h4 className="font-serif font-bold text-sm text-navy-900 group-hover:text-brand-red-700 transition-colors line-clamp-1 leading-snug">
                            {notice.title}
                          </h4>
                          <p className="text-slate-800 text-[11px] sm:text-xs font-normal line-clamp-2 mt-1.5 leading-relaxed">
                            {notice.content}
                          </p>
                        </div>

                        {/* PDF attached Indicator */}
                        {hasPdf && (
                          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-brand-red-700 shrink-0 self-center group-hover:bg-brand-red-700 group-hover:text-white transition-all duration-300" title="PDF Attachment Attached">
                            <FileText size={16} />
                          </div>
                        )}
                      </Link>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-750 flex flex-col items-center justify-center gap-2">
                    <AlertCircle size={24} className="text-slate-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">No active notices</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-auto">
              <Link
                href="/notices"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 border border-brand-red-700 text-brand-red-700 hover:bg-brand-red-700 hover:text-white font-extrabold uppercase tracking-wider text-xs rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(185,28,28,0.02)]"
              >
                <span>View All Notices</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Right: Announcements Panel */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-150">
                <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center text-gold-700 shrink-0 shadow-sm">
                  <FileText size={20} className="animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="font-serif font-black text-xl text-navy-900 leading-none">Campus Announcements</h3>
                  <span className="text-[10px] text-slate-700 uppercase tracking-widest font-extrabold block mt-1">Activities & Highlights</span>
                </div>
              </div>

              {/* List */}
              <div className="space-y-4 mb-8">
                {latestAnnouncements.length > 0 ? (
                  latestAnnouncements.map((ann) => {
                    const colors = typeColors[ann.type] || typeColors.general;
                    const hasPdf = !!ann.pdfUrl && ann.pdfUrl.trim() !== "";
                    return (
                      <Link
                        key={ann.id}
                        href="/announcements"
                        className="group flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-brand-red-700/25 bg-slate-50/50 hover:bg-white transition-all duration-300 text-left items-start cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}>
                              {ann.type}
                            </span>
                            {ann.isPinned && (
                              <span className="flex items-center gap-0.5 text-gold-600 font-extrabold text-[8px] uppercase tracking-wider bg-gold-50 px-1.5 py-0.5 rounded border border-gold-200">
                                <Pin size={8} className="fill-current" />
                                Pin
                              </span>
                            )}
                            <span className="text-[10px] text-slate-700 font-bold ml-auto flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDate(ann.date)}
                            </span>
                          </div>
                          
                          <h4 className="font-serif font-bold text-sm text-navy-900 group-hover:text-brand-red-700 transition-colors line-clamp-1 leading-snug">
                            {ann.title}
                          </h4>
                          <p className="text-slate-800 text-[11px] sm:text-xs font-normal line-clamp-2 mt-1.5 leading-relaxed">
                            {ann.content}
                          </p>
                        </div>

                        {/* PDF attached Indicator */}
                        {hasPdf && (
                          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-brand-red-700 shrink-0 self-center group-hover:bg-brand-red-700 group-hover:text-white transition-all duration-300" title="PDF Attachment Attached">
                            <FileText size={16} />
                          </div>
                        )}
                      </Link>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-750 flex flex-col items-center justify-center gap-2">
                    <AlertCircle size={24} className="text-slate-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">No active announcements</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-auto">
              <Link
                href="/announcements"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 border border-brand-red-700 text-brand-red-700 hover:bg-brand-red-700 hover:text-white font-extrabold uppercase tracking-wider text-xs rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(185,28,28,0.02)]"
              >
                <span>View All Announcements</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

        </div>
      </div>
      
      <style jsx global>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(10deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
        }
        .animate-swing:hover {
          animation: swing 1s ease-in-out;
        }
      `}</style>
    </section>
  );
}
