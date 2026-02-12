import { config } from "dotenv";
import { resolve } from "path";
import { uploadRecipeImageToR2 } from "./r2";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

/**
 * Test function to verify Cloudflare R2 upload functionality
 * This can be called from a server action or API route to test uploads
 */
export default async function testR2Upload() {
  try {
    console.log("=== R2 Upload Test ===");
    
    // Check environment variables
    const accountId = process.env.CLOUDFLARE_ACC_ID;
    const accessKeyId = process.env.CLOUDFLARE_ACCESSKEY;
    const secretAccessKey = process.env.CLOUDFLARE_SECRETKEY;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const s3Api = process.env.CLOUDFLARE_S3_API;
    const publicDevUrl = process.env.CLOUDFLARE_PUBLIC_DEV_URL;

    console.log("Configuration check:");
    console.log("- Account ID:", accountId ? "✓ Set" : "✗ Missing");
    console.log("- Access Key:", accessKeyId ? "✓ Set" : "✗ Missing");
    console.log("- Secret Key:", secretAccessKey ? "✓ Set" : "✗ Missing");
    console.log("- Bucket Name:", bucketName || "✗ Missing");
    console.log("- S3 API:", s3Api || "✗ Missing");
    console.log("- Public Dev URL:", publicDevUrl || "✗ Missing");

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      console.error("\n✗ Missing required environment variables. Please check your .env file.");
      process.exit(1);
    }

    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    console.log("\nAttempting to upload test image...");
    console.log("- File size:", testImageBuffer.length, "bytes");
    console.log("- Content type: image/png");
    console.log("- Target bucket:", bucketName);
    console.log("- Target path: recipes/test-{timestamp}.png");

    const result = await uploadRecipeImageToR2(
      testImageBuffer,
      "test-image.png",
      "image/png"
    );

    if (result.success) {
      console.log("\n✓ Upload successful!");
      console.log("- URL:", result.url);
      
      // Test if the URL is accessible
      try {
        const response = await fetch(result.url, { method: "HEAD" });
        console.log("- URL accessible:", response.ok ? "✓ Yes" : "✗ No");
        console.log("- HTTP Status:", response.status);
      } catch (fetchError) {
        console.log("- URL accessibility check failed:", fetchError instanceof Error ? fetchError.message : "Unknown error");
      }

      console.log("\n✓ Test completed successfully!");
      process.exit(0);
    } else {
      console.log("\n✗ Upload failed!");
      console.log("- Error:", result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error("\n✗ Test failed with exception:", error);
    
    if (error && typeof error === "object" && "name" in error) {
      const awsError = error as { name: string; message: string; $metadata?: { httpStatusCode?: number } };
      console.error("- Error name:", awsError.name);
      console.error("- HTTP Status:", awsError.$metadata?.httpStatusCode);
      console.error("- Message:", awsError.message);
    } else {
      console.error("- Error:", error instanceof Error ? error.message : "Unknown error");
    }
    
    process.exit(1);
  }
}

testR2Upload();