import fs from "fs";
import path from "path";
import { sendTwilioSMS, sendTwilioWhatsApp } from "./notifications";
import { Pool } from "pg";
import { revalidatePath } from "next/cache";

export interface Inquiry {
  id: string;
  name: string;
  parentName?: string;
  email: string;
  phone: string;
  grade: string;
  message: string;
  status: "Pending" | "Contacted" | "Reviewed" | "Admitted" | "Rejected";
  createdAt: string;
  smsStatus?: "success" | "failure" | "pending";
  smsError?: string;
  waStatus?: "success" | "failure" | "pending";
  waError?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: "academic" | "event" | "general" | "admission";
  date: string;
  isActive: boolean;
  isPinned?: boolean;
  expiryDate?: string;
  pdfUrl?: string;
}

export interface Achievement {
  key: string;
  value: string;
  label: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: "Parent" | "Student" | "Alumnus";
  content: string;
  rating: number;
  avatar?: string;
}

export interface SystemContactInfo {
  phoneNumbers: string[];
  whatsappNumber: string;
  emails: string[];
  address: string;
  googleMapsLink: string;
  officeTimings: string;
  mapEmbedSrc?: string;
}

export interface HomepageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  admissionsBtnText: string;
  directorsMessage: {
    name: string;
    designation: string;
    message: string;
    signature: string;
    photo: string;
  };
}

export interface AdmissionsConfig {
  isAdmissionsEnabled: boolean;
  openDate: string;
  closeDate: string;
  academicYear?: string;
}

export interface GalleryItem {
  id: string;
  category: "Campus" | "Classrooms" | "Events" | "Sports" | "Students" | "Activities";
  title: string;
  type: "image" | "video";
  url: string;
  description: string;
}

export interface User {
  username: string;
  passwordHash: string;
  name: string;
  role: "owner" | "principal";
}

export interface AuditLog {
  id: string;
  username: string;
  name: string;
  role: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SystemSettings {
  smsNotificationPhone: string;
  schoolName: string;
  schoolSubName: string;
  schoolLogo: string;
  faviconUrl: string;
  copyrightText: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
}

export interface Popup {
  id: string;
  type: "image" | "emergency";
  imageUrl?: string;
  buttonLink?: string;
  heading?: string;
  message?: string;
  isActive: boolean;
  createdAt: string;
}

interface DbSchema {
  inquiries: Inquiry[];
  notices: Notice[];
  achievements: Achievement[];
  testimonials: Testimonial[];
  settings?: SystemSettings;
  contactInfo?: SystemContactInfo;
  homepageContent?: HomepageContent;
  admissionsConfig?: AdmissionsConfig;
  gallery?: GalleryItem[];
  users?: User[];
  auditLogs?: AuditLog[];
  notificationLogs?: NotificationLog[];
  announcements?: Notice[];
  popups?: Popup[];
}

export interface NotificationLog {
  id: string;
  type: "sms" | "whatsapp" | "both";
  recipient: string;
  inquiryId?: string;
  inquiryName?: string;
  status: "success" | "failure";
  errorMessage?: string;
  createdAt: string;
}

const IS_VERCEL = !!process.env.VERCEL;
const DB_PATH = IS_VERCEL
  ? path.join("/tmp", "db.json")
  : path.join(process.cwd(), "data", "db.json");

let poolInstance: Pool | null = null;

export function getPool(): Pool | null {
  // Prevent database pool initialization during Next.js build phase to avoid build-time failures
  if (process.env.NEXT_PHASE === "phase-production-build") {
    console.log("[DATABASE] Next.js build phase detected. Skipping PostgreSQL pool initialization.");
    return null;
  }

  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
    });
    console.log("[DATABASE] PostgreSQL Connection Pool initialized successfully.");
  }
  return poolInstance;
}

