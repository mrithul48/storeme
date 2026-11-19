// src/app/api/upload/route.ts
// Secure image upload endpoint for dashboard products, logos, banners

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "products";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // 1. Prevent files larger than 4 MB
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File size exceeds the 4 MB limit. Please upload an image under 4 MB.",
        },
        { status: 400 }
      );
    }

    // 2. Compress only if file exceeds 2 MB; otherwise keep 100% uncompressed
    const COMPRESSION_THRESHOLD = 2 * 1024 * 1024; // 2 MB
    const shouldCompress = file.size > COMPRESSION_THRESHOLD;

    // Convert file to base64 buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await uploadImage(base64Data, {
      folder: `store-builder/${folder}`,
      compress: shouldCompress,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ success: false, error: "Image upload failed" }, { status: 500 });
  }
}
