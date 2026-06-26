"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  MonitorPlay, 
  Trophy, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  UserCheck 
} from "lucide-react";

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: <Users className="w-5 h-5 text-brand-red-600" />,
      title: "Experienced Faculty",
      description: "Mentorship by certified, senior educators dedicated to individual learning growth.",
    },
    {
      icon: <MonitorPlay className="w-5 h-5 text-brand-red-600" />,
      title: "Well Structured Environment",
      description: "Smart classrooms integrated with digital learning tools for enhanced engagement.",
    },
    {
      icon: <Trophy className="w-5 h-5 text-brand-red-600" />,
      title: "Sports & Physical Dev",
      description: "Football, cricket, and tracking programs promoting fitness and team spirit.",
    },
    {
      icon: <BookOpen className="w-5 h-5 text-brand-red-600" />,
      title: "Library Resources",
      description: "Extensive reference book suites and digital files supporting board preparation.",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-brand-red-600" />,
      title: "Student Activities",
      description: "Robotics workshops, creative arts, music groups, and debate symposia.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-brand-red-600" />,
      title: "Safe & Disciplined Campus",
      description: "Fostering time management, accountability, respect, and round-the-clock safety.",
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-brand-red-600" />,
      title: "Academic Excellence",
      description: "A solid history of high success averages in secondary board examinations.",
    },
    {
      icon: <UserCheck className="w-5 h-5 text-brand-red-600" />,
      title: "Personality Development",
      description: "Mentoring critical thinking, speech confidence, and leadership values.",
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section id="why-choose-us" className="pt-16 pb-24 md:pt-20 md:pb-28 bg-slate-50 border-y border-slate-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-brand-red-700 text-xs sm:text-sm font-extrabold uppercase tracking-widest block mb-3">
            Institutional Advantages
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-5xl text-navy-900 tracking-tight">
            Why Parents Choose Us
          </h2>
          <div className="h-[3px] bg-brand-red-700 w-20 mx-auto mt-5 rounded-full" />
        </div>

        {/* 8-Card Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/30 hover:shadow-md flex flex-col items-start text-left"
            >
              {/* Icon Container */}
              <div className="w-10 h-10 rounded-lg bg-brand-red-50 flex items-center justify-center mb-5">
                {reason.icon}
              </div>
              
              {/* Content */}
              <h3 className="font-serif font-bold text-base sm:text-lg text-navy-900 mb-2.5 tracking-wide">
                {reason.title}
              </h3>
              <p className="text-slate-800 text-xs sm:text-sm font-normal leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
