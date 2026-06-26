import * as db from "@/lib/db";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import NoticesMarquee from "@/components/NoticesMarquee";
import BulletinsPreview from "@/components/BulletinsPreview";
import About from "@/components/About";
import WhyChooseUs from "@/components/WhyChooseUs";
import StudentLife from "@/components/StudentLife";
import Academics from "@/components/Academics";
import Achievements from "@/components/Achievements";
import GalleryPreview from "@/components/GalleryPreview";
import Testimonials from "@/components/Testimonials";
import Admissions from "@/components/Admissions";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PopupOverlay from "@/components/PopupOverlay";

export const revalidate = 0;

export default async function Home() {
  const settings = await db.getSettings();
  const contactInfo = await db.getContactInfo();
  const homepageContent = await db.getHomepageContent();
  const admissionsConfig = await db.getAdmissionsConfig();
  const stats = await db.getAchievements();
  const gallery = await db.getGallery();
  const notices = await db.getNotices();
  const announcements = await db.getAnnouncements();
  const testimonials = await db.getTestimonials();

  // Filter out inactive or expired notices & announcements, sort pinned ones first
  const currentDate = new Date().toISOString().split("T")[0];
  
  const activeNotices = notices.filter((n) => {
    if (!n.isActive) return false;
    if (n.expiryDate && n.expiryDate < currentDate) return false;
    return true;
  });
  
  const sortedNotices = activeNotices.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const activeAnnouncements = announcements.filter((a) => {
    if (!a.isActive) return false;
    if (a.expiryDate && a.expiryDate < currentDate) return false;
    return true;
  });

  const sortedAnnouncements = activeAnnouncements.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Combine both notices and announcements for the marquee ticker
  const marqueeItems = [...sortedNotices, ...sortedAnnouncements].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <>
      <Header
        schoolName={settings.schoolName}
        schoolSubName={settings.schoolSubName}
        schoolLogo={settings.schoolLogo}
        admissionsBtnText={homepageContent.admissionsBtnText}
      />
      <main className="flex-1 w-full bg-white overflow-x-hidden">
        {/* Hero Section */}
        <Hero
          heroTitle={homepageContent.heroTitle}
          heroSubtitle={homepageContent.heroSubtitle}
          heroDescription={homepageContent.heroDescription}
          admissionsBtnText={homepageContent.admissionsBtnText}
          academicYear={admissionsConfig.academicYear}
        />
        
        {/* Live Announcements & Notices Ticker Banner */}
        <NoticesMarquee items={marqueeItems} />

        {/* Notices & Announcements Premium Split Preview Dashboard */}
        <BulletinsPreview notices={sortedNotices.slice(0, 3)} announcements={sortedAnnouncements.slice(0, 3)} />

        {/* About Section - Director's Message */}
        <About directorsMessage={homepageContent.directorsMessage} />

        {/* Why Parents Choose Us - Features Grid */}
        <WhyChooseUs />

        {/* Student Life Section - Modular Grid */}
        <StudentLife />

        {/* Academic Programs Section - U.P. Board & CBSE Commerce */}
        <Academics />

        {/* Achievements Section - Statistics Cards */}
        <Achievements stats={stats} />

        {/* Campus Tour - Compact Gallery Preview */}
        <GalleryPreview galleryItems={gallery} />

        {/* Testimonials - Community Carousel */}
        <Testimonials items={testimonials} />

        {/* Admissions Section - Steps and Registration Form */}
        <Admissions admissionsConfig={admissionsConfig} />

        {/* Contact Section - Coordinates, Map and Query Form */}
        <Contact contactInfo={contactInfo} settings={settings} />
      </main>
      <Footer
        schoolName={settings.schoolName}
        schoolSubName={settings.schoolSubName}
        schoolLogo={settings.schoolLogo}
        copyrightText={settings.copyrightText}
      />
      
      {/* Floating Helpline Widget */}
      <WhatsAppButton whatsappNumber={contactInfo.whatsappNumber} />
      
      {/* Frontend popups system */}
      <PopupOverlay />
    </>
  );
}
