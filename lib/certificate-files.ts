export const MAX_CERTIFICATE_BYTES = 10 * 1024 * 1024;
export const CERTIFICATE_UPLOAD_CONCURRENCY = 3;

type CertificateFileMetadata = {
  name: string;
  size: number;
  type: string;
  lastModified?: number;
};

export function validateCertificateFileMetadata(file: CertificateFileMetadata): string | null {
  if (file.size === 0) return "El archivo está vacío.";
  if (file.size > MAX_CERTIFICATE_BYTES) return "El PDF supera el límite de 10 MB.";
  if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
    return "Selecciona un archivo PDF válido.";
  }
  return null;
}

export function certificateFileFingerprint(file: CertificateFileMetadata) {
  return `${file.name.trim().toLowerCase()}:${file.size}:${file.lastModified ?? 0}`;
}

export function hasPdfSignature(bytes: Uint8Array) {
  return bytes.length >= 5
    && bytes[0] === 0x25
    && bytes[1] === 0x50
    && bytes[2] === 0x44
    && bytes[3] === 0x46
    && bytes[4] === 0x2d;
}

export async function validateCertificateFile(file: File): Promise<string | null> {
  const metadataError = validateCertificateFileMetadata(file);
  if (metadataError) return metadataError;
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return hasPdfSignature(header) ? null : "El contenido no tiene una firma PDF válida.";
}

export async function runWithConcurrency<T>(items: readonly T[], limit: number, worker: (item: T) => Promise<void>) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error("El límite de concurrencia debe ser positivo.");
  let nextIndex = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const item = items[nextIndex];
      nextIndex += 1;
      await worker(item);
    }
  });
  await Promise.all(runners);
}
