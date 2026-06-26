"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  ShieldAlert, 
  Home, 
  User, 
  Bell, 
  Star, 
  BookOpen, 
  Users, 
  Video, 
  Clipboard, 
  Phone, 
  Shield 
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface HeaderProps {
  schoolName?: string;
  schoolSubName?: string;
  schoolLogo?: string;
  admissionsBtnText?: string;
}

export default function Header({
  schoolName = "ST. D.B. INTER COLLEGE",
  schoolSubName = "ST. JOHN BOSCO SCHOOL",
  schoolLogo = "/logo.jpg",
  admissionsBtnText = "Admissions Open",
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll and hide other page components when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("mobile-menu-active");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("mobile-menu-active");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("mobile-menu-active");
    };
  }, [isMobileMenuOpen]);

  // Listen for ESC key to close the mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsMobileMenuOpen(false);
    }
  };

  const getHref = (href: string) => {
    if (href.startsWith("/")) return href;
    if (isHomepage) return href;
    if (href === "#") return "/";
    return "/" + href;
  };

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "About", href: "#about" },
    { name: "Updates", href: "#announcements" },
    { name: "Why Us", href: "#why-choose-us" },
    { name: "Academics", href: "#academics" },
    { name: "Student Life", href: "#student-life" },
    { name: "Campus Tour", href: "#campus" },
    { name: "Admissions", href: "#admissions" },
    { name: "Contact", href: "#contact" },
  ];

  const showGlassMobileHeader = isHomepage && !isScrolled;

  const mobileNavLinks = [
    { name: "Home", href: "#", icon: Home },
    { name: "About", href: "#about", icon: User },
    { name: "Updates", href: "#announcements", icon: Bell, badge: "New" },
    { name: "Why Us", href: "#why-choose-us", icon: Star },
    { name: "Academics", href: "#academics", icon: BookOpen },
    { name: "Student Life", href: "#student-life", icon: Users },
    { name: "Campus Tour", href: "#campus", icon: Video },
    { name: "Admissions", href: "#admissions", icon: Clipboard },
    { name: "Contact", href: "#contact", icon: Phone },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    setTimeout(() => {
      const targetHref = getHref(href);
      if (targetHref.startsWith("#") || (isHomepage && targetHref.startsWith("/#"))) {
        const id = targetHref.replace(/^\/?#/, "");
        if (id) {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            return;
          }
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.location.href = targetHref;
      }
    }, 350);
  };

  const panelVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: {
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
    exit: {
      x: "100%",
      transition: {
        duration: 0.25,
        ease: [0.7, 0, 0.84, 0] as [number, number, number, number],
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 25 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 150,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      x: 15,
      transition: {
        duration: 0.15,
      },
    },
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? "bg-white/85 backdrop-blur-md py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-slate-200/50" 
        : showGlassMobileHeader
          ? "bg-white lg:bg-white py-4 border-b border-slate-100 max-lg:bg-white/15 max-lg:backdrop-blur-md max-lg:border-b-white/10"
          : "bg-white py-4 border-b border-slate-100"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Left Side: Logo and Brand */}
        <Link href={isHomepage ? "#" : "/"} className="flex items-center gap-3.5 group shrink-0">
          <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-transparent overflow-hidden shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100/50">
            <img 
              src={schoolLogo} 
              alt={`${schoolName} Logo`} 
              className="w-full h-full object-cover rounded-full aspect-square" 
              onError={(e) => {
                e.currentTarget.src = "/logo.jpg";
              }}
            />
          </div>
          <div className="flex flex-col text-left">
            <span className={`font-serif font-black tracking-wider text-xs sm:text-[13px] uppercase leading-tight transition-colors duration-300 ${
              showGlassMobileHeader ? "text-navy-900 max-lg:text-white" : "text-navy-900"
            }`}>
              {schoolName}
            </span>
            <span className={`font-sans text-[9px] sm:text-[10px] tracking-widest uppercase font-bold leading-none mt-0.5 transition-colors duration-300 ${
              showGlassMobileHeader ? "text-slate-800 max-lg:text-slate-200" : "text-slate-800"
            }`}>
              {schoolSubName}
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={getHref(link.href)}
              className="text-[11px] uppercase tracking-wider text-navy-950 hover:text-brand-red-600 transition-colors duration-200 font-extrabold"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Side: Admissions Open button & Portal */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <Link
            href="/admin"
            className="text-[11px] uppercase tracking-wider text-slate-700 hover:text-navy-900 flex items-center gap-1.5 transition-colors font-bold"
          >
            <ShieldAlert size={14} className="text-gold-500" />
            Portal
          </Link>
          <Link
            href={getHref("#admissions")}
            className="px-5 py-2.5 bg-brand-red-700 hover:bg-brand-red-800 text-white text-[11px] font-bold uppercase tracking-wider rounded transition-colors duration-300 shadow-sm"
          >
            {admissionsBtnText}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`lg:hidden transition-colors focus:outline-none ${
            showGlassMobileHeader ? "text-navy-900/80 max-lg:text-white" : "text-navy-900/80 hover:text-gold-600"
          }`}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Full Screen Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="lg:hidden fixed inset-0 w-full h-screen bg-slate-900/10 backdrop-blur-xl z-[99999] flex justify-end"
          >
            {/* Panel: Slides in from the right, covers 100% of mobile viewport */}
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full h-full bg-white flex flex-col shadow-2xl relative overflow-hidden"
            >
              {/* Top Bar inside Overlay */}
              <div className="w-full flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
                <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-transparent overflow-hidden shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100/50">
                  <img 
                    src={schoolLogo} 
                    alt={`${schoolName} Logo`} 
                    className="w-full h-full object-cover rounded-full aspect-square" 
                    onError={(e) => {
                      e.currentTarget.src = "/logo.jpg";
                    }}
                  />
                </div>
                
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-800 hover:text-gold-600 focus:outline-none transition-colors"
                  aria-label="Close Menu"
                >
                  <X size={28} strokeWidth={1.5} />
                </button>
              </div>

              {/* Navigation Items aligned to the 24px Left Padding Grid */}
              <div 
                onClick={handleOverlayClick}
                className="flex-1 flex flex-col justify-start px-6 pt-1 pb-6 overflow-y-auto w-full z-10"
              >
                <motion.nav 
                  variants={containerVariants}
                  className="flex flex-col w-full mt-2 gap-0"
                >
                  {mobileNavLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <motion.div 
                        key={link.name} 
                        variants={itemVariants} 
                        className="w-full border-b border-slate-100/75"
                      >
                        <Link
                          href={getHref(link.href)}
                          onClick={(e) => handleLinkClick(e, link.href)}
                          className="flex items-center gap-[18px] w-full h-[60px] hover:bg-gold-50/60 active:bg-gold-100/40 transition-colors px-2 -mx-2 rounded-lg group"
                        >
                          <IconComponent size={24} className="text-brand-red-800 group-hover:scale-105 transition-transform shrink-0" />
                          <span className="text-[12px] sm:text-[13px] uppercase tracking-widest text-navy-950 font-black">
                            {link.name}
                          </span>
                          {link.badge && (
                            <span className="ml-auto px-2.5 py-0.5 bg-[#d4af37] text-white text-[8px] sm:text-[9px] font-black uppercase rounded-full tracking-wider">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Gold Separator Divider */}
                  <motion.div variants={itemVariants} className="w-full py-3">
                    <div className="border-b-2 border-[#d4af37]" />
                  </motion.div>

                  {/* Admin Portal Link */}
                  <motion.div variants={itemVariants} className="w-full">
                    <Link
                      href="/admin"
                      onClick={(e) => handleLinkClick(e, "/admin")}
                      className="flex items-center gap-[18px] w-full h-[60px] hover:bg-gold-50/60 active:bg-gold-100/40 transition-colors px-2 -mx-2 rounded-lg group"
                    >
                      <Shield size={24} className="text-[#d4af37] group-hover:scale-105 transition-transform shrink-0" />
                      <span className="text-[12px] sm:text-[13px] uppercase tracking-widest text-navy-950 font-black">
                        Admin Portal
                      </span>
                    </Link>
                  </motion.div>
                </motion.nav>

                {/* Social Icons - placed exactly 24px below Admin Portal */}
                <div className="flex items-center justify-center gap-8 mt-6 mb-8 w-full z-10 shrink-0">
                  <a href="#" className="text-brand-red-800 hover:text-brand-red-950 transition-colors" aria-label="Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-brand-red-800 hover:text-brand-red-950 transition-colors" aria-label="Instagram">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="#" className="text-brand-red-800 hover:text-brand-red-950 transition-colors" aria-label="YouTube">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.555a3.002 3.002 0 0 0-2.11 2.108C0 8.029 0 12 0 12s0 3.971.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.478 20.5 12 20.5 12 20.5s7.522 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.971 24 12 24 12s0-3.971-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Curved wave at the bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-10 w-full pointer-events-none overflow-hidden shrink-0 z-0">
                <svg 
                  viewBox="0 0 1440 120" 
                  className="absolute bottom-0 left-0 right-0 w-full h-full" 
                  preserveAspectRatio="none"
                >
                  <path 
                    fill="#450a0a" 
                    d="M0,80 C360,120 720,120 1080,80 C1200,66 1320,40 1440,0 L1440,120 L0,120 Z"
                  />
                  <path 
                    fill="#d4af37" 
                    d="M720,85 C1080,85 1200,66 1440,0 L1440,120 L720,120 Z"
                    opacity="0.85"
                  />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
