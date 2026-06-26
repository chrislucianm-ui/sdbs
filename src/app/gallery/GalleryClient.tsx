"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, ChevronLeft, ChevronRight, Play } from "lucide-react";

interface GalleryItem {
  id: string;
  category: "Campus" | "Classrooms" | "Events" | "Sports" | "Students" | "Activities";
  title: string;
  type: "image" | "video";
  url: string;
  description: string;
}

interface GalleryClientProps {
  galleryItems: GalleryItem[];
}

const getYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getThumbnailUrl = (item: GalleryItem) => {
  if (item.type === "video") {
    const ytId = getYoutubeId(item.url);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
    return "/campus.jpg";
  }
  return item.url;
};

const categories = ["All", "Campus", "Classrooms", "Events", "Sports", "Students", "Activities", "Videos"];

export default function GalleryClient({ galleryItems = [] }: GalleryClientProps) {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Native swipe support state variables
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Filter gallery items based on selected category tab
  const filteredItems = galleryItems.filter((item) => {
    if (activeTab === "All") return true;
    if (activeTab === "Videos") return item.type === "video";
    return item.category === activeTab && item.type === "image";
  });

  const openLightbox = (id: string) => {
    const idx = filteredItems.findIndex((item) => item.id === id);
    setLightboxIndex(idx);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showLightboxNext = () => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
  };

  const showLightboxPrev = () => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowRight") {
        showLightboxNext();
      } else if (e.key === "ArrowLeft") {
        showLightboxPrev();
      } else if (e.key === "Escape") {
        closeLightbox();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredItems]);

  // Touch handlers for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      showLightboxNext();
    } else if (isRightSwipe) {
      showLightboxPrev();
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveTab(cat);
                closeLightbox();
              }}
              className={`px-5 py-2 text-xs uppercase tracking-wider font-extrabold rounded-full transition-all border ${
                activeTab === cat
                  ? "bg-brand-red-700 border-brand-red-700 text-white shadow-md scale-102"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:text-navy-900 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="group relative overflow-hidden rounded-xl border border-slate-100 shadow-sm cursor-zoom-in aspect-[4/3] bg-slate-50"
                onClick={() => openLightbox(item.id)}
              >
                {/* Media Thumbnail */}
                <img
                  src={getThumbnailUrl(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                  onError={(e) => {
                    e.currentTarget.src = "/campus.jpg";
                  }}
                />

                {/* Video Play Button Indicator */}
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                    <div className="w-14 h-14 rounded-full bg-brand-red-700/95 text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <Play size={20} className="fill-current ml-1" />
                    </div>
                  </div>
                )}

                {/* Hover Details Panel */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-red-950/90 via-brand-red-950/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-left">
                  <span className="text-gold-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                    {item.category} {item.type === "video" && "• Video"}
                  </span>
                  <h3 className="font-serif font-bold text-base text-white tracking-wide leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-slate-100 text-xs font-normal mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Maximize Icon */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 border border-slate-100 flex items-center justify-center text-navy-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
                  <Maximize2 size={12} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 text-slate-700 text-sm font-bold uppercase tracking-wider">
            No items found under this category.
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredItems[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/98 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Lightbox Header */}
            <div className="flex justify-between items-center text-white w-full max-w-7xl mx-auto z-10">
              <div className="text-left">
                <span className="text-gold-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest block">
                  {filteredItems[lightboxIndex].category} {filteredItems[lightboxIndex].type === "video" && "• Video"}
                </span>
                <h4 className="font-serif font-bold text-sm sm:text-lg mt-1 text-white">
                  {filteredItems[lightboxIndex].title}
                </h4>
              </div>
              <button
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full border border-slate-700 hover:border-gold-500 hover:text-gold-400 flex items-center justify-center transition-colors focus:outline-none bg-black/40 text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Lightbox Media Box */}
            <div className="relative flex-1 flex items-center justify-center p-2 sm:p-12 w-full max-w-5xl mx-auto">
              {filteredItems.length > 1 && (
                <button
                  onClick={showLightboxPrev}
                  className="absolute left-2 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-slate-700 hover:border-gold-500 hover:text-gold-400 bg-black/50 text-white flex items-center justify-center transition-colors z-10 focus:outline-none cursor-pointer"
                  aria-label="Previous Image"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {filteredItems[lightboxIndex].type === "video" ? (
                (() => {
                  const ytId = getYoutubeId(filteredItems[lightboxIndex].url);
                  if (ytId) {
                    return (
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                        title={filteredItems[lightboxIndex].title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full max-h-[70vh] aspect-video rounded-xl shadow-2xl border border-slate-800"
                      />
                    );
                  }
                  return (
                    <video
                      controls
                      autoPlay
                      src={filteredItems[lightboxIndex].url}
                      className="max-h-[72vh] max-w-full rounded shadow-xl object-contain border border-slate-900"
                    />
                  );
                })()
              ) : (
                <motion.img
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  src={filteredItems[lightboxIndex].url}
                  alt={filteredItems[lightboxIndex].title}
                  className="max-h-[70vh] sm:max-h-[80vh] max-w-full rounded shadow-2xl object-contain border border-slate-900 bg-slate-950"
                  onError={(e) => {
                    e.currentTarget.src = "/campus.jpg";
                  }}
                />
              )}

              {filteredItems.length > 1 && (
                <button
                  onClick={showLightboxNext}
                  className="absolute right-2 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-slate-700 hover:border-gold-500 hover:text-gold-400 bg-black/50 text-white flex items-center justify-center transition-colors z-10 focus:outline-none cursor-pointer"
                  aria-label="Next Image"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Lightbox Footer */}
            <div className="text-center text-slate-200 text-xs font-normal py-2 w-full max-w-3xl mx-auto leading-relaxed">
              {filteredItems[lightboxIndex].description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