// Seed data
const defaultDb: DbSchema = {
  popups: [],
  inquiries: [],
  notices: [
    {
      id: "n1",
      title: "Online Admission Registration Open for 2026-2027",
      content: "Applications are invited for admissions to classes I to IX & XI. Fill out the online inquiry form to schedule an interactive session.",
      type: "admission",
      date: "2026-06-10",
      isActive: true,
      isPinned: true,
      expiryDate: "",
      pdfUrl: "",
    },
    {
      id: "n2",
      title: "U.P. Board & CBSE Board Examinations Merit List",
      content: "Congratulations to our toppers! St. D.B. Inter College & St. John Bosco School scholars achieve 100% success rate with top merit ranks.",
      type: "academic",
      date: "2026-05-28",
      isActive: true,
      isPinned: false,
      expiryDate: "",
      pdfUrl: "",
    },
    {
      id: "n3",
      title: "Annual Sports Meet - Bosco Shield 2026",
      content: "The annual sports championship event will commence on November 15th. Student registrations for tracks and field events open next week.",
      type: "event",
      date: "2026-06-05",
      isActive: true,
      isPinned: false,
      expiryDate: "",
      pdfUrl: "",
    },
  ],
  achievements: [
    { key: "students", value: "3,200+", label: "Active Minds" },
    { key: "teachers", value: "140+", label: "Expert Educators" },
    { key: "years", value: "48+", label: "Years of Legacy" },
    { key: "success", value: "99.8%", label: "Academic Success" },
  ],
  testimonials: [
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
  ],
  settings: {
    smsNotificationPhone: "+91 8738882912",
    schoolName: "ST. D.B. INTER COLLEGE",
    schoolSubName: "ST. JOHN BOSCO SCHOOL",
    schoolLogo: "/logo.jpg",
    faviconUrl: "/favicon.ico",
    copyrightText: "© 2026 St. D.B. Inter College & St. John Bosco School, Prayagraj. All rights reserved.",
    facebookUrl: "#",
    instagramUrl: "#",
    youtubeUrl: "#",
  },
  contactInfo: {
    phoneNumbers: ["+91 96957 79756", "+91 532 2697274"],
    whatsappNumber: "+91 96957 79756",
    emails: ["admission@stdbboscoschool.ac.in", "contact@stdbboscoschool.ac.in"],
    address: "St. D.B. Inter College & St. John Bosco School, Shri Narayan Marg, Gurunanak Nagar Gali 3, Refugee Colony, PAC Colony, Naini, Prayagraj, Uttar Pradesh - 211008, India",
    googleMapsLink: "https://maps.app.goo.gl/wGFHtQZcjo9RdrD17",
    officeTimings: "Monday - Saturday: 08:00 AM - 01:30 PM (IST)\nClosed on Sundays and Gazetted Holidays",
    mapEmbedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3603.626786358362!2d81.8761168!3d25.3837965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39854a851f1f619b%3A0x48c035cc90aae415!2sSt.D.B.Inter%20Coll!5e0!3m2!1sen!2sin!4v1718123456789!5m2!1sen!2sin",
  },
  homepageContent: {
    heroTitle: "ST. D.B. INTER COLLEGE",
    heroSubtitle: "ST. JOHN BOSCO SCHOOL",
    heroDescription: "\"48+ Years of Academic Excellence, Character Building and Student Success\"",
    admissionsBtnText: "Admissions Open",
    directorsMessage: {
      name: "Sabrina Coutinho",
      designation: "Director Wing",
      message: "Dear Parents, Students and Well-Wishers,\n\nWelcome to ST. D.B. Inter College & St. John Bosco School.\n\nAt our institution, education extends beyond textbooks and examinations. We are committed to nurturing young minds through academic excellence, strong values, discipline, creativity and character development.\n\nOur goal is to create a learning environment where students are encouraged to think independently, act responsibly and grow into confident individuals prepared for future challenges.\n\nWe believe every child possesses unique potential, and through the combined efforts of dedicated educators, supportive families and a vibrant school community, that potential can be transformed into achievement.\n\nWe thank all parents and well-wishers for their continued trust and partnership in our educational journey.",
      signature: "Sabrina Coutinho",
      photo: "/director.jpg",
    },
  },
  admissionsConfig: {
    isAdmissionsEnabled: true,
    openDate: "2026-06-10",
    closeDate: "2026-08-31",
    academicYear: "2026-27",
  },
  gallery: [
    {
      id: "g1",
      category: "Campus",
      title: "Main Courtyard & Blocks",
      type: "image",
      url: "/campus.jpg",
      description: "The primary academic courtyard of St. John Bosco School, Naini, Prayagraj.",
    },
    {
      id: "g2",
      category: "Classrooms",
      title: "Senior Wing Classrooms",
      type: "image",
      url: "/classroom.jpg",
      description: "Well-ventilated academic rooms located in the main red-and-white courtyard blocks.",
    },
    {
      id: "g3",
      category: "Events",
      title: "Courtyard Gathering Assembly",
      type: "image",
      url: "/assembly.jpg",
      description: "The spacious open courtyard hosting school celebrations and morning assemblies.",
    },
    {
      id: "g4",
      category: "Sports",
      title: "Physical Gymnastics Stunts",
      type: "image",
      url: "/yoga.jpg",
      description: "Physical education demonstrations and balance exercises on courtyard mats.",
    },
    {
      id: "g5",
      category: "Students",
      title: "Scholars Cabinet Assembly",
      type: "image",
      url: "/scholars.jpg",
      description: "Corridors linking classrooms where students collaborate on board preparations.",
    },
    {
      id: "g6",
      category: "Activities",
      title: "National Day Human Pyramid",
      type: "image",
      url: "/pyramid.jpg",
      description: "Scholars building human pyramid formations holding the Indian flag.",
    },
    {
      id: "g7",
      category: "Campus",
      title: "Aerial Courtyard Formations",
      type: "image",
      url: "/formation.jpg",
      description: "Aerial overview of student assemblies gathered around floral Rangoli patterns.",
    },
    {
      id: "g8",
      category: "Activities",
      title: "Official Faculty Council",
      type: "image",
      url: "/teachers.jpg",
      description: "Our certified teachers and administrative staff group photo.",
    },
    {
      id: "g9",
      category: "Activities",
      title: "Guest Flower Felicitation",
      type: "image",
      url: "/bouquet.jpg",
      description: "Scholars welcoming distinguished chief guests on the academic stage.",
    },
    {
      id: "g10",
      category: "Events",
      title: "School Drum Band March",
      type: "image",
      url: "/march.jpg",
      description: "Student band march in red carpet courtyard ceremony.",
    },
    {
      id: "g11",
      category: "Campus",
      title: "Town National Parade March",
      type: "image",
      url: "/parade.jpg",
      description: "Parade march event in Naini, Prayagraj, celebrating Azadi Ka Amrit Mahotsav.",
    },
  ],
  users: [
    {
      username: "admin",
      passwordHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // sha256 of "admin"
      name: "Super Administrator",
      role: "owner",
    },
    {
      username: "principal",
      passwordHash: "69e03750027e6b1e9f95bd21d227613c0024ec799ebfb7fe281371e1153f9bda", // sha256 of "principal"
      name: "School Principal",
      role: "principal",
    },
  ],
  auditLogs: [],
  notificationLogs: [],
  announcements: [
    {
      id: "ann_1",
      title: "Founder's Day Celebration Golden Jubilee",
      content: "St. John Bosco School marks 50 years of educational service in Naini, Prayagraj. Cultural performances and alumni meet to be held in courtyard.",
      type: "general",
      date: "2026-06-12",
      isActive: true,
      isPinned: true,
      expiryDate: "",
      pdfUrl: "",
    },
    {
      id: "ann_2",
      title: "Inter-School Science & Tech Exhibition Awards",
      content: "Congratulations to our junior science cabinet scholars for winning the Prayagraj Science Innovation Shield.",
      type: "academic",
      date: "2026-06-18",
      isActive: true,
      isPinned: false,
      expiryDate: "",
      pdfUrl: "",
    },
    {
      id: "ann_3",
      title: "Annual Sports Meet - Bosco Shield 2026",
      content: "The annual sports championship event will commence on November 15th. Student registrations for tracks and field events open next week.",
      type: "event",
      date: "2026-06-20",
      isActive: true,
      isPinned: false,
      expiryDate: "",
      pdfUrl: "",
    }
  ],
};

