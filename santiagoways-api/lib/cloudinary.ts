import { v2 as cloudinary } from 'cloudinary';

let configured = false;

function configure() {
  if (configured) return;
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error('Cloudinary is not configured');
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  configured = true;
}

export type SignedUpload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  uploadUrl: string;
  // The set of additional fields the client must send verbatim alongside the
  // file to satisfy the signature.
  publicIdPrefix?: string;
};

// Returns parameters the client uses to PUT/POST the file directly to
// Cloudinary's upload API. The signature is short-lived (timestamp +/- ~1h)
// and bound to the folder so signed credentials cannot upload elsewhere.
export function signUpload(opts: { folder: 'avatars' | 'posts'; userId: string }): SignedUpload {
  configure();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `santiagoways/${opts.folder}/${opts.userId}`;
  const publicIdPrefix = `${opts.folder}_${opts.userId}_${timestamp}`;

  const signature = cloudinary.utils.api_sign_request(
    { folder, public_id: publicIdPrefix, timestamp },
    process.env.CLOUDINARY_API_SECRET!,
  );
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder,
    publicIdPrefix,
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
  };
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

// Validates that a URL points at *our* Cloudinary cloud — used to guard against
// users smuggling arbitrary URLs into post/avatar fields.
export function isOwnCloudinaryUrl(url: string): boolean {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    if (!parsed.hostname.endsWith('cloudinary.com')) return false;
    return parsed.pathname.includes(`/${process.env.CLOUDINARY_CLOUD_NAME}/`);
  } catch {
    return false;
  }
}
