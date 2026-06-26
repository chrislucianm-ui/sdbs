"use client";

import { motion } from "framer-motion";

interface StudentLifeCategory {
  category: string;
  title: string;
  image: string;
  description: string;
  gridClass: string;
}

const categories: StudentLifeCategory[] = [
  {
    category: "Academics",
    title: "Rigorous Academics",
    image: "/classroom.jpg",
    description: "U.P. Board and CBSE aligned curricula fostering deep comprehension and problem solving.",
    gridClass: "md:col-span-6 lg:col-span-4",
  },
  {
    category: "Sports",
    title: "Physical Development",
    image: "/yoga.jpg",
    description: "Gymnastics, physical exercises, and athletic training promoting fitness and balance.",
    gridClass: "md:col-span-6 lg:col-span-4",
  },
  {
    category: "Cultural Activities",
    title: "Creative Expression",
    image: "/bouquet.jpg",
    description: "Music groups, guest felicitations, dramatics plays, and arts exhibitions.",
    gridClass: "md:col-span-12 lg:col-span-4",
  },
  {
    category: "School Events",
    title: "Annual Assemblies",
    image: "/march.jpg",
    description: "Grand student drum band marches and red carpet courtyard assemblies.",
    gridClass: "md:col-span-6",
  },
  {
    category: "Celebrations",
    title: "National Observances",
    image: "/parade.jpg",
    description: "Independence Day parade marching in Naini holding school banners.",
    gridClass: "md:col-span-6",
  },
  {
    category: "Competitions",
    title: "Board & State Contests",
    image: "/pyramid.jpg",
    description: "Human pyramid stunts, yoga displays, and inter-school academic tournaments.",
    gridClass: "md:col-span-6",
  },
  {
    category: "Leadership",
    title: "Student Leadership",
    image: "/scholars.jpg",
    description: "Prefect training, environment cabinets, and volunteer councils.",
    gridClass: "md:col-span-6",
  },
];

export default function StudentLife() {
  return (
    <section id="student-life" className="pt-16 pb-24 md:pt-20 md:pb-28 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-brand-red-700 text-xs sm:text-sm font-extrabold uppercase tracking-widest block mb-3">
            Campus Experience
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-5xl text-navy-900 tracking-tight">
            Student Life at Bosco
          </h2>
          <div className="h-[3px] bg-brand-red-700 w-20 mx-auto mt-5 rounded-full" />
        </div>

        {/* Categories Grid (Hover zoom on real photo, no stock) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {categories.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className={`${item.gridClass} group relative overflow-hidden rounded-xl border border-slate-100 shadow-sm aspect-[4/3] md:aspect-auto md:h-72 cursor-default`}
            >
              {/* Actual Campus Photo served directly */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "/campus.jpg";
                }}
              />
              
              {/* Brand red overlay gradient for high readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-red-950/90 via-brand-red-950/45 to-transparent transition-opacity duration-300 opacity-90" />
              
              {/* Category Pill Tag */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 bg-brand-red-700 text-white font-extrabold text-[9px] uppercase tracking-wider rounded">
                  {item.category}
                </span>
              </div>

              {/* Text overlays */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-left">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-white tracking-wide mb-1.5">
                  {item.title}
                </h3>
                <p className="text-slate-100 text-xs sm:text-sm font-normal leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
