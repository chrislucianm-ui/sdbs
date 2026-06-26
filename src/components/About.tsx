"use client";

import { motion } from "framer-motion";
import { Award, Target, Quote } from "lucide-react";

interface AboutProps {
  directorsMessage?: {
    name: string;
    designation: string;
    message: string;
    signature: string;
    photo: string;
  };
}

const defaultMessage = {
  name: "Sabrina Coutinho",
  designation: "Director",
  message: "Dear Parents, Students and Well-Wishers,\n\nWelcome to ST. D.B. Inter College & St. John Bosco School.\n\nAt our institution, education extends beyond textbooks and examinations. We are committed to nurturing young minds through academic excellence, strong values, discipline, creativity and character development.\n\nOur goal is to create a learning environment where students are encouraged to think independently, act responsibly and grow into confident individuals prepared for future challenges.",
  signature: "Sabrina Coutinho",
  photo: "/director.jpg",
};

export default function About({ directorsMessage = defaultMessage }: AboutProps) {
  return (
    <section id="about" className="relative pt-16 pb-24 md:pt-20 md:pb-28 bg-white overflow-hidden text-left scroll-mt-20">
      {/* Light slate background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(10,37,64,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(10,37,64,0.003)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-brand-red-700 text-xs sm:text-sm font-extrabold uppercase tracking-widest block mb-3">
            FROM THE DESK OF THE DIRECTOR
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-5xl text-navy-900 tracking-tight">
            Director's Message
          </h2>
          <div className="h-[3px] bg-brand-red-700 w-20 mx-auto mt-5 rounded-full" />
        </div>

        {/* Director's Message Block: Modern Card Layout (Photo left, Text right) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_24px_50px_rgba(10,37,64,0.06)] p-6 sm:p-10 md:p-14 lg:p-16 mb-24 relative overflow-hidden">
          {/* Subtle Bosco Red decorative vertical accent strip */}
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-red-700" />
          
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Side: Director's Portrait (Top on Mobile, Left on Desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5 flex justify-center w-full"
            >
              {/* Elegant Portrait Frame with double border and soft shadow */}
              <div className="relative group p-2.5 bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm sm:max-w-md w-full">
                {/* Bosco Red soft glow backdrop */}
                <div className="absolute -inset-1 rounded-3xl bg-brand-red-700 opacity-5 group-hover:opacity-10 blur-md transition-opacity duration-500 pointer-events-none" />
                
                {/* Outer white frame with subtle inner border */}
                <div className="relative rounded-xl overflow-hidden aspect-[3/4] border-[6px] border-white bg-slate-50 shadow-inner">
                  <img
                    src={directorsMessage.photo}
                    alt={`Director ${directorsMessage.name}`}
                    className="w-full h-full object-cover object-[center_top] scale-100 hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      e.currentTarget.src = "/director.jpg";
                    }}
                  />
                  {/* Subtle inner shadow overlay */}
                  <div className="absolute inset-0 border border-black/10 rounded-sm pointer-events-none" />
                </div>
              </div>
            </motion.div>

            {/* Right Side: Message Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="lg:col-span-7 space-y-6 relative"
            >
              {/* Elegant large decorative quote icon near the top */}
              <div className="absolute -top-10 -left-10 text-brand-red-100/30 -z-10 pointer-events-none">
                <Quote size={110} className="fill-current rotate-180" />
              </div>

              <div className="space-y-5 text-slate-900 text-base sm:text-lg font-normal leading-relaxed">
                {directorsMessage.message.split("\n\n").map((para, i) => {
                  if (i === 0 && para.toLowerCase().includes("dear")) {
                    return (
                      <p key={i} className="font-serif font-bold text-navy-900 text-lg sm:text-xl border-l-4 border-brand-red-700 pl-4 mb-6">
                        {para}
                      </p>
                    );
                  }
                  return (
                    <p key={i}>
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Sign-off with cursive signature and text details */}
              <div className="pt-8 border-t border-slate-100 mt-8 space-y-3">
                <p className="text-slate-700 text-xs sm:text-sm font-bold uppercase tracking-wider">
                  Warm Regards,
                </p>
                
                {/* Subtle handwritten-style signature */}
                {directorsMessage.signature && (
                  <div className="py-1">
                    <p 
                      className="text-4xl sm:text-5xl text-brand-red-700 select-none font-medium tracking-wide py-1"
                      style={{ fontFamily: "'Great Vibes', 'Brush Script MT', 'Playwrite', cursive" }}
                    >
                      {directorsMessage.signature}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-navy-900 font-serif font-extrabold text-lg tracking-wide">
                    {directorsMessage.name}
                  </p>
                  <p className="text-brand-red-700 font-serif font-semibold text-sm tracking-wide mt-0.5">
                    {directorsMessage.designation}, ST. D.B. Inter College & St. John Bosco School
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Vision & Mission Cards Row */}
        <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
          
          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 bg-slate-50 border border-slate-100 rounded-xl shadow-sm relative group hover:border-gold-500/25 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-6 text-brand-red-600 shadow-sm">
              <Target size={20} />
            </div>
            <h3 className="font-serif font-bold text-xl text-navy-900 mb-3 tracking-wide">
              Our Vision
            </h3>
            <p className="text-slate-800 text-xs sm:text-sm font-normal leading-relaxed">
              To build an educational ecosystem that nurtures academic excellence, ethical integrity, and progressive leadership values, shaping scholars into responsible global citizens.
            </p>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="p-8 bg-slate-50 border border-slate-100 rounded-xl shadow-sm relative group hover:border-gold-500/25 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-6 text-brand-red-600 shadow-sm">
              <Award size={20} />
            </div>
            <h3 className="font-serif font-bold text-xl text-navy-900 mb-3 tracking-wide">
              Our Mission
            </h3>
            <p className="text-slate-800 text-xs sm:text-sm font-normal leading-relaxed">
              Cultivating intellectual curiosity, supporting physical wellness, and building solid character through structured school discipline and modern smart classroom environments.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
