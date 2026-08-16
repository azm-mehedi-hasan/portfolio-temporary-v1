import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  CLOUDINARY_FOLDER,
  cloudinaryConfig,
  isCloudinaryConfigured,
  signUpload,
} from "@/lib/cloudinary";

/**
 * Returns short-lived signed parameters for a direct browser upload.
 *
 * This is the one mutation that must be a Route Handler rather than a Server
 * Action: the browser needs the signature *before* it talks to Cloudinary.
 */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
      },
      { status: 501 }
    );
  }

  const { cloudName, apiKey } = cloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder: CLOUDINARY_FOLDER, timestamp };

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    folder: CLOUDINARY_FOLDER,
    signature: signUpload(params),
  });
}
