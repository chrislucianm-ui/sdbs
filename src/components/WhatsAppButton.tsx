"use client";

import { motion } from "framer-motion";

interface WhatsAppButtonProps {
  whatsappNumber: string;
}

export default function WhatsAppButton({ whatsappNumber }: WhatsAppButtonProps) {
  const cleanNumber = whatsappNumber.replace(/[^\d]/g, ""); // Strip out non-digit characters
  const message = "Hello St. John Bosco School Office, I would like to inquire about admissions and registrations.";
  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  return (
    <motion.a
      id="whatsapp-button"
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2.5, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.08 }}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full glass-panel-gold hover:bg-emerald-600 border border-gold-500/30 hover:border-emerald-400 flex items-center justify-center shadow-2xl transition-all duration-300 group hover:shadow-emerald-500/20"
      title="Contact School Office on WhatsApp"
    >
      {/* WhatsApp Custom SVG */}
      <svg
        className="w-7 h-7 text-gold-500 group-hover:text-white transition-colors duration-300"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm5.835-4.275c1.642.975 3.25 1.488 4.793 1.489 5.467-.002 9.911-4.453 9.914-9.923.001-2.651-1.03-5.144-2.903-7.019C15.792 2.397 13.31 1.36 10.662 1.36c-5.47 0-9.916 4.45-9.919 9.921-.001 1.951.516 3.858 1.5 5.568l-1.025 3.738 3.84-1.004zM16.5 13.91c-.3-.15-1.785-.88-2.055-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.18.2-.35.22-.65.07-1.15-.575-1.93-1.025-2.685-2.325-.2-.35-.2-.75-.05-.9.135-.135.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.28.3-1.07 1.05-1.07 2.56s1.1 2.97 1.25 3.17c.15.2 2.165 3.31 5.245 4.64.73.315 1.3.5 1.75.645.74.235 1.41.2 1.94.12.59-.09 1.785-.73 2.035-1.43.25-.7.25-1.29.17-1.43-.08-.13-.3-.21-.6-.36z" />
      </svg>
      {/* Tooltip */}
      <span className="absolute right-16 scale-0 group-hover:scale-100 bg-navy-950 border border-slate-800 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none transition-transform origin-right duration-300">
        Chat Helpline
      </span>
    </motion.a>
  );
}
