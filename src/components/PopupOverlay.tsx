"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { getActivePopupAction } from "@/app/actions";
import { Popup } from "@/lib/db";

export default function PopupOverlay() {
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    async function loadPopup() {
      try {
        const popup = await getActivePopupAction();
        if (!popup) return;

        // Check local storage 24-hour block
        const dontShowUntil = localStorage.getItem(`dont_show_popup_${popup.id}`);
        const now = Date.now();
        if (dontShowUntil && now < parseInt(dontShowUntil, 10)) {
          return;
        }

        // Show after 1 second delay
        const timer = setTimeout(() => {
          setActivePopup(popup);
          setIsOpen(true);
          document.body.style.overflow = "hidden";
        }, 1000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Failed to load active popup:", error);
      }
    }
    loadPopup();

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
    
    if (dontShowAgain && activePopup) {
      const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      localStorage.setItem(`dont_show_popup_${activePopup.id}`, expiry.toString());
    }
  };

  if (!activePopup) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-navy-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", duration: 0.45 }}
            className={`relative z-10 w-full shadow-2xl ${
              activePopup.type === "image" ? "max-w-[1000px] w-[92%] md:w-[85%]" : "max-w-[550px] w-[92%]"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`absolute top-4 right-4 z-20 p-2 rounded-full border shadow-md transition-all duration-300 ${
                activePopup.type === "image"
                  ? "bg-black/40 hover:bg-black/60 border-white/20 text-white"
                  : "bg-white hover:bg-slate-50 border-slate-100 text-slate-500 hover:text-navy-950"
              }`}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Image Popup Layout */}
            {activePopup.type === "image" && (
              <div className="flex flex-col items-center">
                {activePopup.imageUrl ? (
                  <div className="w-full rounded-[20px] overflow-hidden border border-white/10 shadow-2xl bg-black/20">
                    {activePopup.buttonLink ? (
                      <a
                        href={activePopup.buttonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block cursor-pointer w-full h-full animate-fadeIn"
                      >
                        <img
                          src={activePopup.imageUrl}
                          alt="Special Update"
                          loading="lazy"
                          className="w-full h-auto max-h-[75vh] object-contain mx-auto"
                        />
                      </a>
                    ) : (
                      <img
                        src={activePopup.imageUrl}
                        alt="Special Update"
                        loading="lazy"
                        className="w-full h-auto max-h-[75vh] object-contain mx-auto animate-fadeIn"
                      />
                    )}
                  </div>
                ) : (
                  <div className="bg-white/80 p-8 rounded-[20px] text-center w-full">
                    <p className="text-slate-500 text-xs">No image configured.</p>
                  </div>
                )}

                {/* Optional "Don't show again today" checkbox below image */}
                <div className="mt-3.5 flex items-center justify-center gap-2 text-white/95 text-xs select-none">
                  <label className="flex items-center gap-2 bg-navy-950/75 border border-white/10 px-4.5 py-2.5 rounded-full backdrop-blur-md cursor-pointer hover:bg-navy-950 transition-colors shadow-md">
                    <input
                      type="checkbox"
                      checked={dontShowAgain}
                      onChange={(e) => setDontShowAgain(e.target.checked)}
                      className="rounded border-slate-300 text-gold-500 focus:ring-gold-500 h-3.5 w-3.5 bg-white/5 cursor-pointer accent-gold-500"
                    />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      Don't show again today
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Emergency Notice Layout */}
            {activePopup.type === "emergency" && (
              <div className="flex flex-col items-center animate-fadeIn">
                <div className="relative w-full rounded-[20px] overflow-hidden bg-white shadow-2xl border-2 border-brand-red-700/30 p-6 md:p-8 text-left">
                  <div className="flex items-center gap-2 text-brand-red-700 font-extrabold uppercase text-xs tracking-wider mb-4.5">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-red-700"></span>
                    </div>
                    <AlertTriangle size={16} />
                    Emergency Notice
                  </div>

                  <h3 className="font-serif text-2xl text-navy-950 leading-tight mb-3">
                    {activePopup.heading}
                  </h3>
                  <p className="text-slate-700 text-xs leading-relaxed font-medium bg-red-50/50 p-4 rounded-xl border border-red-100/30 whitespace-pre-line">
                    {activePopup.message}
                  </p>
                </div>

                {/* Optional "Don't show again today" checkbox below alert */}
                <div className="mt-3.5 flex items-center justify-center gap-2 text-white/95 text-xs select-none">
                  <label className="flex items-center gap-2 bg-navy-950/75 border border-white/10 px-4.5 py-2.5 rounded-full backdrop-blur-md cursor-pointer hover:bg-navy-950 transition-colors shadow-md">
                    <input
                      type="checkbox"
                      checked={dontShowAgain}
                      onChange={(e) => setDontShowAgain(e.target.checked)}
                      className="rounded border-slate-300 text-gold-500 focus:ring-gold-500 h-3.5 w-3.5 bg-white/5 cursor-pointer accent-gold-500"
                    />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      Don't show again today
                    </span>
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
