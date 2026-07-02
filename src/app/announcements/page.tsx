import * as db from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementsClient from "./AnnouncementsClient";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "School Events & Announcements | St. John Bosco School",
  description: "Read official St. John Bosco School & St. D.B. Inter College announcements, sports achievements, and campus updates.",
  alternates: {
    canonical: "/announcements",
  },
};

export default async function AnnouncementsPage() {
  const settings = await db.getSettings();
  const contactInfo = await db.getContactInfo();
  const homepageContent = await db.getHomepageContent();
  const announcements = await db.getAnnouncements();

  const currentDate = new Date().toISOString().split("T")[0];
  const activeAnnouncements = announcements.filter((a) => {
    if (!a.isActive) return false;
    if (a.expiryDate && a.expiryDate < currentDate) return false;
    return true;
  });

  const sortedAnnouncements = activeAnnouncements.sort((a, b) => {
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
      <main className="flex-1 w-full bg-white pt-20 overflow-x-hidden min-h-[75vh]">
        <AnnouncementsClient initialAnnouncements={sortedAnnouncements} />
      </main>
      <Footer
        schoolName={settings.schoolName}
        schoolSubName={settings.schoolSubName}
        schoolLogo={settings.schoolLogo}
        copyrightText={settings.copyrightText}
      />
      <WhatsAppButton whatsappNumber={contactInfo.whatsappNumber} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://stdbintercollege.org"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Announcements",
                "item": "https://stdbintercollege.org/announcements"
              }
            ]
          })
        }}
      />
    </>
  );
}
