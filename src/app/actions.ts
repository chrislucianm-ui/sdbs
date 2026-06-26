"use server";

import { cookies } from "next/headers";
import crypto from "crypto";
import * as db from "@/lib/db";
import { validateInquiryInput, sanitizeInput, validatePhone, validatePopupInput } from "@/lib/validation";
import { sendTwilioSMS, sendTwilioWhatsApp } from "@/lib/notifications";


// Secure Hashing
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Session Helpers
export async function getSessionUser(): Promise<{ username: string; role: "owner" | "principal"; name: string } | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "true") return null;

  const usernameCookie = cookieStore.get("admin_user");
  const roleCookie = cookieStore.get("admin_role");
  
  if (!usernameCookie || !roleCookie) return null;

  // Verify username exists in DB
  const users = await db.getUsers();
  const user = users.find(u => u.username === usernameCookie.value);
  if (!user || user.role !== roleCookie.value) return null;

  return {
    username: user.username,
    role: user.role,
    name: user.name
  };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const user = await getSessionUser();
  return !!user;
}

export async function getAdminRole(): Promise<"owner" | "principal" | null> {
  const user = await getSessionUser();
  return user ? user.role : null;
}

// Mutating Actions & RBAC checks

// Login / Logout
export async function loginAdmin(
  password: string,
  role: "owner" | "principal"
): Promise<{ success: boolean; error?: string }> {
  const users = await db.getUsers();
  // Find users that match this role
  const user = users.find(u => u.role === role);
  if (!user) {
    return { success: false, error: "No user configured for this role." };
  }

  const hashed = hashPassword(password);
  
  // Find specific user match or use the hashed password
  const matchedUser = users.find(u => u.role === role && u.passwordHash === hashed);
  if (matchedUser) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });
    cookieStore.set("admin_user", matchedUser.username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2,
      path: "/",
    });
    cookieStore.set("admin_role", matchedUser.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2,
      path: "/",
    });

    await db.addAuditLog(matchedUser.username, matchedUser.role, "LOGIN", "Logged into admin portal");
    return { success: true };
  }

  return { success: false, error: "Invalid passcode for the selected role." };
}

export async function logoutAdmin(): Promise<void> {
  const user = await getSessionUser();
  if (user) {
    await db.addAuditLog(user.username, user.role, "LOGOUT", "Logged out from admin portal");
  }
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  cookieStore.delete("admin_user");
  cookieStore.delete("admin_role");
}

// User Management Actions (Owner only)
export async function getUsersAction() {
  const session = await getSessionUser();
  if (!session || session.role !== "owner") {
    throw new Error("Unauthorized: Requires Owner role.");
  }
  return await db.getUsers();
}

export async function addUserAction(username: string, name: string, role: "owner" | "principal", password: string) {
  const session = await getSessionUser();
  if (!session || session.role !== "owner") {
    throw new Error("Unauthorized: Requires Owner role.");
  }

  const cleanUsername = sanitizeInput(username).toLowerCase();
  const cleanName = sanitizeInput(name);

  if (!cleanUsername || !cleanName || !password) {
    return { success: false, error: "Username, Name and Password are required." };
  }

  const users = await db.getUsers();
  if (users.some(u => u.username === cleanUsername)) {
    return { success: false, error: "Username already exists." };
  }

  const newUser: db.User = {
    username: cleanUsername,
    name: cleanName,
    role,
    passwordHash: hashPassword(password)
  };

  users.push(newUser);
  await db.saveUsers(users);
  await db.addAuditLog(session.username, session.role, "USER_CREATE", `Created user ${cleanUsername} (${role})`);
  
  return { success: true };
}

export async function deleteUserAction(username: string) {
  const session = await getSessionUser();
  if (!session || session.role !== "owner") {
    throw new Error("Unauthorized: Requires Owner role.");
  }

  const cleanUsername = sanitizeInput(username).toLowerCase();
  if (cleanUsername === session.username) {
    return { success: false, error: "You cannot delete your own account." };
  }
  if (cleanUsername === "admin") {
    return { success: false, error: "You cannot delete the primary admin account." };
  }

  let users = await db.getUsers();
  const initialLength = users.length;
  users = users.filter(u => u.username !== cleanUsername);
  
  if (users.length === initialLength) {
    return { success: false, error: "User not found." };
  }

  await db.saveUsers(users);
  await db.addAuditLog(session.username, session.role, "USER_DELETE", `Deleted user ${cleanUsername}`);
  
  return { success: true };
}