const keysToVerify: (keyof DbSchema)[] = [
  "inquiries",
  "notices",
  "achievements",
  "testimonials",
  "settings",
  "contactInfo",
  "homepageContent",
  "admissionsConfig",
  "gallery",
  "users",
  "auditLogs",
  "notificationLogs",
  "announcements",
  "popups",
];

let schemaInitialized = false;

export async function initDbSchema() {
  if (schemaInitialized) return;
  const dbPool = getPool();
  if (!dbPool) return;

  const client = await dbPool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS cms_store (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        filename VARCHAR(255) PRIMARY KEY,
        mime_type VARCHAR(100) NOT NULL,
        data_base64 TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    schemaInitialized = true;
    console.log("[DATABASE] Database schema tables verified/created successfully.");
  } catch (error) {
    console.error("[DATABASE] Error initializing database tables:", error);
    throw error;
  } finally {
    client.release();
  }
}

function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const seedPath = path.join(process.cwd(), "data", "db.json");
    if (IS_VERCEL && fs.existsSync(seedPath)) {
      try {
        fs.copyFileSync(seedPath, DB_PATH);
        console.log("[DATABASE] Initialized /tmp/db.json from seed db.json");
        return;
      } catch (e) {
        console.error("Failed to copy seed database to /tmp/db.json:", e);
      }
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf-8");
  } else {
    try {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      const db = JSON.parse(data) as any;
      let modified = false;

      for (const key of keysToVerify) {
        if (db[key] === undefined) {
          db[key] = defaultDb[key];
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
      }
    } catch (e) {
      console.error("Error patching db file structures:", e);
    }
  }
}

