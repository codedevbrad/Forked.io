"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Get S3 client configured for Cloudflare R2
 */
function getR2Client(): S3Client {
  const accountId = process.env.CLOUDFLARE_ACC_ID;
  const accessKeyId = process.env.CLOUDFLARE_ACCESSKEY;
  const secretAccessKey = process.env.CLOUDFLARE_SECRETKEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const s3Api = process.env.CLOUDFLARE_S3_API;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !s3Api) {
    throw new Error("Missing required Cloudflare R2 environment variables");
  }

  return new S3Client({
    region: "auto",
    endpoint: s3Api,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Upload a recipe image to Cloudflare R2
 * Uses recipes/ folder structure instead of business-images/
 * @param fileBuffer - The file buffer to upload
 * @param fileName - The name of the file
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadRecipeImageToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const publicDevUrl = process.env.CLOUDFLARE_PUBLIC_DEV_URL;

    if (!bucketName || !publicDevUrl) {
      return { success: false, error: "Missing required Cloudflare R2 environment variables" };
    }

    const s3Client = getR2Client();
    
    // Upload to recipes/ folder
    const key = `recipes/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Construct the public URL
    // The publicDevUrl already includes the bucket, so we just append the key
    const publicUrl = `${publicDevUrl}/${key}`;

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Error uploading recipe image to R2:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