export async function resetUserPasswordAction(username: string, newPass: string) {
  const session = await getSessionUser();
  if (!session || session.role !== "owner") {
    throw new Error("Unauthorized: Requires Owner role.");
  }

  const cleanUsername = sanitizeInput(username).toLowerCase();
  if (!newPass || newPass.trim().length < 4) {
    return { success: false, error: "Password must be at least 4 characters long." };
  }

  const users = await db.getUsers();
  const userIdx = users.findIndex(u => u.username === cleanUsername);
  if (userIdx === -1) {
    return { success: false, error: "User not found." };
  }

  users[userIdx].passwordHash = hashPassword(newPass);
  await db.saveUsers(users);
  await db.addAuditLog(session.username, session.role, "PASSWORD_RESET", `Reset password for ${cleanUsername}`);
  
  return { success: true };
}

// Inquiries Server Actions
export async function submitInquiry(data: {
  name: string;
  parentName: string;
  email: string;
  phone: string;
  grade: string;
  message: string;
}) {
  const admissionsConfig = await db.getAdmissionsConfig();
  if (!admissionsConfig.isAdmissionsEnabled) {
    return { success: false, error: "Online admissions are currently closed." };
  }

  const sanitized = {
    name: sanitizeInput(data.name),
    parentName: sanitizeInput(data.parentName),
    email: sanitizeInput(data.email),
    phone: sanitizeInput(data.phone),
    grade: sanitizeInput(data.grade),
    message: sanitizeInput(data.message),
  };

  const validation = validateInquiryInput(sanitized);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  try {
    const inquiry = await db.addInquiry(sanitized);
    return { success: true, inquiry };
  } catch (error) {
    console.error("Failed to submit inquiry:", error);
    return { success: false, error: "Database error. Please try again." };
  }
}

export async function getInquiries() {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized access");
  return await db.getInquiries();
}

export async function updateInquiryStatus(id: string, status: db.Inquiry["status"]) {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized access");
  
  const updated = await db.updateInquiryStatus(id, status);
  if (updated) {
    await db.addAuditLog(session.username, session.role, "INQUIRY_STATUS", `Updated inquiry ${id} status to ${status}`);
  }
  return { success: !!updated, inquiry: updated };
}

export async function deleteInquiry(id: string) {
  const session = await getSessionUser();
  if (!session || session.role !== "owner") {
    throw new Error("Unauthorized: Requires Owner role.");
  }
  
  const success = await db.deleteInquiry(id);
  if (success) {
    await db.addAuditLog(session.username, session.role, "INQUIRY_DELETE", `Deleted inquiry record ${id}`);
  }
  return { success };
}

// Announcements / Notices Server Actions
export async function getNotices() {
  return await db.getNotices();
}

export async function addNotice(data: {
  title: string;
  content: string;
  type: db.Notice["type"];
  isActive: boolean;
  isPinned: boolean;
  expiryDate: string;
  pdfUrl: string;
}) {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized access");

  const sanitized = {
    title: sanitizeInput(data.title),
    content: sanitizeInput(data.content),
    type: data.type,
    isActive: data.isActive,
    isPinned: data.isPinned,
    expiryDate: sanitizeInput(data.expiryDate),
    pdfUrl: sanitizeInput(data.pdfUrl),
  };

  const notice = await db.addNotice(sanitized);
  await db.addAuditLog(session.username, session.role, "ANNOUNCEMENT_CREATE", `Published announcement: ${sanitized.title}`);
  return { success: true, notice };
}

