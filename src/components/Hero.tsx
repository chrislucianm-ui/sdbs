"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ArrowRight, Compass } from "lucide-react";

interface HeroProps {
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  admissionsBtnText?: string;
  academicYear?: string;
}

export default function Hero({
  heroTitle = "ST. D.B. INTER COLLEGE",
  heroSubtitle = "ST. JOHN BOSCO SCHOOL",
  heroDescription = "\"48+ Years of Academic Excellence, Character Building and Student Success\"",
  admissionsBtnText = "Admissions Open",
  academicYear,
}: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Performance safeguard for mobile: disable parallax on screen widths < 768px
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Format default uppercase titles to premium mixed case
  const displayTitle = heroTitle === "ST. D.B. INTER COLLEGE" ? "ST. D.B. Inter College" : heroTitle;
  const displaySubtitle = heroSubtitle === "ST. JOHN BOSCO SCHOOL" ? "St. John Bosco School" : heroSubtitle;

  // Parallax transform mapping values (smooth percentage offsets)
  const yBg = useTransform(scrollY, [0, 1000], ["0%", isMobile ? "0%" : "15%"]);
  const opacityBg = useTransform(scrollY, [0, 800], [1, isMobile ? 1 : 0.3]);

  // Framer Motion variants for smooth staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-screen w-full flex items-center justify-start bg-slate-950 overflow-hidden py-32 text-left"
    >
      {/* Full-Screen Campus Background with subtle Parallax */}
      <motion.div
        className="absolute inset-0 z-0 bg-cover bg-center select-none pointer-events-none scale-110"
        style={{
          y: yBg,
          opacity: opacityBg,
          backgroundImage: `url("/campus.jpg")`,
        }}
      />

      {/* Subtle dark gradient overlay behind the text for improved readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent z-[1] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start justify-center"
        >
          {/* Admissions Pill */}
          {academicYear && (
            <motion.div
              variants={itemVariants}
              className="mb-8 px-4 py-1.5 rounded bg-gold-500/10 border border-gold-500/30 backdrop-blur-sm flex items-center gap-2 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gold-400 font-extrabold font-sans">
                {admissionsBtnText} {academicYear}
              </span>
            </motion.div>
          )}

          {/* Large Heading on Two Lines (Reduced size by 20-25% for premium feel) */}
          <motion.div variants={itemVariants} className="flex flex-col items-start select-none">
            <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-[56px] text-white tracking-wide leading-[1.12] mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              {displayTitle}
            </h1>
            <h2 className="font-serif font-black text-2xl sm:text-4xl lg:text-[42px] text-gold-400 tracking-wider leading-[1.12] mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              {displaySubtitle}
            </h2>
          </motion.div>

          {/* Premium Subtitle Quote with gold left border */}
          <motion.div 
            variants={itemVariants}
            className="border-l-[3px] border-gold-500/80 pl-5 py-1 text-left max-w-2xl select-none my-4"
          >
            <p className="text-gold-200/90 font-serif italic text-base sm:text-lg md:text-xl font-normal leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
              {heroDescription}
            </p>
          </motion.div>

          {/* Short Description */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl text-slate-200 text-xs sm:text-sm md:text-base font-normal tracking-wide leading-relaxed font-sans mb-8 select-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
          >
            Nurturing intellect, fostering moral integrity, and inspiring academic distinction. St. John Bosco School and St. D.B. Inter College have dedicated over four decades to guiding scholars on their journey to lifelong success and character development.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-start"
          >
            <a
              href="#admissions"
              className="group px-8 py-3.5 bg-brand-red-700 hover:bg-brand-red-800 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all duration-300 rounded shadow-md w-full sm:w-auto justify-center"
            >
              {admissionsBtnText}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#campus"
              className="group px-8 py-3.5 border border-white/30 bg-black/25 hover:bg-black/40 text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 rounded w-full sm:w-auto justify-center shadow-lg"
            >
              <Compass size={16} className="text-gold-400 group-hover:rotate-12 transition-transform" />
              Explore Campus
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Subtle Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none select-none z-10"
      >
        <span className="text-[9px] uppercase tracking-widest text-slate-300 font-bold">Scroll Down</span>
        <div className="w-[1px] h-6 bg-gradient-to-b from-gold-500 to-transparent rounded" />
      </motion.div>
    </div>
  );
}
