import fs from "fs";
import path from "path";
import { sendTwilioSMS, sendTwilioWhatsApp, sendInquiryWhatsAppNotification, sendTelegramMessage } from "./notifications";
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
  // Disable connection pooling during build time to prevent compilation errors
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return null;
  }

  const url = process.env.DATABASE_URL;
  if (!url) return null;

  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
    });
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

export async function initDbSchema(): Promise<void> {
  if (schemaInitialized) return;
  const pool = getPool();
  if (!pool) return;

  const client = await pool.connect();
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
  } catch (error) {
    console.error("[db] Error initializing database schema:", error);
    throw error;
  } finally {
    client.release();
  }
}
interface CacheEntry {
  value: any;
  timestamp: number;
}

let configCache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 10000; // 10 seconds cache duration for high performance under load

async function getCMSValue<T>(key: string, defaultValue: T): Promise<T> {
  const now = Date.now();
  if (configCache[key] && (now - configCache[key].timestamp < CACHE_TTL_MS)) {
    return configCache[key].value as T;
  }

  const pool = getPool();
  if (pool) {
    try {
      await initDbSchema();
      const { rows } = await pool.query("SELECT value FROM cms_store WHERE key = $1", [key]);
      if (rows.length > 0) {
        const val = rows[0].value as T;
        configCache[key] = { value: val, timestamp: now };
        return val;
      } else {
        await pool.query(
          "INSERT INTO cms_store (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING",
          [key, JSON.stringify(defaultValue)]
        );
        configCache[key] = { value: defaultValue, timestamp: now };
        return defaultValue;
      }
    } catch (err) {
      console.error(`[db] Error reading key ${key} from PostgreSQL:`, err);
      throw err;
    }
  }

  ensureDbFile();
  try {
    const data = await fs.promises.readFile(DB_PATH, "utf-8");
    const db = JSON.parse(data);
    const val = db[key] !== undefined ? db[key] : defaultValue;
    configCache[key] = { value: val, timestamp: now };
    return val as T;
  } catch (err) {
    return defaultValue;
  }
}