export async function updateNoticeAction(id: string, data: Partial<db.Notice>) {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized access");

  const sanitized: Partial<db.Notice> = {};
  if (data.title !== undefined) sanitized.title = sanitizeInput(data.title);
  if (data.content !== undefined) sanitized.content = sanitizeInput(data.content);
  if (data.type !== undefined) sanitized.type = data.type;
  if (data.isActive !== undefined) sanitized.isActive = data.isActive;
  if (data.isPinned !== undefined) sanitized.isPinned = data.isPinned;
  if (data.expiryDate !== undefined) sanitized.expiryDate = sanitizeInput(data.expiryDate);
  if (data.pdfUrl !== undefined) sanitized.pdfUrl = sanitizeInput(data.pdfUrl);

  const updated = await db.updateNotice(id, sanitized);
  if (updated) {
    await db.addAuditLog(session.username, session.role, "ANNOUNCEMENT_UPDATE", `Updated announcement: ${updated.title}`);
    return { success: true, notice: updated };
  }
  return { success: false, error: "Announcement not found." };
}

export async function deleteNotice(id: string) {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized access");

  const success = await db.deleteNotice(id);
  if (success) {
    await db.addAuditLog(session.username, session.role, "NOTICE_DELETE", `Deleted notice ${id}`);
  }
  return { success };
}

// Announcements Server Actions
export async function getAnnouncements() {
  return await db.getAnnouncements();
}

export async function addAnnouncementAction(data: {
  title: string;
  content: string;
  type: db.Notice["type"];
  isActive: boolean;
  isPinned: boolean;
  expiryDate: string;
  pdfUrl: string;
}) {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized access");

  const sanitized = {
    title: sanitizeInput(data.title),
    content: sanitizeInput(data.content),
    type: data.type,
    isActive: data.isActive,
    isPinned: data.isPinned,
    expiryDate: sanitizeInput(data.expiryDate),
    pdfUrl: sanitizeInput(data.pdfUrl),
  };

  const ann = await db.addAnnouncement(sanitized);
  await db.addAuditLog(session.username, session.role, "ANNOUNCEMENT_CREATE", `Published announcement: ${sanitized.title}`);
  return { success: true, announcement: ann };
}

export async function updateAnnouncementAction(id: string, data: Partial<db.Notice>) {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized access");

  const sanitized: Partial<db.Notice> = {};
  if (data.title !== undefined) sanitized.title = sanitizeInput(data.title);
  if (data.content !== undefined) sanitized.content = sanitizeInput(data.content);
  if (data.type !== undefined) sanitized.type = data.type;
  if (data.isActive !== undefined) sanitized.isActive = data.isActive;
  if (data.isPinned !== undefined) sanitized.isPinned = data.isPinned;
  if (data.expiryDate !== undefined) sanitized.expiryDate = sanitizeInput(data.expiryDate);
  if (data.pdfUrl !== undefined) sanitized.pdfUrl = sanitizeInput(data.pdfUrl);

  const updated = await db.updateAnnouncement(id, sanitized);
  if (updated) {
    await db.addAuditLog(session.username, session.role, "ANNOUNCEMENT_UPDATE", `Updated announcement: ${updated.title}`);
    return { success: true, announcement: updated };
  }
  return { success: false, error: "Announcement not found." };
}

export async function deleteAnnouncementAction(id: string) {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized access");

  const success = await db.deleteAnnouncement(id);
  if (success) {
    await db.addAuditLog(session.username, session.role, "ANNOUNCEMENT_DELETE", `Deleted announcement ${id}`);
  }
  return { success };
}

// Gallery Server Actions
export async function getGallery() {
  return await db.getGallery();
}

export async function addGalleryItemAction(data: {
  category: db.GalleryItem["category"];
  title: string;
  type: "image" | "video";
  url: string;
  description: string;
}) {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized access");

  const sanitized = {
    category: data.category,
    title: sanitizeInput(data.title),
    type: data.type,
    url: sanitizeInput(data.url),
    description: sanitizeInput(data.description)
  };

  const item = await db.addGalleryItem(sanitized);
  await db.addAuditLog(session.username, session.role, "GALLERY_ADD", `Added gallery item: ${sanitized.title} (${sanitized.category})`);
  return { success: true, item };
}

export async function deleteGalleryItemAction(id: string) {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized access");

  const success = await db.deleteGalleryItem(id);
  if (success) {
    await db.addAuditLog(session.username, session.role, "GALLERY_DELETE", `Deleted gallery item ${id}`);
  }
  return { success };
}

// Achievements / Stats Server Actions
export async function getAchievements() {
  return await db.getAchievements();
}

