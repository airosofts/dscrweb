import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const subscriptionId = formData.get("subscription_id") as string;

    if (!subscriptionId) {
      return Response.json({ error: "subscription_id is required" }, { status: 400 });
    }

    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return Response.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 10) {
      return Response.json({ error: "Maximum 10 files per upload" }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return Response.json(
          { error: `Invalid file type: ${file.type}. Allowed: PNG, JPEG, WebP, GIF, SVG` },
          { status: 400 },
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return Response.json(
          { error: `File "${file.name}" exceeds 10 MB limit` },
          { status: 400 },
        );
      }

      const ext = file.name.split(".").pop() || "png";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${subscriptionId}/${fileName}`;

      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabaseAdmin.storage
        .from("creative-assets")
        .upload(path, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error("[creative/upload] storage error:", error);
        return Response.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
      }

      const { data: urlData } = supabaseAdmin.storage
        .from("creative-assets")
        .getPublicUrl(path);

      urls.push(urlData.publicUrl);
    }

    return Response.json({ urls });
  } catch (err) {
    console.error("[creative/upload] error:", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