async function getDb(): Promise<DbSchema> {
  const dbPool = getPool();
  if (dbPool) {
    console.log("[DATABASE] DATABASE_URL detected. Reading database from PostgreSQL...");
    try {
      await initDbSchema();
      console.log("[DATABASE] Executing query: SELECT key, value FROM cms_store");
      const { rows } = await dbPool.query("SELECT key, value FROM cms_store");
      console.log(`[DATABASE] Query successful. Retrieved ${rows.length} rows.`);
      if (rows.length > 0) {
        const db: any = {};
        for (const row of rows) {
          db[row.key] = row.value;
        }

        // Verify keys and fill defaults if missing
        let modified = false;
        for (const key of keysToVerify) {
          if (db[key] === undefined) {
            db[key] = defaultDb[key];
            modified = true;
          }
        }
        if (modified) {
          await saveDb(db);
        }
        return db as DbSchema;
      } else {
        // Seed database
        console.log("[DATABASE] PostgreSQL database is empty. Seeding persistent database from seed source...");
        let initialDb = defaultDb;
        const seedPath = path.join(process.cwd(), "data", "db.json");
        if (fs.existsSync(seedPath)) {
          try {
            const fileData = await fs.promises.readFile(seedPath, "utf-8");
            initialDb = JSON.parse(fileData) as DbSchema;
            console.log("[DATABASE] Successfully loaded seed file data/db.json");
          } catch (e) {
            console.error("Failed to read local seed data/db.json, using defaultDb:", e);
          }
        }
        await saveDb(initialDb);
        return initialDb;
      }
    } catch (error: any) {
      console.error("[DATABASE] CRITICAL: Failed to read from PostgreSQL database:", error);
      // In production, we MUST throw the error and NOT fall back to local file
      throw new Error(`Production database read failed: ${error.message}`);
    }
  } else {
    console.log("[DATABASE] DATABASE_URL not set. Reading database from local JSON file fallback...");
  }

  // Local file fallback
  ensureDbFile();
  try {
    const data = await fs.promises.readFile(DB_PATH, "utf-8");
    return JSON.parse(data) as DbSchema;
  } catch (error) {
    console.error("Error reading database file, using fallback default:", error);
    return defaultDb;
  }
}