export async function updateAchievement(key: string, value: string) {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized access");
  
  const cleanVal = sanitizeInput(value);
  const updated = await db.updateAchievement(key, cleanVal);
  if (updated) {
    await db.addAuditLog(session.username, session.role, "STATISTICS_UPDATE", `Updated stat counter ${key} to ${cleanVal}`);
  }
  return { success: !!updated, achievement: updated };
}

// Homepage Content Actions
export async function getHomepageContent() {
  return await db.getHomepageContent();
}

export async function updateHomepageContentAction(content: db.HomepageContent) {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized access");

  const sanitized: db.HomepageContent = {
    heroTitle: sanitizeInput(content.heroTitle),
    heroSubtitle: sanitizeInput(content.heroSubtitle),
    heroDescription: sanitizeInput(content.heroDescription),
    admissionsBtnText: sanitizeInput(content.admissionsBtnText),
    directorsMessage: {
      name: sanitizeInput(content.directorsMessage.name),
      designation: sanitizeInput(content.directorsMessage.designation),
      message: sanitizeInput(content.directorsMessage.message),
      signature: sanitizeInput(content.directorsMessage.signature),
      photo: sanitizeInput(content.directorsMessage.photo)
    }
  };

  const updated = await db.updateHomepageContent(sanitized);
  await db.addAuditLog(session.username, session.role, "HOMEPAGE_UPDATE", "Updated homepage hero or Principal message content");
  return { success: true, content: updated };
}

// Settings Server Actions (Owner only)
export async function getSettings() {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized access");
  return await db.getSettings();
}

export async function updateSettingsAction(settingsData: db.SystemSettings) {
  const session = await getSessionUser();
  if (!session || session.role !== "owner") {
    throw new Error("Unauthorized: Requires Owner role.");
  }

  const sanitized: db.SystemSettings = {
    smsNotificationPhone: sanitizeInput(settingsData.smsNotificationPhone),
    schoolName: sanitizeInput(settingsData.schoolName),
    schoolSubName: sanitizeInput(settingsData.schoolSubName),
    schoolLogo: sanitizeInput(settingsData.schoolLogo),
    faviconUrl: sanitizeInput(settingsData.faviconUrl),
    copyrightText: sanitizeInput(settingsData.copyrightText),
    facebookUrl: sanitizeInput(settingsData.facebookUrl),
    instagramUrl: sanitizeInput(settingsData.instagramUrl),
    youtubeUrl: sanitizeInput(settingsData.youtubeUrl),
  };

  if (sanitized.smsNotificationPhone && !validatePhone(sanitized.smsNotificationPhone)) {
    return { success: false, error: "Please provide a valid notification phone number." };
  }

  const updated = await db.updateSettings(sanitized);
  await db.addAuditLog(session.username, session.role, "SETTINGS_UPDATE", "Updated system and branding configuration settings");
  return { success: true, settings: updated };
}

export async function getContactInfo() {
  return await db.getContactInfo();
}

export async function updateContactAction(info: db.SystemContactInfo) {
  const session = await getSessionUser();
  if (!session || session.role !== "owner") {
    throw new Error("Unauthorized: Requires Owner role.");
  }

  const sanitized: db.SystemContactInfo = {
    phoneNumbers: info.phoneNumbers.map(p => sanitizeInput(p)),
    whatsappNumber: sanitizeInput(info.whatsappNumber),
    emails: info.emails.map(e => sanitizeInput(e)),
    address: sanitizeInput(info.address),
    googleMapsLink: sanitizeInput(info.googleMapsLink),
    officeTimings: sanitizeInput(info.officeTimings),
    mapEmbedSrc: sanitizeInput(info.mapEmbedSrc || "")
  };

  const updated = await db.updateContactInfo(sanitized);
  await db.addAuditLog(session.username, session.role, "CONTACT_UPDATE", "Updated school contact information details");
  return { success: true, contactInfo: updated };
}

export async function getAdmissionsConfig() {
  return await db.getAdmissionsConfig();
}

