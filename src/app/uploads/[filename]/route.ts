import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getPool, initDbSchema } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  const publicPath = path.join(process.cwd(), "public", "uploads", filename);
  const tmpPath = path.join("/tmp", "uploads", filename);

  let filePath = publicPath;
  let fileBuffer: Buffer | null = null;
  let contentType = "application/octet-stream";

  if (fs.existsSync(tmpPath)) {
    filePath = tmpPath;
  } else if (fs.existsSync(publicPath)) {
    filePath = publicPath;
  } else {
    // If not found locally, fetch from persistent PostgreSQL database
    const dbPool = getPool();
    if (dbPool) {
      console.log(`[FILE SERVICE] DATABASE_URL detected. Retrieving file ${filename} from PostgreSQL...`);
      try {
        await initDbSchema();
        const { rows } = await dbPool.query(
          "SELECT mime_type, data_base64 FROM uploaded_files WHERE filename = $1",
          [filename]
        );
        if (rows.length > 0) {
          const row = rows[0];
          contentType = row.mime_type;
          fileBuffer = Buffer.from(row.data_base64, "base64");

          // Cache it in /tmp so subsequent requests don't hit the DB
          const dir = path.dirname(tmpPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          await fs.promises.writeFile(tmpPath, fileBuffer);
          console.log(`[FILE SERVICE] Restored ${filename} from database cache`);
        } else {
          console.log(`[FILE SERVICE] File ${filename} not found in PostgreSQL.`);
          return new NextResponse("File not found in database", { status: 404 });
        }
      } catch (err: any) {
        console.error(`[FILE SERVICE] Database retrieval error for ${filename}:`, err);
        return new NextResponse(`Database retrieval error: ${err.message}`, { status: 500 });
      }
    } else {
      console.log(`[FILE SERVICE] DATABASE_URL not set. Serving file ${filename} from local storage fallback.`);
    }
  }

  if (!fileBuffer) {
    if (fs.existsSync(filePath)) {
      try {
        fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filename).toLowerCase();
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
      } catch (error) {
        return new NextResponse("Error reading file", { status: 500 });
      }
    } else {
      return new NextResponse("File not found", { status: 404 });
    }
  }

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
