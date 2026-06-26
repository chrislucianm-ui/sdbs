import { redirect } from "next/navigation";
import { isAdminAuthenticated, getAdminAnalytics, getSessionUser } from "../../actions";
import * as db from "@/lib/db";
import AdminDashboardClient from "./AdminDashboardClient";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const isAuth = await isAdminAuthenticated();

  if (!isAuth) {
    redirect("/admin");
  }

  const session = await getSessionUser();
  if (!session) {
    redirect("/admin");
  }

  const role = session.role;

  // Fetch initial dashboard data
  const inquiries = await db.getInquiries();
  const notices = await db.getNotices();
  const announcements = await db.getAnnouncements();
  const achievements = await db.getAchievements();
  const gallery = await db.getGallery();
  const homepageContent = await db.getHomepageContent();
  const analytics = await getAdminAnalytics();
  const admissionsConfig = await db.getAdmissionsConfig();
  const contactInfo = await db.getContactInfo();
  const settings = await db.getSettings();
  const popups = await db.getPopups();
  
  // Admin-only logs and users list (loaded if Owner)
  const logs = role === "owner" ? await db.getAuditLogs() : [];
  const notificationLogs = role === "owner" ? await db.getNotificationLogs() : [];
  const users = role === "owner" ? await db.getUsers() : [];

  return (
    <AdminDashboardClient
      userRole={role}
      userName={session.name}
      userUsername={session.username}
      initialInquiries={inquiries}
      initialNotices={notices}
      initialAnnouncements={announcements}
      initialAchievements={achievements}
      initialGallery={gallery}
      initialHomepageContent={homepageContent}
      initialAnalytics={analytics}
      initialSettings={settings}
      initialAdmissionsConfig={admissionsConfig}
      initialContactInfo={contactInfo}
      initialLogs={logs}
      initialNotificationLogs={notificationLogs}
      initialUsers={users}
      initialPopups={popups}
    />
  );
}
