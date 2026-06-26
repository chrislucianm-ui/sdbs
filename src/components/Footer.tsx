"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, School } from "lucide-react";

interface FooterProps {
  schoolName: string;
  schoolSubName: string;
  schoolLogo: string;
  copyrightText: string;
}

export default function Footer({ schoolName, schoolSubName, schoolLogo, copyrightText }: FooterProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  const getHref = (href: string) => {
    if (href.startsWith("/")) return href;
    if (isHomepage) return href;
    if (href === "#") return "/";
    return "/" + href;
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-slate-50 border-t border-slate-200 py-12 md:py-16 overflow-hidden">
      {/* Scroll Progress Indicator */}
      <ScrollProgressBar />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-slate-200">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-gold-500/30 bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0">
              <img 
                src={schoolLogo} 
                alt={`${schoolName} Logo`} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.currentTarget.src = "/logo.jpg";
                }}
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif font-bold tracking-widest text-xs uppercase text-navy-900">
                {schoolName}
              </span>
              <span className="font-sans text-[10px] tracking-wide text-slate-800 uppercase font-bold">
                {schoolSubName}
              </span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link href={getHref("#about")} className="text-xs uppercase tracking-wider text-slate-800 hover:text-gold-600 font-bold transition-colors">About</Link>
            <Link href={getHref("#announcements")} className="text-xs uppercase tracking-wider text-slate-800 hover:text-gold-600 font-bold transition-colors">Updates</Link>
            <Link href={getHref("#why-choose-us")} className="text-xs uppercase tracking-wider text-slate-800 hover:text-gold-600 font-bold transition-colors">Features</Link>
            <Link href={getHref("#academics")} className="text-xs uppercase tracking-wider text-slate-800 hover:text-gold-600 font-bold transition-colors">Academics</Link>
            <Link href={getHref("#student-life")} className="text-xs uppercase tracking-wider text-slate-800 hover:text-gold-600 font-bold transition-colors">Student Life</Link>
            <Link href={getHref("#campus")} className="text-xs uppercase tracking-wider text-slate-800 hover:text-gold-600 font-bold transition-colors">Campus Tour</Link>
            <Link href={getHref("#admissions")} className="text-xs uppercase tracking-wider text-slate-800 hover:text-gold-600 font-bold transition-colors">Admissions</Link>
            <Link href={getHref("#contact")} className="text-xs uppercase tracking-wider text-slate-800 hover:text-gold-600 font-bold transition-colors">Contact</Link>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-center sm:text-left">
          <p className="text-[11px] text-slate-700 font-bold">
            {copyrightText}
          </p>
          <p className="text-[11px] text-slate-600 font-bold flex gap-4">
            <Link href={isHomepage ? "#" : "/"} className="hover:text-gold-600 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href={isHomepage ? "#" : "/"} className="hover:text-gold-600 transition-colors">Terms of Use</Link>
          </p>
        </div>
      </div>

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-24 z-40 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 hover:border-gold-500 text-navy-900/80 hover:text-gold-600 flex items-center justify-center transition-all duration-300 shadow-md scale-100 hover:scale-105 focus:outline-none"
          aria-label="Scroll to top"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </footer>
  );
}

function ScrollProgressBar() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const pct = (window.scrollY / scrollHeight) * 100;
        setWidth(pct);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] bg-slate-100 z-50 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-brand-red-800 via-brand-red-600 to-gold-500 transition-all duration-100 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
