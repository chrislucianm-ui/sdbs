"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface GalleryItem {
  id: string;
  category: "Campus" | "Classrooms" | "Events" | "Sports" | "Students" | "Activities";
  title: string;
  type: "image" | "video";
  url: string;
  description: string;
}

interface GalleryPreviewProps {
  galleryItems: GalleryItem[];
}

export default function GalleryPreview({ galleryItems = [] }: GalleryPreviewProps) {
  // Filter for only image type items and take the 3 latest (which are at the beginning of the array)
  const previewImages = galleryItems
    .filter((item) => item.type === "image")
    .slice(0, 3);

  return (
    <section id="campus" className="pt-16 pb-20 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        {/* Section Heading */}
        <div className="mb-10">
          <span className="text-brand-red-700 text-xs sm:text-sm font-extrabold uppercase tracking-widest block mb-2">
            Campus Showcase
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-5xl text-navy-900 tracking-tight">
            Our Campus Highlights
          </h2>
          <div className="h-[3px] bg-brand-red-700 w-16 mx-auto mt-4 rounded-full" />
        </div>

        {/* Compact Grid of Clickable Preview Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-5xl mx-auto">
          {previewImages.length > 0 ? (
            previewImages.map((item) => (
              <Link 
                key={item.id}
                href="/gallery"
                className="group relative block overflow-hidden rounded-xl border border-slate-100 shadow-sm aspect-[4/3] bg-slate-50 cursor-pointer"
              >
                {/* Image */}
                <img
                  src={item.url}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/campus.jpg";
                  }}
                />

                {/* Dark Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-red-950/80 via-brand-red-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-left">
                  <span className="text-gold-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-serif font-bold text-sm text-white tracking-wide">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 py-10 text-slate-500 text-sm font-semibold">
              No gallery images uploaded yet.
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red-700 hover:bg-brand-red-800 text-white text-xs uppercase tracking-wider font-extrabold rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-1px] active:translate-y-0"
          >
            <span>View Gallery</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
