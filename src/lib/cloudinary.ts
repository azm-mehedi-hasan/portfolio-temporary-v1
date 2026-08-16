import "server-only";
import crypto from "node:crypto";

export const CLOUDINARY_FOLDER = "portfolio";

export function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return { cloudName, apiKey, apiSecret };
}

export function isCloudinaryConfigured() {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
  return Boolean(cloudName && apiKey && apiSecret);
}

/**
 * Signed direct upload: the browser sends the file straight to Cloudinary, so
 * large images never pass through a serverless function. The secret is only
 * ever used here, on the server, to sign the parameters.
 */
export function signUpload(params: Record<string, string | number>) {
  const { apiSecret } = cloudinaryConfig();
  if (!apiSecret) throw new Error("Cloudinary is not configured");

  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

export async function destroyAsset(publicId: string) {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
  if (!cloudName || !apiKey || !apiSecret) return;

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signUpload({ public_id: publicId, timestamp });

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      public_id: publicId,
      timestamp,
      api_key: apiKey,
      signature,
    }),
  });
}
