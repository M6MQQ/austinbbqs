import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

/** Root directory for uploaded images. Falls back to a local dir in dev. */
export function uploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), ".data", "uploads");
}

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export function extensionForMime(mime: string): string | null {
  return ALLOWED[mime] ?? null;
}

/** Save an uploaded file buffer and return its relative path (used in DB + /api/images). */
export async function saveImage(
  data: Buffer,
  mime: string,
): Promise<{ relPath: string }> {
  const ext = extensionForMime(mime);
  if (!ext) throw new Error(`Unsupported image type: ${mime}`);
  const dir = uploadDir();
  await fs.mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(dir, name), data);
  return { relPath: name };
}

/** Resolve a relative image path safely within the upload dir (prevents traversal). */
export function resolveImagePath(relPath: string): string | null {
  const dir = path.resolve(uploadDir());
  const resolved = path.resolve(dir, relPath);
  if (resolved !== dir && !resolved.startsWith(dir + path.sep)) return null;
  return resolved;
}

export async function deleteImage(relPath: string): Promise<void> {
  const resolved = resolveImagePath(relPath);
  if (!resolved) return;
  await fs.rm(resolved, { force: true });
}

export function contentTypeForPath(p: string): string {
  const ext = path.extname(p).toLowerCase().slice(1);
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",
  };
  return map[ext] ?? "application/octet-stream";
}
