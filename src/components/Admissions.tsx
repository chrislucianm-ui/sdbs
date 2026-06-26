"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { submitInquiry } from "@/app/actions";
import { ClipboardCheck, Users, BadgeCheck, Send, Loader2 } from "lucide-react";

interface AdmissionsProps {
  admissionsConfig?: {
    isAdmissionsEnabled: boolean;
    openDate: string;
    closeDate: string;
    academicYear?: string;
  };
}

const defaultAdmissionsConfig = {
  isAdmissionsEnabled: true,
  openDate: "2026-06-10",
  closeDate: "2026-08-31",
  academicYear: "2026-27",
};

function formatDateString(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function Admissions({ admissionsConfig = defaultAdmissionsConfig }: AdmissionsProps) {
  const [formData, setFormData] = useState({
    name: "",
    parentName: "",
    email: "",
    phone: "",
    grade: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionsConfig.isAdmissionsEnabled) {
      setSubmitResult({
        success: false,
        message: "Online admissions are currently closed.",
      });
      return;
    }
    setIsSubmitting(true);
    setSubmitResult(null);

    const res = await submitInquiry(formData);
    setIsSubmitting(false);

    if (res.success) {
      setSubmitResult({
        success: true,
        message: "Thank you! Your admission inquiry has been submitted. Our administrators will contact you shortly.",
      });
      setFormData({ name: "", parentName: "", email: "", phone: "", grade: "", message: "" });
    } else {
      setSubmitResult({
        success: false,
        message: res.error || "Something went wrong. Please check your entries and try again.",
      });
    }
  };

  const steps = [
    {
      step: "Step 01",
      icon: <ClipboardCheck className="w-5 h-5 text-gold-600" />,
      title: "Online Inquiry",
      description: "Submit our short digital form with basic student metrics and parent coordinates.",
    },
    {
      step: "Step 02",
      icon: <Users className="w-5 h-5 text-gold-600" />,
      title: "Interaction",
      description: "Schedule a campus visit and dialogue session to review student aptitude and alignment.",
    },
    {
      step: "Step 03",
      icon: <BadgeCheck className="w-5 h-5 text-gold-600" />,
      title: "Secure Seat",
      description: "Submit certificates, verify transcripts, complete fee formalities, and join Bosco.",
    },
  ];

  return (
    <section id="admissions" className="pt-16 pb-24 md:pt-20 md:pb-28 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          {admissionsConfig.academicYear && (
            <span className="text-brand-red-700 text-xs sm:text-sm font-extrabold uppercase tracking-widest block mb-3">
              Enrollment {admissionsConfig.academicYear}
            </span>
          )}
          <h2 className="font-serif font-black text-3xl sm:text-5xl text-navy-900 tracking-tight">
            Admission Procedure
          </h2>
          <div className="h-[3px] bg-brand-red-700 w-20 mx-auto mt-5 rounded-full" />
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {steps.map((st, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-slate-50 p-8 rounded-xl border border-slate-200 shadow-sm relative group hover:border-gold-500/40 transition-all duration-300 text-left"
            >
              <span className="font-serif font-extrabold text-4xl text-navy-900/10 absolute top-4 right-6 group-hover:text-gold-500/20 transition-colors">
                {st.step}
              </span>
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                {st.icon}
              </div>
              <h3 className="font-serif font-bold text-lg text-navy-900 mb-2 tracking-wide">
                {st.title}
              </h3>
              <p className="text-navy-900/80 text-xs sm:text-sm leading-relaxed font-normal">
                {st.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Guidelines & Registration Form */}
        <div className="grid lg:grid-cols-12 gap-12 items-start mt-12">
          
          {/* Left: Guidelines */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 text-left"
          >
            <h3 className="font-serif font-bold text-2xl text-navy-900 mb-6 tracking-wide">
              Eligibility & Guidelines
            </h3>
            
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="font-serif font-bold text-gold-700 mb-1.5 uppercase tracking-wider text-xs">
                  Primary Divisions (Class I to Class V)
                </h4>
                <p className="text-navy-900/80 text-xs sm:text-sm font-normal leading-relaxed">
                  Basic interactions evaluating verbal competence, motor control, and recognition. Age must match state educational parameters.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="font-serif font-bold text-gold-700 mb-1.5 uppercase tracking-wider text-xs">
                  Middle Divisions (Class VI to Class IX)
                </h4>
                <p className="text-navy-900/80 text-xs sm:text-sm font-normal leading-relaxed">
                  Structured assessment in Mathematics, English, and General Aptitude based on the candidate's previous grade.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="font-serif font-bold text-gold-700 mb-1.5 uppercase tracking-wider text-xs">
                  Secondary Streams (Class XI)
                </h4>
                <p className="text-navy-900/80 text-xs sm:text-sm font-normal leading-relaxed">
                  Direct admission based on board results. Subject stream allocations (Science / Commerce / Humanities) determined by cut-off scores.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Submission Form or Closed Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7 w-full"
          >
            <div className="bg-slate-50 p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-md text-left w-full">
              {!admissionsConfig.isAdmissionsEnabled ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-brand-red-50 text-brand-red-700 border border-brand-red-200 flex items-center justify-center mx-auto shadow-sm">
                    <ClipboardCheck size={28} />
                  </div>
                  <h3 className="font-serif font-black text-2xl text-navy-900">
                    Admissions Closed
                  </h3>
                  <p className="text-navy-900/80 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                    Online inquiry submissions are currently closed. The registration period for the academic session was open from{" "}
                    <strong className="text-navy-900 font-semibold">{formatDateString(admissionsConfig.openDate)}</strong> to{" "}
                    <strong className="text-navy-900 font-semibold">{formatDateString(admissionsConfig.closeDate)}</strong>.
                  </p>
                  <p className="text-slate-800 text-[11px] sm:text-xs">
                    Please get in touch with the admissions office for registration timelines or special consideration queries.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-navy-900 mb-1">
                    Inquire Online
                  </h3>
                  <p className="text-slate-800 text-xs sm:text-sm mb-6 font-semibold">
                    Submit details below. Registration timeline is active from{" "}
                    <span className="text-brand-red-700 font-bold">{formatDateString(admissionsConfig.openDate)}</span> to{" "}
                    <span className="text-brand-red-700 font-bold">{formatDateString(admissionsConfig.closeDate)}</span>.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-slate-800 font-bold">
                          Student Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Mishra"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="px-4 py-3 rounded bg-white border border-slate-200 text-navy-900 placeholder-navy-900/40 text-xs sm:text-sm focus:border-brand-red-700 focus:outline-none transition-colors shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-slate-800 font-bold">
                          Parent/Guardian Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rajendra Mishra"
                          value={formData.parentName}
                          onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                          className="px-4 py-3 rounded bg-white border border-slate-200 text-navy-900 placeholder-navy-900/40 text-xs sm:text-sm focus:border-brand-red-700 focus:outline-none transition-colors shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-slate-800 font-bold">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +91 96957 79756"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="px-4 py-3 rounded bg-white border border-slate-200 text-navy-900 placeholder-navy-900/40 text-xs sm:text-sm focus:border-brand-red-700 focus:outline-none transition-colors shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-slate-800 font-bold">
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. parent@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="px-4 py-3 rounded bg-white border border-slate-200 text-navy-900 placeholder-navy-900/40 text-xs sm:text-sm focus:border-brand-red-700 focus:outline-none transition-colors shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-800 font-bold">
                        Class Applying For *
                      </label>
                      <select
                        required
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        className="w-full px-4 py-3 rounded bg-white border border-slate-200 text-navy-900 placeholder-navy-900/40 text-xs sm:text-sm focus:border-brand-red-700 focus:outline-none transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%25231c4173%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem_auto] bg-[right_1rem_center] bg-no-repeat pr-8 shadow-sm"
                      >
                        <option value="" disabled>Select Grade</option>
                        <option value="Class 1-5">Class I to V</option>
                        <option value="Class 6-8">Class VI to VIII</option>
                        <option value="Class 9">Class IX</option>
                        <option value="Class 11 - Science">Class XI - Science</option>
                        <option value="Class 11 - Commerce">Class XI - Commerce</option>
                        <option value="Class 11 - Humanities">Class XI - Humanities</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-800 font-bold">
                        Additional Message (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Enter transport, hostel, or curricular option queries."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="px-4 py-3 rounded bg-white border border-slate-200 text-navy-900 placeholder-navy-900/40 text-xs sm:text-sm focus:border-brand-red-700 focus:outline-none transition-colors resize-none shadow-sm"
                      />
                    </div>

                    {submitResult && (
                      <div
                        className={`p-4 rounded text-xs sm:text-sm leading-relaxed border ${
                          submitResult.success
                            ? "bg-green-500/10 border-green-500/30 text-green-800"
                            : "bg-red-500/10 border-red-500/30 text-red-800"
                        }`}
                      >
                        {submitResult.message}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-brand-red-700 hover:bg-brand-red-800 text-white font-bold uppercase tracking-wider text-xs sm:text-sm rounded flex items-center justify-center gap-2 transition-colors duration-300 disabled:opacity-50 shadow-md cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting Inquiry...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Inquiry
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