async function setCMSValue<T>(key: string, value: T): Promise<void> {
  configCache[key] = { value, timestamp: Date.now() };

  const pool = getPool();
  if (pool) {
    try {
      await initDbSchema();
      await pool.query(
        `INSERT INTO cms_store (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, JSON.stringify(value)]
      );
      try {
        revalidatePath("/", "layout");
      } catch (e) {}
      return;
    } catch (err) {
      console.error(`[db] Error writing key ${key} to PostgreSQL:`, err);
      throw err;
    }
  }

  ensureDbFile();
  const data = await fs.promises.readFile(DB_PATH, "utf-8");
  const db = JSON.parse(data);
  db[key] = value;
  await fs.promises.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  try {
    revalidatePath("/", "layout");
  } catch (e) {}
}

async function appendToCMSArray<T>(key: string, item: T, prepend = false): Promise<void> {
  if (configCache[key]) {
    const cachedArr = configCache[key].value as T[];
    configCache[key].value = prepend ? [item, ...cachedArr] : [...cachedArr, item];
    configCache[key].timestamp = Date.now();
  }

  const pool = getPool();
  if (pool) {
    try {
      await initDbSchema();
      if (prepend) {
        await pool.query(
          `UPDATE cms_store
           SET value = jsonb_insert(value, '{0}', $1::jsonb), updated_at = CURRENT_TIMESTAMP
           WHERE key = $2`,
          [JSON.stringify(item), key]
        );
      } else {
        await pool.query(
          `UPDATE cms_store
           SET value = value || $1::jsonb, updated_at = CURRENT_TIMESTAMP
           WHERE key = $2`,
          [JSON.stringify(item), key]
        );
      }
      try {
        revalidatePath("/", "layout");
      } catch (e) {}
      return;
    } catch (err) {
      console.error(`[db] Error appending to array ${key} in PostgreSQL:`, err);
      throw err;
    }
  }

  ensureDbFile();
  const data = await fs.promises.readFile(DB_PATH, "utf-8");
  const db = JSON.parse(data);
  if (!db[key]) db[key] = [];
  if (prepend) {
    db[key].unshift(item);
  } else {
    db[key].push(item);
  }
  await fs.promises.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  try {
    revalidatePath("/", "layout");
  } catch (e) {}
}

async function updateInCMSArray<T extends { id: string }>(
  key: string,
  id: string,
  patch: Partial<T>
): Promise<T | null> {
  let updatedItem: T | null = null;
  if (configCache[key]) {
    const cachedArr = configCache[key].value as T[];
    const idx = cachedArr.findIndex(item => item.id === id);
    if (idx !== -1) {
      cachedArr[idx] = { ...cachedArr[idx], ...patch };
      updatedItem = cachedArr[idx];
      configCache[key].timestamp = Date.now();
    }
  }

  const pool = getPool();
  if (pool) {
    try {
      await initDbSchema();
      const { rows } = await pool.query(
        `UPDATE cms_store
         SET value = COALESCE(
           (
             SELECT jsonb_agg(
               CASE
                 WHEN elem->>'id' = $1 THEN elem || $2::jsonb
                 ELSE elem
               END
             )
             FROM jsonb_array_elements(value) elem
           ),
           '[]'::jsonb
         ), updated_at = CURRENT_TIMESTAMP
         WHERE key = $3
         RETURNING value`,
        [id, JSON.stringify(patch), key]
      );
      
      if (rows.length > 0) {
        const arr = rows[0].value as T[];
        const dbItem = arr.find(item => item.id === id) || null;
        if (dbItem) {
          configCache[key] = { value: arr, timestamp: Date.now() };
        }
        try {
          revalidatePath("/", "layout");
        } catch (e) {}
        return dbItem;
      }
      return updatedItem;
    } catch (err) {
      console.error(`[db] Error updating item in array ${key}:`, err);
      throw err;
    }
  }

  ensureDbFile();
  const data = await fs.promises.readFile(DB_PATH, "utf-8");
  const db = JSON.parse(data);
  if (!db[key]) db[key] = [];
  const idx = db[key].findIndex((item: any) => item.id === id);
  if (idx === -1) return null;
  db[key][idx] = { ...db[key][idx], ...patch };
  await fs.promises.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  try {
    revalidatePath("/", "layout");
  } catch (e) {}
  return db[key][idx];
}

async function deleteFromCMSArray(key: string, id: string): Promise<boolean> {
  if (configCache[key]) {
    const cachedArr = configCache[key].value as any[];
    configCache[key].value = cachedArr.filter(item => item.id !== id);
    configCache[key].timestamp = Date.now();
  }

  const pool = getPool();
  if (pool) {
    try {
      await initDbSchema();
      await pool.query(
        `UPDATE cms_store
         SET value = COALESCE(
           (
             SELECT jsonb_agg(elem)
             FROM jsonb_array_elements(value) elem
             WHERE elem->>'id' <> $1
           ),
           '[]'::jsonb
         ), updated_at = CURRENT_TIMESTAMP
         WHERE key = $2`,
        [id, key]
      );
      try {
        revalidatePath("/", "layout");
      } catch (e) {}
      return true;
    } catch (err) {
      console.error(`[db] Error deleting item from array ${key}:`, err);
      throw err;
    }
  }

  ensureDbFile();
  const data = await fs.promises.readFile(DB_PATH, "utf-8");
  const db = JSON.parse(data);
  if (!db[key]) return false;
  const initialLength = db[key].length;
  db[key] = db[key].filter((item: any) => item.id !== id);
  await fs.promises.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  try {
    revalidatePath("/", "layout");
  } catch (e) {}
  return db[key].length < initialLength;
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
        return;
      } catch (e) {
        console.error("Failed to copy seed database to /tmp/db.json:", e);
      }
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf-8");
  }
}

async function getDb(): Promise<DbSchema> {
  const pool = getPool();
  if (pool) {
    try {
      await initDbSchema();
      const { rows } = await pool.query("SELECT key, value FROM cms_store");
      const db: any = {};
      for (const row of rows) {
        db[row.key] = row.value;
      }

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
    } catch (error) {
      console.error("[db] Production database read failed:", error);
      throw error;
    }
  }

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
  configCache = {};

  const pool = getPool();
  if (pool) {
    try {
      await initDbSchema();
      const client = await pool.connect();
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
        try {
          revalidatePath("/", "layout");
        } catch (e) {}
        return;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("[db] Production database write failed:", error);
      throw error;
    }
  }

  ensureDbFile();
  await fs.promises.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  try {
    revalidatePath("/", "layout");
  } catch (e) {}
}

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
  return await getCMSValue<SystemSettings>("settings", defaultDb.settings!);
}

export async function updateSettings(settingsData: SystemSettings): Promise<SystemSettings> {
  await setCMSValue<SystemSettings>("settings", settingsData);
  return settingsData;
}

// SYSTEM CONTACT HELPERS
export async function getContactInfo(): Promise<SystemContactInfo> {
  return await getCMSValue<SystemContactInfo>("contactInfo", defaultDb.contactInfo!);
}

export async function updateContactInfo(info: SystemContactInfo): Promise<SystemContactInfo> {
  await setCMSValue<SystemContactInfo>("contactInfo", info);
  return info;
}

// HOMEPAGE CONTENT HELPERS
export async function getHomepageContent(): Promise<HomepageContent> {
  return await getCMSValue<HomepageContent>("homepageContent", defaultDb.homepageContent!);
}

export async function updateHomepageContent(content: HomepageContent): Promise<HomepageContent> {
  await setCMSValue<HomepageContent>("homepageContent", content);
  return content;
}

// ADMISSIONS CONFIG HELPERS
export async function getAdmissionsConfig(): Promise<AdmissionsConfig> {
  return await getCMSValue<AdmissionsConfig>("admissionsConfig", defaultDb.admissionsConfig!);
}

export async function updateAdmissionsConfig(config: AdmissionsConfig): Promise<AdmissionsConfig> {
  await setCMSValue<AdmissionsConfig>("admissionsConfig", config);
  return config;
}

// USERS MANAGEMENT HELPERS
export async function getUsers(): Promise<User[]> {
  return await getCMSValue<User[]>("users", defaultDb.users!);
}

export async function saveUsers(usersList: User[]): Promise<void> {
  await setCMSValue<User[]>("users", usersList);
}

// AUDIT LOG HELPERS
export async function getAuditLogs(): Promise<AuditLog[]> {
  return await getCMSValue<AuditLog[]>("auditLogs", []);
}

export async function addAuditLog(
  username: string,
  role: string,
  action: string,
  details: string
): Promise<AuditLog> {
  const users = await getUsers();
  let actorName = username;
  const u = users.find((user) => user.username === username);
  if (u) actorName = u.name;

  const newLog: AuditLog = {
    id: "audit_" + Math.random().toString(36).substring(2, 9),
    username,
    name: actorName,
    role,
    action,
    details,
    timestamp: new Date().toISOString(),
  };

  const pool = getPool();
  if (pool) {
    try {
      await initDbSchema();
      await pool.query(
        `UPDATE cms_store
         SET value = (
           SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
           FROM (
             SELECT elem FROM jsonb_array_elements(jsonb_insert(value, '{0}', $1::jsonb)) elem LIMIT 500
           ) t
         ), updated_at = CURRENT_TIMESTAMP
         WHERE key = 'auditLogs'`,
        [JSON.stringify(newLog)]
      );
      if (configCache["auditLogs"]) {
        const cached = configCache["auditLogs"].value as AuditLog[];
        configCache["auditLogs"].value = [newLog, ...cached].slice(0, 500);
        configCache["auditLogs"].timestamp = Date.now();
      }
      return newLog;
    } catch (err) {
      console.error("[db] Failed to add audit log:", err);
      throw err;
    }
  }

  ensureDbFile();
  const data = await fs.promises.readFile(DB_PATH, "utf-8");
  const db = JSON.parse(data);
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift(newLog);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  await fs.promises.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  return newLog;
}

// Notification Logs Helpers
export async function getNotificationLogs(): Promise<NotificationLog[]> {
  return await getCMSValue<NotificationLog[]>("notificationLogs", []);
}

export async function addNotificationLog(
  logData: Omit<NotificationLog, "id" | "createdAt">
): Promise<NotificationLog> {
  const newLog: NotificationLog = {
    ...logData,
    id: "log_" + Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
  };

  const pool = getPool();
  if (pool) {
    try {
      await initDbSchema();
      await pool.query(
        `UPDATE cms_store
         SET value = (
           SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
           FROM (
             SELECT elem FROM jsonb_array_elements(jsonb_insert(value, '{0}', $1::jsonb)) elem LIMIT 100
           ) t
         ), updated_at = CURRENT_TIMESTAMP
         WHERE key = 'notificationLogs'`,
        [JSON.stringify(newLog)]
      );
      if (configCache["notificationLogs"]) {
        const cached = configCache["notificationLogs"].value as NotificationLog[];
        configCache["notificationLogs"].value = [newLog, ...cached].slice(0, 100);
        configCache["notificationLogs"].timestamp = Date.now();
      }
      return newLog;
    } catch (err) {
      console.error("[db] Failed to add notification log:", err);
      throw err;
    }
  }

  ensureDbFile();
  const data = await fs.promises.readFile(DB_PATH, "utf-8");
  const db = JSON.parse(data);
  if (!db.notificationLogs) db.notificationLogs = [];
  db.notificationLogs.unshift(newLog);
  if (db.notificationLogs.length > 100) {
    db.notificationLogs = db.notificationLogs.slice(0, 100);
  }
  await fs.promises.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  return newLog;
}

// Inquiry Helpers
export async function getInquiries(): Promise<Inquiry[]> {
  const inquiries = await getCMSValue<Inquiry[]>("inquiries", []);
  return inquiries.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function addInquiry(
  inquiryData: Omit<Inquiry, "id" | "status" | "createdAt">
): Promise<Inquiry> {
  const newInquiry: Inquiry = {
    ...inquiryData,
    id: "inq_" + Math.random().toString(36).substring(2, 9),
    status: "Pending",
    createdAt: new Date().toISOString(),
    smsStatus: "pending",
    waStatus: "pending",
  };

  await appendToCMSArray<Inquiry>("inquiries", newInquiry, true);
  (async () => {
    let telegramSuccess = false;
    try {
      const dateStr = new Date(newInquiry.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const telegramBody = `📥 New Admission Inquiry\n\n` +
        `👤 Student: ${newInquiry.name}\n` +
        `👨 Parent: ${newInquiry.parentName || "N/A"}\n` +
        `📞 Phone: ${newInquiry.phone}\n` +
        `📧 Email: ${newInquiry.email}\n` +
        `🏫 Class: ${newInquiry.grade}\n` +
        `📝 Message: ${newInquiry.message || "N/A"}\n\n` +
        `🕒 Submitted: ${dateStr}`;

      const telRes = await sendTelegramMessage(telegramBody);
      if (telRes.success) {
        telegramSuccess = true;
        console.log(`[TELEGRAM NOTIFICATION] SUCCESS: Telegram message sent successfully (Message ID: ${telRes.sid})`);
      } else {
        console.error(`[TELEGRAM NOTIFICATION] FAILURE: Telegram message failed. Error: ${telRes.error}`);
      }
    } catch (e: any) {
      console.error(`[TELEGRAM NOTIFICATION] Error sending Telegram message:`, e.message || e);
    }

    // Fallback to Twilio if Telegram failed
    if (!telegramSuccess) {
      console.log(`[NOTIFICATIONS] Telegram failed or was not configured. Falling back to Twilio...`);
      const settings = await getSettings();
      const admissionsPhone = settings.smsNotificationPhone?.trim();
      const messageBody = `${settings.schoolName} / ${settings.schoolSubName}: New admission inquiry received for ${newInquiry.grade}. Student: ${newInquiry.name}, Parent: ${newInquiry.parentName || "N/A"}, Phone: ${newInquiry.phone}.`;

      try {
        const schoolWaRes = await sendInquiryWhatsAppNotification(newInquiry);
        if (schoolWaRes.success) {
          console.log(`[SCHOOL WHATSAPP] SUCCESS: WhatsApp delivered to school (SID: ${schoolWaRes.sid})`);
        } else {
          console.error(`[SCHOOL WHATSAPP] FAILURE: WhatsApp delivery failed. Error: ${schoolWaRes.error}`);
        }
      } catch (e: any) {
        console.error(`[SCHOOL WHATSAPP] Error sending WhatsApp notification:`, e);
      }

      if (admissionsPhone) {
        console.log(`[NOTIFICATIONS] Sending notifications for inquiry ${newInquiry.id} to ${admissionsPhone}...`);
        
        let smsSuccess = false;
        let smsErr: string | undefined;
        let waSuccess = false;
        let waErr: string | undefined;

        try {
          const smsRes = await sendTwilioSMS(admissionsPhone, messageBody);
          if (smsRes.success) {
            smsSuccess = true;
            await addNotificationLog({
              type: "sms",
              recipient: admissionsPhone,
              inquiryId: newInquiry.id,
              inquiryName: newInquiry.name,
              status: "success"
            });
          } else {
            smsErr = smsRes.error;
            await addNotificationLog({
              type: "sms",
              recipient: admissionsPhone,
              inquiryId: newInquiry.id,
              inquiryName: newInquiry.name,
              status: "failure",
              errorMessage: smsRes.error
            });
          }
        } catch (err: any) {
          smsErr = err.message || "SMS failed";
        }

        try {
          const waRes = await sendTwilioWhatsApp(admissionsPhone, messageBody);
          if (waRes.success) {
            waSuccess = true;
            await addNotificationLog({
              type: "whatsapp",
              recipient: admissionsPhone,
              inquiryId: newInquiry.id,
              inquiryName: newInquiry.name,
              status: "success"
            });
          } else {
            waErr = waRes.error;
            await addNotificationLog({
              type: "whatsapp",
              recipient: admissionsPhone,
              inquiryId: newInquiry.id,
              inquiryName: newInquiry.name,
              status: "failure",
              errorMessage: waRes.error
            });
          }
        } catch (err: any) {
          waErr = err.message || "WhatsApp failed";
        }

        await updateInCMSArray<Inquiry>("inquiries", newInquiry.id, {
          smsStatus: smsSuccess ? "success" : "failure",
          smsError: smsErr,
          waStatus: waSuccess ? "success" : "failure",
          waError: waErr
        });
      } else {
        await updateInCMSArray<Inquiry>("inquiries", newInquiry.id, {
          smsStatus: "failure",
          smsError: "No admissions phone number configured in Settings.",
          waStatus: "failure",
          waError: "No admissions phone number configured in Settings."
        });
        await addNotificationLog({
          type: "both",
          recipient: "N/A",
          inquiryId: newInquiry.id,
          inquiryName: newInquiry.name,
          status: "failure",
          errorMessage: "No admissions phone number configured in Settings."
        });
      }
    }
  })().catch(err => {
    console.error("[db] Background notification pipeline failed:", err);
  });;

  return newInquiry;
}

export async function updateInquiryStatus(
  id: string,
  status: Inquiry["status"]
): Promise<Inquiry | null> {
  return await updateInCMSArray<Inquiry>("inquiries", id, { status });
}

export async function deleteInquiry(id: string): Promise<boolean> {
  return await deleteFromCMSArray("inquiries", id);
}

// Notice (Announcement) Helpers
export async function getNotices(): Promise<Notice[]> {
  return await getCMSValue<Notice[]>("notices", []);
}

export async function addNotice(noticeData: Omit<Notice, "id" | "date">): Promise<Notice> {
  const newNotice: Notice = {
    ...noticeData,
    id: "not_" + Math.random().toString(36).substring(2, 9),
    date: new Date().toISOString().split("T")[0],
  };
  await appendToCMSArray<Notice>("notices", newNotice, true);
  return newNotice;
}

export async function updateNotice(id: string, noticeData: Partial<Notice>): Promise<Notice | null> {
  return await updateInCMSArray<Notice>("notices", id, noticeData);
}

export async function deleteNotice(id: string): Promise<boolean> {
  return await deleteFromCMSArray("notices", id);
}

// Announcement Helpers
export async function getAnnouncements(): Promise<Notice[]> {
  return await getCMSValue<Notice[]>("announcements", []);
}

export async function addAnnouncement(annData: Omit<Notice, "id" | "date">): Promise<Notice> {
  const newAnn: Notice = {
    ...annData,
    id: "ann_" + Math.random().toString(36).substring(2, 9),
    date: new Date().toISOString().split("T")[0],
  };
  await appendToCMSArray<Notice>("announcements", newAnn, true);
  return newAnn;
}

export async function updateAnnouncement(id: string, annData: Partial<Notice>): Promise<Notice | null> {
  return await updateInCMSArray<Notice>("announcements", id, annData);
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  return await deleteFromCMSArray("announcements", id);
}

// Gallery Helpers
export async function getGallery(): Promise<GalleryItem[]> {
  return await getCMSValue<GalleryItem[]>("gallery", defaultDb.gallery!);
}

export async function addGalleryItem(itemData: Omit<GalleryItem, "id">): Promise<GalleryItem> {
  const newItem: GalleryItem = {
    ...itemData,
    id: "gal_" + Math.random().toString(36).substring(2, 9),
  };
  await appendToCMSArray<GalleryItem>("gallery", newItem, true);
  return newItem;
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  return await deleteFromCMSArray("gallery", id);
}

// Achievement Helpers
export async function getAchievements(): Promise<Achievement[]> {
  return await getCMSValue<Achievement[]>("achievements", defaultDb.achievements!);
}

export async function updateAchievement(key: string, value: string): Promise<Achievement | null> {
  const achievements = await getAchievements();
  const index = achievements.findIndex((a) => a.key === key);
  if (index === -1) return null;

  achievements[index].value = value;
  await setCMSValue<Achievement[]>("achievements", achievements);
  return achievements[index];
}

// Testimonial Helpers
export async function getTestimonials(): Promise<Testimonial[]> {
  return await getCMSValue<Testimonial[]>("testimonials", defaultDb.testimonials!);
}

export async function addTestimonial(testimonialData: Omit<Testimonial, "id">): Promise<Testimonial> {
  const newTestimonial: Testimonial = {
    ...testimonialData,
    id: "test_" + Math.random().toString(36).substring(2, 9),
  };
  await appendToCMSArray<Testimonial>("testimonials", newTestimonial, false);
  return newTestimonial;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  return await deleteFromCMSArray("testimonials", id);
}

// Popup Helpers
export async function getPopups(): Promise<Popup[]> {
  return await getCMSValue<Popup[]>("popups", []);
}

export async function addPopup(popupData: Omit<Popup, "id" | "createdAt">): Promise<Popup> {
  const id = "pop_" + Math.random().toString(36).substring(2, 9);
  const newPopup: Popup = {
    ...popupData,
    id,
    createdAt: new Date().toISOString(),
  };

  const pool = getPool();
  if (pool) {
    try {
      await initDbSchema();
      if (popupData.isActive) {
        await pool.query(
          `UPDATE cms_store
           SET value = (
             SELECT COALESCE(jsonb_agg(jsonb_set(elem, '{isActive}', 'false'::jsonb)), '[]'::jsonb)
             FROM jsonb_array_elements(value) elem
           )
           WHERE key = 'popups'`
        );
      }
      delete configCache["popups"];
      await appendToCMSArray<Popup>("popups", newPopup, true);
      return newPopup;
    } catch (err) {
      console.error("[db] Failed to add popup:", err);
      throw err;
    }
  }

  ensureDbFile();
  const db = await getDb();
  if (!db.popups) db.popups = [];
  if (popupData.isActive) {
    db.popups.forEach(p => p.isActive = false);
  }
  db.popups.unshift(newPopup);
  await saveDb(db);
  return newPopup;
}

export async function updatePopup(id: string, popupData: Partial<Popup>): Promise<Popup | null> {
  const pool = getPool();
  if (pool) {
    try {
      await initDbSchema();
      if (popupData.isActive) {
        await pool.query(
          `UPDATE cms_store
           SET value = (
             SELECT COALESCE(jsonb_agg(jsonb_set(elem, '{isActive}', 'false'::jsonb)), '[]'::jsonb)
             FROM jsonb_array_elements(value) elem
             WHERE elem->>'id' <> $1
           )
           WHERE key = 'popups'`,
          [id]
        );
      }
      delete configCache["popups"];
      return await updateInCMSArray<Popup>("popups", id, popupData);
    } catch (err) {
      console.error("[db] Failed to update popup:", err);
      throw err;
    }
  }

  ensureDbFile();
  const db = await getDb();
  if (!db.popups) return null;
  const index = db.popups.findIndex((p) => p.id === id);
  if (index === -1) return null;
  if (popupData.isActive) {
    db.popups.forEach(p => {
      if (p.id !== id) p.isActive = false;
    });
  }
  db.popups[index] = { ...db.popups[index], ...popupData };
  await saveDb(db);
  return db.popups[index];
}

export async function deletePopup(id: string): Promise<boolean> {
  return await deleteFromCMSArray("popups", id);
}
