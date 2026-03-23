export function extractGoogleDriveFileId(url: string): string | null {
  const trimmed = url.trim();

  const directMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (directMatch) return directMatch[1];

  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname.includes('drive.google.com')) return null;

    const id = parsed.searchParams.get('id');
    if (id) return id;

    const segments = parsed.pathname.split('/').filter(Boolean);
    const fileIndex = segments.indexOf('d');
    if (fileIndex >= 0 && segments[fileIndex + 1]) {
      return segments[fileIndex + 1];
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  const driveFileId = extractGoogleDriveFileId(trimmed);
  if (driveFileId) {
    return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1600`;
  }

  return trimmed;
}
