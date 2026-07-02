"use server";

import fs from "fs";
import path from "path";
import { getAdminRole } from "@/app/actions";
import { getPool, initDbSchema } from "./db";
import sharp from "sharp";

function getMimeType(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

async function saveFileToDb(filename: string, buffer: Buffer, mimeType: string): Promise<void> {
  const dbPool = getPool();
  if (dbPool) {
    console.log(`[DATABASE] DATABASE_URL detected. Uploading file ${filename} to PostgreSQL...`);
    try {
      await initDbSchema();
      const base64 = buffer.toString("base64");
      await dbPool.query(
        `INSERT INTO uploaded_files (filename, mime_type, data_base64) VALUES ($1, $2, $3)
         ON CONFLICT (filename) DO UPDATE SET mime_type = $2, data_base64 = $3`,
        [filename, mimeType, base64]
      );
      console.log(`[DATABASE] Persistent upload stored in PostgreSQL: ${filename}`);
    } catch (e: any) {
      console.error(`[DATABASE] CRITICAL: Failed to store persistent upload ${filename} in PostgreSQL:`, e);
      throw new Error(`Production database file write failed: ${e.message}`);
    }
  } else {
    console.log(`[DATABASE] DATABASE_URL not set. Saving file ${filename} locally only.`);
  }
}

export async function uploadFileAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  const role = await getAdminRole();
  if (!role) {
    return { success: false, error: "Unauthorized access" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  const MAX_SIZE = 25 * 1024 * 1024; // 25MB
  if (file.size > MAX_SIZE) {
    return { success: false, error: "File size exceeds the 25MB limit." };
  }

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
  const ext = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return { success: false, error: "Invalid file type. Allowed: JPG, PNG, WebP, PDF" };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let finalBuffer = buffer;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    if (imageExtensions.includes(ext)) {
      try {
        console.log(`[FILE UPLOAD] Optimizing image: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
        const sharpInstance = sharp(buffer).resize({
          width: 1920,
          height: 1920,
          fit: "inside",
          withoutEnlargement: true,
        });

        if (ext === ".jpg" || ext === ".jpeg") {
          finalBuffer = await sharpInstance.jpeg({ quality: 80, progressive: true }).toBuffer();
        } else if (ext === ".png") {
          finalBuffer = await sharpInstance.png({ quality: 80, compressionLevel: 8 }).toBuffer();
        } else if (ext === ".webp") {
          finalBuffer = await sharpInstance.webp({ quality: 80 }).toBuffer();
        }
        console.log(`[FILE UPLOAD] Image optimized successfully. New size: ${(finalBuffer.length / (1024 * 1024)).toFixed(2)} MB`);
      } catch (err: any) {
        console.error("[FILE UPLOAD] Image optimization failed, saving original instead:", err);
      }
    }

    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const relativePath = `/uploads/${filename}`;
    
    const IS_VERCEL = !!process.env.VERCEL;
    const absolutePath = IS_VERCEL
      ? path.join("/tmp", "uploads", filename)
      : path.join(process.cwd(), "public", "uploads", filename);

    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(absolutePath, finalBuffer);
    console.log(`[FILE UPLOAD] Saved ${file.name} to ${relativePath}`);

    // Persistent Database upload
    const mimeType = getMimeType(ext);
    await saveFileToDb(filename, finalBuffer, mimeType);
    
    return { success: true, url: relativePath };
  } catch (error: any) {
    console.error("File upload failed:", error);
    return { success: false, error: error.message || "Failed to write file to disk" };
  }
}

export async function uploadPopupFileAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  const role = await getAdminRole();
  if (!role) {
    return { success: false, error: "Unauthorized access" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  // Strict 25MB limit for Popups
  const MAX_SIZE = 25 * 1024 * 1024; // 25MB
  if (file.size > MAX_SIZE) {
    return { success: false, error: "File size exceeds the 25MB limit." };
  }

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return { success: false, error: "Invalid file type. Allowed: JPG, PNG, WebP" };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let finalBuffer = buffer;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    if (imageExtensions.includes(ext)) {
      try {
        console.log(`[POPUP FILE UPLOAD] Optimizing image: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
        const sharpInstance = sharp(buffer).resize({
          width: 1920,
          height: 1920,
          fit: "inside",
          withoutEnlargement: true,
        });

        if (ext === ".jpg" || ext === ".jpeg") {
          finalBuffer = await sharpInstance.jpeg({ quality: 80, progressive: true }).toBuffer();
        } else if (ext === ".png") {
          finalBuffer = await sharpInstance.png({ quality: 80, compressionLevel: 8 }).toBuffer();
        } else if (ext === ".webp") {
          finalBuffer = await sharpInstance.webp({ quality: 80 }).toBuffer();
        }
        console.log(`[POPUP FILE UPLOAD] Image optimized successfully. New size: ${(finalBuffer.length / (1024 * 1024)).toFixed(2)} MB`);
      } catch (err: any) {
        console.error("[POPUP FILE UPLOAD] Image optimization failed, saving original instead:", err);
      }
    }

    const filename = `popup_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const relativePath = `/uploads/${filename}`;
    
    const IS_VERCEL = !!process.env.VERCEL;
    const absolutePath = IS_VERCEL
      ? path.join("/tmp", "uploads", filename)
      : path.join(process.cwd(), "public", "uploads", filename);

    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(absolutePath, finalBuffer);
    console.log(`[POPUP FILE UPLOAD] Saved ${file.name} to ${relativePath}`);

    // Persistent Database upload
    const mimeType = getMimeType(ext);
    await saveFileToDb(filename, finalBuffer, mimeType);
    
    return { success: true, url: relativePath };
  } catch (error: any) {
    console.error("Popup file upload failed:", error);
    return { success: false, error: error.message || "Failed to write file to disk" };
  }
}
