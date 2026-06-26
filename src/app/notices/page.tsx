import * as db from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NoticesClient from "./NoticesClient";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Official Bulletins & Notices | St. John Bosco School",
  description: "Browse academic bulletins, state secondary board directives, and general school notices.",
};

export default async function NoticesPage() {
  const settings = await db.getSettings();
  const contactInfo = await db.getContactInfo();
  const homepageContent = await db.getHomepageContent();
  const notices = await db.getNotices();

  const currentDate = new Date().toISOString().split("T")[0];
  const activeNotices = notices.filter((n) => {
    if (!n.isActive) return false;
    if (n.expiryDate && n.expiryDate < currentDate) return false;
    return true;
  });

  const sortedNotices = activeNotices.sort((a, b) => {
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
        <NoticesClient initialNotices={sortedNotices} />
      </main>
      <Footer
        schoolName={settings.schoolName}
        schoolSubName={settings.schoolSubName}
        schoolLogo={settings.schoolLogo}
        copyrightText={settings.copyrightText}
      />
      <WhatsAppButton whatsappNumber={contactInfo.whatsappNumber} />
    </>
  );
}