export async function updateAdmissionsConfigAction(config: db.AdmissionsConfig) {
  const session = await getSessionUser();
  if (!session || session.role !== "owner") {
    throw new Error("Unauthorized: Requires Owner role.");
  }

  const sanitized: db.AdmissionsConfig = {
    isAdmissionsEnabled: config.isAdmissionsEnabled,
    openDate: sanitizeInput(config.openDate),
    closeDate: sanitizeInput(config.closeDate),
    academicYear: config.academicYear ? sanitizeInput(config.academicYear) : ""
  };

  const updated = await db.updateAdmissionsConfig(sanitized);
  await db.addAuditLog(
    session.username,
    session.role,
    "ADMISSIONS_CONFIG",
    `Updated admissions configuration. Status: ${sanitized.isAdmissionsEnabled ? "Open" : "Closed"}`
  );
  return { success: true, admissionsConfig: updated };
}

export async function restoreDatabaseAction(jsonString: string) {
  const session = await getSessionUser();
  if (!session || session.role !== "owner") {
    throw new Error("Unauthorized: Requires Owner role.");
  }

  const success = await db.restoreDatabaseBackup(jsonString);
  if (success) {
    await db.addAuditLog(session.username, session.role, "DATABASE_RESTORE", "Restored system database state from file backup");
    return { success: true };
  } else {
    return { success: false, error: "Failed to restore backup. Structural schema check failed." };
  }
}

export async function getNotificationLogs() {
  const session = await getSessionUser();
  if (!session || session.role !== "owner") {
    throw new Error("Unauthorized: Requires Owner role.");
  }
  return await db.getNotificationLogs();
}

export async function getAuditLogsAction() {
  const session = await getSessionUser();
  if (!session || session.role !== "owner") {
    throw new Error("Unauthorized: Requires Owner role.");
  }
  return await db.getAuditLogs();
}

export async function sendTestNotification(phone: string) {
  const session = await getSessionUser();
  if (!session || session.role !== "owner") {
    throw new Error("Unauthorized: Requires Owner role.");
  }

  const sanitizedPhone = sanitizeInput(phone);
  if (!validatePhone(sanitizedPhone)) {
    return { success: false, error: "Please provide a valid phone number." };
  }

  const settings = await db.getSettings();
  const testMessage = `${settings.schoolName} / ${settings.schoolSubName}: This is a live test SMS and WhatsApp notification verifying your system credentials.`;

  console.log(`[NOTIFICATIONS] Triggering actual test notifications to ${sanitizedPhone}...`);
  
  // 1. Send test SMS
  const smsRes = await sendTwilioSMS(sanitizedPhone, testMessage);
  await db.addNotificationLog({
    type: "sms",
    recipient: sanitizedPhone,
    inquiryName: "Test Notification",
    status: smsRes.success ? "success" : "failure",
    errorMessage: smsRes.success ? undefined : smsRes.error,
  });

  // 2. Send test WhatsApp
  const waRes = await sendTwilioWhatsApp(sanitizedPhone, testMessage);
  await db.addNotificationLog({
    type: "whatsapp",
    recipient: sanitizedPhone,
    inquiryName: "Test Notification",
    status: waRes.success ? "success" : "failure",
    errorMessage: waRes.success ? undefined : waRes.error,
  });

  await db.addAuditLog(session.username, session.role, "TEST_NOTIFY", `Dispatched test notifications to ${sanitizedPhone}`);

  if (smsRes.success && waRes.success) {
    return { success: true, message: `Successfully sent test SMS and WhatsApp to ${sanitizedPhone}` };
  } else {
    const details = [];
    if (!smsRes.success) details.push(`SMS Error: ${smsRes.error}`);
    if (!waRes.success) details.push(`WhatsApp Error: ${waRes.error}`);
    return { success: false, error: `Notification partial or full failure. ${details.join(" | ")}` };
  }
}

