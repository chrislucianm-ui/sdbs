"use server";

import fs from "fs";
import path from "path";
import { getAdminRole } from "@/app/actions";

export async function uploadFileAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  const role = await getAdminRole();
  if (!role) {
    return { success: false, error: "Unauthorized access" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return { success: false, error: "File size exceeds the 10MB limit." };
  }

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
  const ext = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return { success: false, error: "Invalid file type. Allowed: JPG, PNG, WebP, PDF" };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

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

    await fs.promises.writeFile(absolutePath, buffer);
    console.log(`[FILE UPLOAD] Saved ${file.name} to ${relativePath}`);
    
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

  // Strict 5MB limit for Popups
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    return { success: false, error: "File size exceeds the 5MB limit." };
  }

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return { success: false, error: "Invalid file type. Allowed: JPG, PNG, WebP" };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

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

    await fs.promises.writeFile(absolutePath, buffer);
    console.log(`[POPUP FILE UPLOAD] Saved ${file.name} to ${relativePath}`);
    
    return { success: true, url: relativePath };
  } catch (error: any) {
    console.error("Popup file upload failed:", error);
    return { success: false, error: error.message || "Failed to write file to disk" };
  }
}
