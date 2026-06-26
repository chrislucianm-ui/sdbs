import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  const publicPath = path.join(process.cwd(), "public", "uploads", filename);
  const tmpPath = path.join("/tmp", "uploads", filename);

  let filePath = publicPath;
  if (fs.existsSync(tmpPath)) {
    filePath = tmpPath;
  } else if (!fs.existsSync(publicPath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  let contentType = "application/octet-stream";
  if (ext === ".jpg" || ext === ".jpeg") {
    contentType = "image/jpeg";
  } else if (ext === ".png") {
    contentType = "image/png";
  } else if (ext === ".webp") {
    contentType = "image/webp";
  } else if (ext === ".gif") {
    contentType = "image/gif";
  } else if (ext === ".pdf") {
    contentType = "application/pdf";
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("Error reading file", { status: 500 });
  }
}
