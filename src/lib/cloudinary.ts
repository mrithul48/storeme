// src/lib/cloudinary.ts
// Cloudinary server-side utilities

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Upload a base64 or URL to Cloudinary with optimization
 */
export async function uploadImage(
  source: string,
  options: {
    folder?: string;
    publicId?: string;
    maxWidth?: number;
    quality?: number;
  } = {}
): Promise<{ url: string; publicId: string }> {
  const { folder = "ecombuilder", publicId, maxWidth = 1200, quality = 80 } = options;

  const result = await cloudinary.uploader.upload(source, {
    folder,
    public_id: publicId,
    overwrite: !!publicId,
    transformation: [
      { width: maxWidth, crop: "limit" },
      { quality: quality, fetch_format: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Generate an optimized Cloudinary URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
  } = {}
): string {
  const { width = 800, height, crop = "fill", quality = 75 } = options;

  return cloudinary.url(publicId, {
    transformation: [
      { width, ...(height ? { height } : {}), crop },
      { quality, fetch_format: "auto" },
    ],
    secure: true,
  });
}

/**
 * Generate a signature for client-side uploads
 * This prevents unauthorized uploads to your Cloudinary account
 */
export function generateUploadSignature(
  folder: string,
  timestamp: number
): { signature: string; timestamp: number; cloudName: string; apiKey: string } {
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
  };
}
