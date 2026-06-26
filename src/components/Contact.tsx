"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";

interface ContactProps {
  contactInfo: {
    phoneNumbers: string[];
    whatsappNumber: string;
    emails: string[];
    address: string;
    googleMapsLink: string;
    officeTimings: string;
    mapEmbedSrc?: string;
  };
  settings: {
    facebookUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
  };
}

export default function Contact({ contactInfo, settings }: ContactProps) {
  const cleanWaNumber = contactInfo.whatsappNumber.replace(/[^\d]/g, "");
  
  return (
    <section id="contact" className="pt-16 pb-24 md:pt-20 md:pb-28 bg-slate-50 border-t border-slate-100 overflow-hidden text-left scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-brand-red-700 text-xs sm:text-sm font-extrabold uppercase tracking-widest block mb-3">
            Institutional Location
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-5xl text-navy-900 tracking-tight">
            Get in Touch
          </h2>
          <div className="h-[3px] bg-brand-red-700 w-20 mx-auto mt-5 rounded-full" />
        </div>

        {/* Asymmetric 2-Column Layout (7:5 ratio) prioritizing details over map */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Coordinates Details (Left Column - Spans 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="font-serif font-bold text-2xl text-navy-900 mb-6 tracking-wide uppercase text-xs">
              Official Coordinates
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Address - spans full width on mobile/tablet */}
              <div className="flex gap-4 items-start bg-white p-6 rounded-xl border border-slate-100 shadow-sm sm:col-span-2">
                <div className="w-10 h-10 rounded-lg bg-brand-red-50/50 border border-brand-red-100 flex items-center justify-center text-brand-red-700 shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-navy-900 mb-1 uppercase tracking-wider">Campus Address</h4>
                  <p className="text-slate-800 text-xs sm:text-sm font-normal leading-relaxed whitespace-pre-line">
                    {contactInfo.address}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4 items-start bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-brand-red-50/50 border border-brand-red-100 flex items-center justify-center text-brand-red-700 shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-navy-900 mb-1 uppercase tracking-wider">Helpline Channels</h4>
                  <div className="text-slate-800 text-xs sm:text-sm font-normal leading-relaxed space-y-2">
                    {contactInfo.phoneNumbers.map((phone, index) => {
                      const cleanPhone = phone.replace(/[^\d+]/g, "");
                      const isWa = phone.replace(/[^\d]/g, "") === cleanWaNumber;
                      return (
                        <div key={index}>
                          {isWa ? (
                            <>
                              Phone / WhatsApp:{" "}
                              <a
                                href={`https://wa.me/${cleanWaNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-red-700 hover:text-brand-red-800 font-bold transition-colors block mt-0.5"
                              >
                                {phone}
                              </a>
                            </>
                          ) : (
                            <>
                              Helpline:{" "}
                              <a
                                href={`tel:${cleanPhone}`}
                                className="text-brand-red-700 hover:text-brand-red-800 font-bold transition-colors block mt-0.5"
                              >
                                {phone}
                              </a>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4 items-start bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-brand-red-50/50 border border-brand-red-100 flex items-center justify-center text-brand-red-700 shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-navy-900 mb-1 uppercase tracking-wider">Email Channels</h4>
                  <div className="text-slate-800 text-xs sm:text-sm font-normal leading-relaxed space-y-2">
                    {contactInfo.emails.map((email, index) => (
                      <div key={index}>
                        {index === 0 ? "Admissions: " : "General Info: "}
                        <a href={`mailto:${email}`} className="text-brand-red-700 hover:text-brand-red-800 font-bold transition-colors block mt-0.5">
                          {email}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hours - spans full width on mobile/tablet */}
              <div className="flex gap-4 items-start bg-white p-6 rounded-xl border border-slate-100 shadow-sm sm:col-span-2">
                <div className="w-10 h-10 rounded-lg bg-brand-red-50/50 border border-brand-red-100 flex items-center justify-center text-brand-red-700 shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-navy-900 mb-1 uppercase tracking-wider">Office Hours</h4>
                  <p className="text-slate-800 text-xs sm:text-sm font-normal leading-relaxed whitespace-pre-line">
                    {contactInfo.officeTimings}
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp Contact Button & Social Channels */}
            <div className="pt-6 text-left space-y-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <a
                href={`https://wa.me/${cleanWaNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider text-xs sm:text-sm rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.116-2.905-6.994C16.53 1.87 14.048.835 11.412.835 5.972.835 1.55 5.253 1.546 10.693c-.001 1.705.452 3.37 1.31 4.814L1.87 21.08l5.803-1.523zM16.6 13.6c-.25-.125-1.485-.73-1.715-.813-.23-.084-.397-.125-.565.125-.167.25-.648.813-.794.98-.146.167-.292.188-.542.063-.25-.125-1.05-.387-2.007-1.24-.74-.66-1.24-1.475-1.387-1.725-.146-.25-.015-.385.11-.51.112-.112.25-.292.375-.438.125-.146.167-.25.25-.417.083-.167.042-.313-.021-.438-.063-.125-.565-1.354-.773-1.854-.203-.491-.406-.427-.565-.435-.146-.008-.314-.01-.482-.01-.168 0-.441.063-.672.313-.23.25-.879.858-.879 2.093 0 1.236.9 2.427 1.025 2.593.125.167 1.77 2.705 4.29 3.793.6.258 1.067.412 1.43.528.602.19 1.15.163 1.583.099.483-.072 1.486-.607 1.695-1.194.208-.588.208-1.092.146-1.194-.063-.102-.23-.163-.48-.288z" />
                </svg>
                Chat on WhatsApp
              </a>

              <div className="flex gap-4">
                {settings.facebookUrl && settings.facebookUrl !== "#" && (
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-slate-200 hover:border-brand-red-700 hover:text-brand-red-700 flex items-center justify-center text-navy-900/75 bg-white transition-all duration-300" title="Facebook">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h2V1H13c-2.76 0-5 2.24-5 5v2z"/></svg>
                  </a>
                )}
                {settings.youtubeUrl && settings.youtubeUrl !== "#" && (
                  <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-slate-200 hover:border-brand-red-700 hover:text-brand-red-700 flex items-center justify-center text-navy-900/75 bg-white transition-all duration-300" title="Youtube">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
                {settings.instagramUrl && settings.instagramUrl !== "#" && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-slate-200 hover:border-brand-red-700 hover:text-brand-red-700 flex items-center justify-center text-navy-900/75 bg-white transition-all duration-300" title="Instagram">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Compact Google Map Card (Right Column - Spans 5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <h3 className="font-serif font-bold text-2xl text-navy-900 mb-6 tracking-wide uppercase text-xs">
              Campus Location
            </h3>
            
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-md flex flex-col justify-between">
              {/* Map Frame */}
              <div className="w-full h-[350px] rounded-xl overflow-hidden border border-slate-200/60 relative">
                <iframe
                  title="School Location Map"
                  src={contactInfo.mapEmbedSrc || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3603.626786358362!2d81.8761168!3d25.3837965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39854a851f1f619b%3A0x48c035cc90aae415!2sSt.D.B.Inter%20Coll!5e0!3m2!1sen!2sin!4v1718123456789!5m2!1sen!2sin"}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* View Larger Map Button linking to official coordinates */}
              <a
                href={contactInfo.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3.5 inline-flex items-center justify-center gap-2 px-5 py-3 border border-brand-red-700 text-brand-red-700 hover:bg-brand-red-700 hover:text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all duration-300 w-full"
              >
                <MapPin size={14} className="shrink-0" />
                View Larger Map
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
