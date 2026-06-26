"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Testimonial } from "@/lib/db";

const defaultTestimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Mollie Pereira",
    role: "Student",
    content: "The school provides an excellent learning environment. Security on campus is very good, making students feel safe. There are many extracurricular activities that keep students engaged and active. The faculty is highly specialized and professional, ensuring quality education.",
    rating: 5,
  },
  {
    id: "t2",
    name: "Samman Mishra",
    role: "Parent",
    content: "An excellent educational experience with a strong emphasis on quality learning and holistic development. The school helped students grow not only academically but also through sports, life skills and personality development.",
    rating: 5,
  },
  {
    id: "t3",
    name: "R K Tiwari",
    role: "Parent",
    content: "Professional faculty, relevant curriculum, resourceful library and a safe learning environment. Clean facilities and multiple opportunities help students achieve their full potential.",
    rating: 5,
  },
];

interface TestimonialsProps {
  items?: Testimonial[];
}

export default function Testimonials({ items }: TestimonialsProps) {
  const reviews = items && items.length > 0 ? items : defaultTestimonials;
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };

  const handlePrev = () => {
    setIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length);
  };

  return (
    <section className="py-16 md:py-20 bg-slate-50 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        {/* Section Heading */}
        <div className="mb-12">
          <span className="text-brand-red-700 text-xs sm:text-sm font-extrabold uppercase tracking-widest block mb-3">
            Voices of Our Community
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-5xl text-navy-900 tracking-tight">
            What Our Families Say
          </h2>
          <div className="h-[3px] bg-brand-red-700 w-20 mx-auto mt-5 rounded-full" />
        </div>

        {/* Carousel Container Card */}
        <div className="relative bg-white rounded-xl border border-slate-100 p-8 sm:p-12 shadow-sm min-h-[320px] sm:min-h-[280px] flex flex-col justify-between overflow-hidden">
          
          {/* Quote Mark Decoration */}
          <div className="text-gold-500/10 absolute top-8 left-8">
            <Quote size={64} className="fill-current" />
          </div>

          <div className="relative z-10 flex-grow flex flex-col justify-center items-center">
            
            {/* Review Stars */}
            <div className="flex gap-1 mb-6">
              {[...Array(reviews[index].rating || 5)].map((_, i) => (
                <Star key={i} size={14} className="text-gold-500 fill-gold-500" />
              ))}
            </div>

            {/* Testimonial Quote */}
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl text-left sm:text-center animate-fade-in"
              >
                <p className="text-slate-800 text-sm sm:text-base md:text-lg font-normal leading-relaxed italic">
                  "{reviews[index].content}"
                </p>

                <div className="mt-8">
                  <h4 className="font-serif font-bold text-navy-900 text-base sm:text-lg">
                    {reviews[index].name}
                  </h4>
                  <span className="text-gold-600 text-xs font-bold uppercase tracking-wider mt-1 block">
                    {reviews[index].role}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slider Controls */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 z-10">
            {/* Slide Indicators */}
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-brand-red-700" : "bg-slate-200"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Chevrons */}
            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full border border-slate-200 hover:border-brand-red-700 hover:text-brand-red-700 text-navy-900 flex items-center justify-center transition-colors focus:outline-none"
                aria-label="Previous review"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full border border-slate-200 hover:border-brand-red-700 hover:text-brand-red-700 text-navy-900 flex items-center justify-center transition-colors focus:outline-none"
                aria-label="Next review"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