async function saveDb(db: DbSchema): Promise<void> {
  const dbPool = getPool();
  if (dbPool) {
    console.log("[DATABASE] DATABASE_URL detected. Writing database to PostgreSQL...");
    try {
      await initDbSchema();
      const client = await dbPool.connect();
      try {
        await client.query("BEGIN");
        for (const key of keysToVerify) {
          const val = db[key];
          if (val !== undefined) {
            await client.query(
              `INSERT INTO cms_store (key, value) VALUES ($1, $2)
               ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
              [key, JSON.stringify(val)]
            );
          }
        }
        await client.query("COMMIT");
        console.log("[DATABASE] Successfully committed database write to PostgreSQL.");
        try {
          revalidatePath("/", "layout");
          console.log("[DATABASE] Revalidated layouts successfully");
        } catch (e) {}
        return;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error("[DATABASE] CRITICAL: Failed to write to PostgreSQL database:", error);
      throw new Error(`Production database write failed: ${error.message}`);
    }
  } else {
    console.log("[DATABASE] DATABASE_URL not set. Writing database to local JSON file fallback...");
  }

  // Local file fallback
  ensureDbFile();
  await fs.promises.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  try {
    revalidatePath("/", "layout");
  } catch (e) {}
}

// RESTORE BACKUP DATABASE
export async function restoreDatabaseBackup(jsonString: string): Promise<boolean> {
  try {
    const db = JSON.parse(jsonString) as DbSchema;
    if (!db.inquiries || !db.notices || !db.settings || !db.users || !db.contactInfo || !db.homepageContent) {
      throw new Error("Invalid database schema structure in backup file.");
    }
    await saveDb(db);
    return true;
  } catch (e) {
    console.error("Backup restore failed:", e);
    return false;
  }
}

// SYSTEM SETTINGS HELPERS
export async function getSettings(): Promise<SystemSettings> {
  const db = await getDb();
  return db.settings || defaultDb.settings!;
}

export async function updateSettings(settingsData: SystemSettings): Promise<SystemSettings> {
  const db = await getDb();
  db.settings = settingsData;
  await saveDb(db);
  return db.settings;
}

// SYSTEM CONTACT HELPERS
export async function getContactInfo(): Promise<SystemContactInfo> {
  const db = await getDb();
  return db.contactInfo || defaultDb.contactInfo!;
}

export async function updateContactInfo(info: SystemContactInfo): Promise<SystemContactInfo> {
  const db = await getDb();
  db.contactInfo = info;
  await saveDb(db);
  return db.contactInfo;
}

// HOMEPAGE CONTENT HELPERS
export async function getHomepageContent(): Promise<HomepageContent> {
  const db = await getDb();
  return db.homepageContent || defaultDb.homepageContent!;
}

export async function updateHomepageContent(content: HomepageContent): Promise<HomepageContent> {
  const db = await getDb();
  db.homepageContent = content;
  await saveDb(db);
  return db.homepageContent;
}

// ADMISSIONS CONFIG HELPERS
export async function getAdmissionsConfig(): Promise<AdmissionsConfig> {
  const db = await getDb();
  return db.admissionsConfig || defaultDb.admissionsConfig!;
}

export async function updateAdmissionsConfig(config: AdmissionsConfig): Promise<AdmissionsConfig> {
  const db = await getDb();
  db.admissionsConfig = config;
  await saveDb(db);
  return db.admissionsConfig;
}

// USERS MANAGEMENT HELPERS
export async function getUsers(): Promise<User[]> {
  const db = await getDb();
  return db.users || defaultDb.users!;
}

export async function saveUsers(usersList: User[]): Promise<void> {
  const db = await getDb();
  db.users = usersList;
  await saveDb(db);
}

// AUDIT LOG HELPERS
export async function getAuditLogs(): Promise<AuditLog[]> {
  const db = await getDb();
  return db.auditLogs || [];
}

export async function addAuditLog(
  username: string,
  role: string,
  action: string,
  details: string
): Promise<AuditLog> {
  const db = await getDb();
  if (!db.auditLogs) {
    db.auditLogs = [];
  }

  let actorName = username;
  if (db.users) {
    const u = db.users.find((user) => user.username === username);
    if (u) actorName = u.name;
  }

  const newLog: AuditLog = {
    id: "audit_" + Math.random().toString(36).substring(2, 9),
    username,
    name: actorName,
    role,
    action,
    details,
    timestamp: new Date().toISOString(),
  };

  db.auditLogs.unshift(newLog);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  await saveDb(db);
  return newLog;
}

// Notification Logs Helpers
export async function getNotificationLogs(): Promise<NotificationLog[]> {
  const db = await getDb();
  return db.notificationLogs || [];
}

export async function addNotificationLog(
  logData: Omit<NotificationLog, "id" | "createdAt">
): Promise<NotificationLog> {
  const db = await getDb();
  if (!db.notificationLogs) {
    db.notificationLogs = [];
  }
  const newLog: NotificationLog = {
    ...logData,
    id: "log_" + Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
  };
  db.notificationLogs.unshift(newLog);
  if (db.notificationLogs.length > 100) {
    db.notificationLogs = db.notificationLogs.slice(0, 100);
  }
  await saveDb(db);
  return newLog;
}

// Inquiry Helpers
export async function getInquiries(): Promise<Inquiry[]> {
  const db = await getDb();
  return db.inquiries.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function addInquiry(
  inquiryData: Omit<Inquiry, "id" | "status" | "createdAt">
): Promise<Inquiry> {
  const db = await getDb();
  const newInquiry: Inquiry = {
    ...inquiryData,
    id: "inq_" + Math.random().toString(36).substring(2, 9),
    status: "Pending",
    createdAt: new Date().toISOString(),
    smsStatus: "pending",
    waStatus: "pending",
  };

  db.inquiries.push(newInquiry);
  await saveDb(db);

  // Trigger Real Notifications
  const settings = await getSettings();
  const admissionsPhone = settings.smsNotificationPhone?.trim();
  const messageBody = `${settings.schoolName} / ${settings.schoolSubName}: New admission inquiry received for ${newInquiry.grade}. Student: ${newInquiry.name}, Parent: ${newInquiry.parentName || "N/A"}, Phone: ${newInquiry.phone}.`;

  if (admissionsPhone) {
    console.log(`[NOTIFICATIONS] Sending notifications for inquiry ${newInquiry.id} to ${admissionsPhone}...`);
    
    // 1. Send SMS
    const smsRes = await sendTwilioSMS(admissionsPhone, messageBody);
    if (smsRes.success) {
      newInquiry.smsStatus = "success";
      console.log(`[SMS NOTIFICATION] SUCCESS: SMS delivered to ${admissionsPhone} (SID: ${smsRes.sid})`);
      await addNotificationLog({
        type: "sms",
        recipient: admissionsPhone,
        inquiryId: newInquiry.id,
        inquiryName: newInquiry.name,
        status: "success"
      });
    } else {
      newInquiry.smsStatus = "failure";
      newInquiry.smsError = smsRes.error;
      console.error(`[SMS NOTIFICATION] FAILURE: SMS delivery failed. Error: ${smsRes.error}`);
      await addNotificationLog({
        type: "sms",
        recipient: admissionsPhone,
        inquiryId: newInquiry.id,
        inquiryName: newInquiry.name,
        status: "failure",
        errorMessage: smsRes.error
      });
    }

    // 2. Send WhatsApp
    const waRes = await sendTwilioWhatsApp(admissionsPhone, messageBody);
    if (waRes.success) {
      newInquiry.waStatus = "success";
      console.log(`[WHATSAPP NOTIFICATION] SUCCESS: WhatsApp delivered to ${admissionsPhone} (SID: ${waRes.sid})`);
      await addNotificationLog({
        type: "whatsapp",
        recipient: admissionsPhone,
        inquiryId: newInquiry.id,
        inquiryName: newInquiry.name,
        status: "success"
      });
    } else {
      newInquiry.waStatus = "failure";
      newInquiry.waError = waRes.error;
      console.error(`[WHATSAPP NOTIFICATION] FAILURE: WhatsApp delivery failed. Error: ${waRes.error}`);
      await addNotificationLog({
        type: "whatsapp",
        recipient: admissionsPhone,
        inquiryId: newInquiry.id,
        inquiryName: newInquiry.name,
        status: "failure",
        errorMessage: waRes.error
      });
    }
  } else {
    newInquiry.smsStatus = "failure";
    newInquiry.smsError = "No admissions phone number configured in Settings.";
    newInquiry.waStatus = "failure";
    newInquiry.waError = "No admissions phone number configured in Settings.";
    console.error(`[NOTIFICATIONS] FAILURE: Cannot send notifications. Phone number is not configured.`);
    await addNotificationLog({
      type: "both",
      recipient: "N/A",
      inquiryId: newInquiry.id,
      inquiryName: newInquiry.name,
      status: "failure",
      errorMessage: "No admissions phone number configured in Settings."
    });
  }

  // Update inquiry notification status in db
  const freshDb = await getDb();
  const index = freshDb.inquiries.findIndex((i) => i.id === newInquiry.id);
  if (index !== -1) {
    freshDb.inquiries[index] = newInquiry;
    await saveDb(freshDb);
  }

  return newInquiry;
}

export async function updateInquiryStatus(
  id: string,
  status: Inquiry["status"]
): Promise<Inquiry | null> {
  const db = await getDb();
  const index = db.inquiries.findIndex((i) => i.id === id);
  if (index === -1) return null;

  db.inquiries[index].status = status;
  await saveDb(db);
  return db.inquiries[index];
}

export async function deleteInquiry(id: string): Promise<boolean> {
  const db = await getDb();
  const initialLength = db.inquiries.length;
  db.inquiries = db.inquiries.filter((i) => i.id !== id);
  await saveDb(db);
  return db.inquiries.length < initialLength;
}

// Notice (Announcement) Helpers
export async function getNotices(): Promise<Notice[]> {
  const db = await getDb();
  return db.notices || [];
}

export async function addNotice(noticeData: Omit<Notice, "id" | "date">): Promise<Notice> {
  const db = await getDb();
  if (!db.notices) db.notices = [];
  const newNotice: Notice = {
    ...noticeData,
    id: "not_" + Math.random().toString(36).substring(2, 9),
    date: new Date().toISOString().split("T")[0],
  };

  db.notices.unshift(newNotice);
  await saveDb(db);
  return newNotice;
}

export async function updateNotice(id: string, noticeData: Partial<Notice>): Promise<Notice | null> {
  const db = await getDb();
  if (!db.notices) return null;
  const index = db.notices.findIndex((n) => n.id === id);
  if (index === -1) return null;

  db.notices[index] = {
    ...db.notices[index],
    ...noticeData,
  };
  await saveDb(db);
  return db.notices[index];
}

export async function deleteNotice(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db.notices) return false;
  const initialLength = db.notices.length;
  db.notices = db.notices.filter((n) => n.id !== id);
  await saveDb(db);
  return db.notices.length < initialLength;
}

// Announcement Helpers
export async function getAnnouncements(): Promise<Notice[]> {
  const db = await getDb();
  return db.announcements || [];
}

export async function addAnnouncement(annData: Omit<Notice, "id" | "date">): Promise<Notice> {
  const db = await getDb();
  if (!db.announcements) db.announcements = [];
  const newAnn: Notice = {
    ...annData,
    id: "ann_" + Math.random().toString(36).substring(2, 9),
    date: new Date().toISOString().split("T")[0],
  };

  db.announcements.unshift(newAnn);
  await saveDb(db);
  return newAnn;
}

export async function updateAnnouncement(id: string, annData: Partial<Notice>): Promise<Notice | null> {
  const db = await getDb();
  if (!db.announcements) return null;
  const index = db.announcements.findIndex((a) => a.id === id);
  if (index === -1) return null;

  db.announcements[index] = {
    ...db.announcements[index],
    ...annData,
  };
  await saveDb(db);
  return db.announcements[index];
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db.announcements) return false;
  const initialLength = db.announcements.length;
  db.announcements = db.announcements.filter((a) => a.id !== id);
  await saveDb(db);
  return db.announcements.length < initialLength;
}

// Gallery Helpers
export async function getGallery(): Promise<GalleryItem[]> {
  const db = await getDb();
  return db.gallery || defaultDb.gallery!;
}

export async function addGalleryItem(itemData: Omit<GalleryItem, "id">): Promise<GalleryItem> {
  const db = await getDb();
  if (!db.gallery) db.gallery = [];
  const newItem: GalleryItem = {
    ...itemData,
    id: "gal_" + Math.random().toString(36).substring(2, 9),
  };
  db.gallery.unshift(newItem);
  await saveDb(db);
  return newItem;
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db.gallery) return false;
  const initialLength = db.gallery.length;
  db.gallery = db.gallery.filter((g) => g.id !== id);
  await saveDb(db);
  return db.gallery.length < initialLength;
}

// Achievement Helpers
export async function getAchievements(): Promise<Achievement[]> {
  const db = await getDb();
  return db.achievements || defaultDb.achievements!;
}

export async function updateAchievement(key: string, value: string): Promise<Achievement | null> {
  const db = await getDb();
  const index = db.achievements.findIndex((a) => a.key === key);
  if (index === -1) return null;

  db.achievements[index].value = value;
  await saveDb(db);
  return db.achievements[index];
}

// Testimonial Helpers
export async function getTestimonials(): Promise<Testimonial[]> {
  const db = await getDb();
  return db.testimonials || defaultDb.testimonials!;
}

export async function addTestimonial(testimonialData: Omit<Testimonial, "id">): Promise<Testimonial> {
  const db = await getDb();
  const newTestimonial: Testimonial = {
    ...testimonialData,
    id: "test_" + Math.random().toString(36).substring(2, 9),
  };

  db.testimonials.push(newTestimonial);
  await saveDb(db);
  return newTestimonial;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const db = await getDb();
  const initialLength = db.testimonials.length;
  db.testimonials = db.testimonials.filter((t) => t.id !== id);
  await saveDb(db);
  return db.testimonials.length < initialLength;
}

// Popup Helpers
export async function getPopups(): Promise<Popup[]> {
  const db = await getDb();
  return db.popups || [];
}

export async function addPopup(popupData: Omit<Popup, "id" | "createdAt">): Promise<Popup> {
  const db = await getDb();
  if (!db.popups) db.popups = [];
  
  const id = "pop_" + Math.random().toString(36).substring(2, 9);
  
  // Deactivate all others if this one is active
  if (popupData.isActive) {
    db.popups.forEach(p => p.isActive = false);
  }
  
  const newPopup: Popup = {
    ...popupData,
    id,
    createdAt: new Date().toISOString(),
  };
  db.popups.unshift(newPopup);
  await saveDb(db);
  return newPopup;
}

export async function updatePopup(id: string, popupData: Partial<Popup>): Promise<Popup | null> {
  const db = await getDb();
  if (!db.popups) return null;
  const index = db.popups.findIndex((p) => p.id === id);
  if (index === -1) return null;

  // Deactivate all others if this one is set to active
  if (popupData.isActive) {
    db.popups.forEach(p => {
      if (p.id !== id) p.isActive = false;
    });
  }

  db.popups[index] = {
    ...db.popups[index],
    ...popupData,
  };
  await saveDb(db);
  return db.popups[index];
}

export async function deletePopup(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db.popups) return false;
  const initialLength = db.popups.length;
  db.popups = db.popups.filter((p) => p.id !== id);
  await saveDb(db);
  return db.popups.length < initialLength;
}
