import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getAdminRole } from "@/app/actions";
import { getPool, initDbSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

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
    try {
      await initDbSchema();
      const base64 = buffer.toString("base64");
      await dbPool.query(
        `INSERT INTO uploaded_files (filename, mime_type, data_base64) VALUES ($1, $2, $3)
         ON CONFLICT (filename) DO UPDATE SET mime_type = $2, data_base64 = $3`,
        [filename, mimeType, base64]
      );
      console.log(`[API UPLOAD] Persistent upload stored in PostgreSQL: ${filename}`);
    } catch (e: any) {
      console.error(`[API UPLOAD] Failed to store file ${filename} in PostgreSQL:`, e);
      throw new Error(`Database upload failed: ${e.message}`);
    }
  }
}

export async function POST(request: NextRequest) {
  const role = await getAdminRole();
  if (!role) {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const isPopup = formData.get("isPopup") === "true";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const MAX_SIZE = 25 * 1024 * 1024; // 25MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "File size exceeds the 25MB limit." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    const allowedExtensions = isPopup
      ? [".jpg", ".jpeg", ".png", ".webp"]
      : [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json({
        success: false,
        error: `Invalid file type. Allowed: ${allowedExtensions.join(", ").toUpperCase().replace(/\./g, "")}`
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const originalBuffer = Buffer.from(bytes);

    let finalBuffer = originalBuffer;
    let finalMimeType = getMimeType(ext);

    // Server-side Image Optimization and Compression
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    if (imageExtensions.includes(ext)) {
      try {
        console.log(`[API UPLOAD] Optimizing image: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
        const sharpInstance = sharp(originalBuffer).resize({
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
        console.log(`[API UPLOAD] Image optimized successfully. New size: ${(finalBuffer.length / (1024 * 1024)).toFixed(2)} MB`);
      } catch (err: any) {
        console.error("[API UPLOAD] Image optimization failed, saving original instead:", err);
      }
    }

    const prefix = isPopup ? "popup_" : "";
    const filename = `${prefix}${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
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
    await saveFileToDb(filename, finalBuffer, finalMimeType);

    return NextResponse.json({ success: true, url: relativePath });
  } catch (error: any) {
    console.error("[API UPLOAD] Upload handler failed:", error);
    return NextResponse.json({ success: false, error: error.message || "Upload failed" }, { status: 500 });
  }
}
