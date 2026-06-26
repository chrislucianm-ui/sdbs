import * as db from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GalleryClient from "./GalleryClient";

export const revalidate = 0;

export default async function GalleryPage() {
  const settings = await db.getSettings();
  const contactInfo = await db.getContactInfo();
  const homepageContent = await db.getHomepageContent();
  const admissionsConfig = await db.getAdmissionsConfig();
  const gallery = await db.getGallery();

  return (
    <>
      <Header
        schoolName={settings.schoolName}
        schoolSubName={settings.schoolSubName}
        schoolLogo={settings.schoolLogo}
        admissionsBtnText={homepageContent.admissionsBtnText}
      />
      
      <main className="flex-1 w-full bg-white overflow-x-hidden pt-[70px]">
        {/* Gallery Hero Banner */}
        <section className="relative bg-gradient-to-r from-brand-red-950 to-brand-red-900 py-16 md:py-24 text-white text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.1),transparent_50%)]" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <span className="text-gold-400 text-xs sm:text-sm font-extrabold uppercase tracking-widest block mb-3">
              Media Archive
            </span>
            <h1 className="font-serif font-black text-4xl sm:text-6xl tracking-tight mb-4">
              School Gallery
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-light max-w-xl mx-auto uppercase tracking-wider leading-relaxed">
              Explore our campus, student achievements, activities, and campus environment.
            </p>
            
            {/* Breadcrumbs */}
            <div className="flex justify-center items-center gap-2 mt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <a href="/" className="hover:text-gold-400 transition-colors">Home</a>
              <span>/</span>
              <span className="text-white">Gallery</span>
            </div>
          </div>
        </section>

        {/* Gallery Interactive Body */}
        <GalleryClient galleryItems={gallery} />
      </main>

      <Footer
        schoolName={settings.schoolName}
        schoolSubName={settings.schoolSubName}
        schoolLogo={settings.schoolLogo}
        copyrightText={settings.copyrightText}
      />
    </>
  );
}
