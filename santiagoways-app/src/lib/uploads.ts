import { api } from './api';
import { withTimeout } from './withTimeout';

type SignedUpload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  uploadUrl: string;
  publicIdPrefix?: string;
};

type CloudinaryResponse = {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
};

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB hard cap on the client.

export type UploadFolder = 'avatars' | 'posts' | 'diary';

export async function uploadImage(localUri: string, folder: UploadFolder): Promise<string> {
  const signed = await api<SignedUpload>('/uploads/sign', {
    method: 'POST',
    body: { folder },
  });

  // Best-effort size check using HEAD on the local file URI (works on iOS/Android
  // for file:// URIs returned by ImagePicker). We don't fail loudly if HEAD is
  // unsupported — Cloudinary will reject oversized uploads anyway.
  try {
    const head = await withTimeout((signal) => fetch(localUri, { signal }), 8_000);
    const len = Number(head.headers.get('content-length') ?? 0);
    if (len && len > MAX_BYTES) {
      throw new Error('La imagen supera los 8 MB.');
    }
  } catch {
    /* size check is advisory */
  }

  const form = new FormData();
  // React Native FormData accepts the {uri, name, type} shape.
  form.append('file', {
    uri: localUri,
    name: `${signed.publicIdPrefix ?? 'upload'}.jpg`,
    type: 'image/jpeg',
  } as unknown as Blob);
  form.append('api_key', signed.apiKey);
  form.append('timestamp', String(signed.timestamp));
  form.append('signature', signed.signature);
  form.append('folder', signed.folder);
  if (signed.publicIdPrefix) form.append('public_id', signed.publicIdPrefix);

  const res = await withTimeout(
    (signal) => fetch(signed.uploadUrl, { method: 'POST', body: form, signal }),
    30_000,
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Cloudinary rejected upload (${res.status}) ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as CloudinaryResponse;
  return data.secure_url;
}

export async function uploadImages(uris: string[], folder: UploadFolder): Promise<string[]> {
  const out: string[] = [];
  for (const uri of uris) {
    out.push(await uploadImage(uri, folder));
  }
  return out;
}
