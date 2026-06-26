"use client";

import { motion } from "framer-motion";
import { Users2, School, GraduationCap, CalendarDays } from "lucide-react";

interface AchievementsProps {
  stats?: {
    key: string;
    value: string;
    label: string;
  }[];
}

const iconMap: Record<string, React.ReactNode> = {
  years: <CalendarDays className="w-5 h-5 text-gold-500" />,
  students: <Users2 className="w-5 h-5 text-gold-500" />,
  teachers: <School className="w-5 h-5 text-gold-500" />,
  success: <GraduationCap className="w-5 h-5 text-gold-500" />,
};

const descMap: Record<string, string> = {
  years: "Providing quality education to Naini since 1978.",
  students: "Mentoring scholars who lead globally across industries.",
  teachers: "Experienced, board-certified senior educators.",
  success: "Securing top success rates in U.P. Board & CBSE exams annually.",
};

const defaultStats = [
  { key: "years", value: "48+", label: "Years of Service" },
  { key: "students", value: "25,000+", label: "Students Educated" },
  { key: "teachers", value: "75+", label: "Faculty Members" },
  { key: "success", value: "100%", label: "Board Pass Rate" },
];

export default function Achievements({ stats = defaultStats }: AchievementsProps) {
  return (
    <section className="py-12 md:py-16 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const icon = iconMap[stat.key] || <GraduationCap className="w-5 h-5 text-gold-500" />;
            const description = descMap[stat.key] || "Academic milestones and institutional excellence.";

            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center text-center group transition-all duration-300 hover:border-brand-red-700/20"
              >
                {/* Icon Container */}
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 group-hover:bg-brand-red-50 group-hover:border-brand-red-200 transition-all">
                  {icon}
                </div>

                {/* Stat Value */}
                <h3 className="font-serif font-black text-3xl sm:text-4xl text-navy-900 tracking-tight mb-2">
                  {stat.value}
                </h3>

                {/* Stat Label */}
                <span className="text-navy-900/80 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-1 font-sans">
                  {stat.label}
                </span>

                {/* Description */}
                <p className="text-slate-800 text-[11px] sm:text-xs font-normal leading-relaxed">
                  {description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