// Simple Admin Dashboard Analytics Action
export async function getAdminAnalytics() {
  const session = await getSessionUser();
  if (!session) throw new Error("Unauthorized access");

  const inquiries = await db.getInquiries();
  const totalInquiries = inquiries.length;
  
  // Status breakdown
  const statusCounts = inquiries.reduce((acc, inq) => {
    acc[inq.status] = (acc[inq.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Grade breakdown
  const gradeCounts = inquiries.reduce((acc, inq) => {
    acc[inq.grade] = (acc[inq.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Weekly signups (Mock over last 4 weeks)
  const chartData = [
    { name: "Week 1", count: Math.ceil(totalInquiries * 0.15) },
    { name: "Week 2", count: Math.ceil(totalInquiries * 0.25) },
    { name: "Week 3", count: Math.ceil(totalInquiries * 0.35) },
    { name: "Week 4", count: totalInquiries - Math.ceil(totalInquiries * 0.75) },
  ];

  return {
    totalInquiries,
    statusCounts: {
      Pending: statusCounts.Pending || 0,
      Contacted: statusCounts.Contacted || 0,
      Reviewed: statusCounts.Reviewed || 0,
      Admitted: statusCounts.Admitted || 0,
      Rejected: statusCounts.Rejected || 0,
    },
    gradeCounts,
    chartData,
  };
}

// ----------------------------------------------------
// POPUP MANAGEMENT ACTIONS
// ----------------------------------------------------

export async function getPopupsAction() {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("Unauthorized access");
  }
  return await db.getPopups();
}

export async function addPopupAction(data: Omit<db.Popup, "id" | "createdAt">) {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("Unauthorized access");
  }

  const sanitized: Omit<db.Popup, "id" | "createdAt"> = {
    type: data.type,
    isActive: data.isActive,
  };

  if (data.type === "image") {
    sanitized.imageUrl = data.imageUrl ? sanitizeInput(data.imageUrl) : "";
    sanitized.buttonLink = data.buttonLink ? sanitizeInput(data.buttonLink) : "";
  } else if (data.type === "emergency") {
    sanitized.heading = data.heading ? sanitizeInput(data.heading) : "";
    sanitized.message = data.message ? sanitizeInput(data.message) : "";
  }

  const validation = validatePopupInput(sanitized);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const popup = await db.addPopup(sanitized);
  await db.addAuditLog(
    session.username,
    session.role,
    "POPUP_CREATE",
    `Created popup campaign (${sanitized.type})`
  );

  return { success: true, popup };
}

export async function updatePopupAction(id: string, data: Partial<db.Popup>) {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("Unauthorized access");
  }

  const popups = await db.getPopups();
  const existing = popups.find(p => p.id === id);
  if (!existing) {
    return { success: false, error: "Popup campaign not found." };
  }

  const sanitized: Partial<db.Popup> = {};
  if (data.isActive !== undefined) sanitized.isActive = data.isActive;
  if (data.type !== undefined) sanitized.type = data.type;

  const type = sanitized.type ?? existing.type;
  if (type === "image") {
    if (data.imageUrl !== undefined) sanitized.imageUrl = sanitizeInput(data.imageUrl);
    if (data.buttonLink !== undefined) sanitized.buttonLink = sanitizeInput(data.buttonLink);
    // clear emergency fields
    sanitized.heading = "";
    sanitized.message = "";
  } else if (type === "emergency") {
    if (data.heading !== undefined) sanitized.heading = sanitizeInput(data.heading);
    if (data.message !== undefined) sanitized.message = sanitizeInput(data.message);
    // clear image fields
    sanitized.imageUrl = "";
    sanitized.buttonLink = "";
  }

  // Validate
  const fullData = {
    type,
    imageUrl: sanitized.imageUrl ?? existing.imageUrl,
    heading: sanitized.heading ?? existing.heading,
    message: sanitized.message ?? existing.message,
  };
  const validation = validatePopupInput(fullData);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const popup = await db.updatePopup(id, sanitized);
  if (popup) {
    await db.addAuditLog(
      session.username,
      session.role,
      "POPUP_UPDATE",
      `Updated popup campaign: ${popup.id} (${popup.type})`
    );
    return { success: true, popup };
  }

  return { success: false, error: "Failed to update popup." };
}

export async function deletePopupAction(id: string) {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("Unauthorized access");
  }

  const success = await db.deletePopup(id);
  if (success) {
    await db.addAuditLog(
      session.username,
      session.role,
      "POPUP_DELETE",
      `Deleted popup record: ${id}`
    );
  }
  return { success };
}

export async function getActivePopupAction() {
  const popups = await db.getPopups();
  return popups.find(p => p.isActive) ?? null;
}
