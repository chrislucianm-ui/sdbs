"use client";

import { motion } from "framer-motion";
import { BookOpen, GraduationCap, CheckCircle2, Landmark, Award } from "lucide-react";

export default function Academics() {
  const upBoardFeatures = [
    "Class I to Class X foundational curriculum following the state board path",
    "Classes XI & XII Science stream (Physics, Chemistry, Biology, Mathematics)",
    "Classes XI & XII Arts stream (History, Civics, Geography, and Humanities)",
    "Rigorous preparation for board examinations with Hindi & English options",
  ];

  const cbseFeatures = [
    "Affiliated with CBSE, New Delhi, exclusively for Classes XI & XII Commerce",
    "Core curriculum focused on Accountancy, Business Studies, and Economics",
    "Practical case-studies, business analysis, and interactive commerce lab work",
    "Integrated prep for CUET, CA Foundation, and university entrance exams",
  ];

  return (
    <section id="academics" className="pt-16 pb-24 md:pt-20 md:pb-28 bg-slate-50 border-t border-slate-100 text-left scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-brand-red-700 text-xs sm:text-sm font-extrabold uppercase tracking-widest block mb-3">
            Curriculum & Affiliations
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-5xl text-navy-900 tracking-tight">
            Academic Programs
          </h2>
          <p className="max-w-3xl mx-auto mt-4 text-sm sm:text-base text-slate-800 font-normal leading-relaxed">
            St. D.B. Inter College & St. John Bosco School offers a dual-track academic system: Class I to Class X and Senior Secondary Science & Arts streams follow the U.P. Board curriculum, while the Senior Secondary Commerce stream is CBSE affiliated.
          </p>
          <div className="h-[3px] bg-brand-red-700 w-20 mx-auto mt-6 rounded-full" />
        </div>

        {/* Dual Program Cards */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Card 1: U.P. Board */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:border-brand-red-700/25 transition-all duration-300"
          >
            <div>
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-red-50 flex items-center justify-center text-brand-red-700 shrink-0">
                  <Landmark size={24} />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-brand-red-50 text-brand-red-700 font-extrabold text-[9px] uppercase tracking-wider">
                    U.P. Board Track
                  </span>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-navy-900 mt-1">
                    U.P. Board Curriculum
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-800 text-xs sm:text-sm font-normal leading-relaxed mb-8">
                Our institution is affiliated with the **Uttar Pradesh Madhyamik Shiksha Parishad (U.P. Board)** from Class I through Class X, and for the Senior Secondary (**Classes XI & XII**) Science and Arts streams. We emphasize rigorous academic discipline, structured preparation, and excellent outcomes in state examinations.
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {upBoardFeatures.map((feat, idx) => (
                  <li key={idx} className="flex gap-3 items-start text-navy-950 text-xs sm:text-sm font-normal">
                    <CheckCircle2 className="w-4 h-4 text-brand-red-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-slate-700 font-extrabold">
                Class I-X & XI-XII (Sci/Arts)
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-red-700 font-extrabold">
                U.P. Board Affiliated
              </span>
            </div>
          </motion.div>

          {/* Card 2: CBSE Commerce */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:border-brand-red-700/25 transition-all duration-300"
          >
            <div>
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-red-50 flex items-center justify-center text-brand-red-700 shrink-0">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-brand-red-50 text-brand-red-700 font-extrabold text-[9px] uppercase tracking-wider">
                    CBSE Track
                  </span>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-navy-900 mt-1">
                    CBSE Commerce Stream
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-800 text-xs sm:text-sm font-normal leading-relaxed mb-8">
                For students seeking national business, financial, and managerial careers, our Senior Secondary Commerce Stream (**Classes XI & XII**) is exclusively affiliated with the **Central Board of Secondary Education (CBSE), New Delhi**. This provides a robust foundation in finance, economics, and business analysis.
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {cbseFeatures.map((feat, idx) => (
                  <li key={idx} className="flex gap-3 items-start text-navy-950 text-xs sm:text-sm font-normal">
                    <CheckCircle2 className="w-4 h-4 text-brand-red-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-slate-700 font-extrabold">
                Classes XI & XII (Commerce)
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-red-700 font-extrabold">
                CBSE Affiliated
              </span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
