import "server-only";

import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  const missing = (
    [
      ["CLOUDINARY_CLOUD_NAME", cloudName],
      ["CLOUDINARY_API_KEY", apiKey],
      ["CLOUDINARY_API_SECRET", apiSecret],
    ] as const
  )
    .filter(([, v]) => !v)
    .map(([k]) => k)
    .join(", ");

  throw new Error(
    `Cloudinary configuration error: missing environment variable(s): ${missing}. ` +
      "Ensure they are set in .env.local (development) or your deployment environment.",
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export { cloudinary };
