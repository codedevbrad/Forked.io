export type GoogleImage = {
  id: string;
  /** Best available image URL (original source or Google thumbnail proxy). */
  url: string;
  /** Thumbnail URL for grid display. */
  thumbUrl: string;
  width: number;
  height: number;
  /** Hostname of the source website, e.g. "example.com". */
  source: string;
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * Scrapes Google Image Search results for a given query.
 * Returns an array of image objects with URLs and metadata.
 *
 * This is a server-only service — do not import from client code.
 */
export async function searchGoogleImages(
  query: string,
  count = 20
): Promise<GoogleImage[]> {
  if (!query.trim()) return [];

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    query
  )}&tbm=isch&ijn=0`;

  const response = await fetch(searchUrl, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Google Images search failed: ${response.status}`);
  }

  const html = await response.text();

  return extractImages(html, count);
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

/**
 * Extracts image data from Google Image Search HTML.
 *
 * Google embeds image metadata inside `<script>` blocks as nested arrays.
 * Full-res image URLs appear in patterns like: ["https://…",width,height]
 * Google also serves thumbnail proxies at encrypted-tbn0.gstatic.com.
 */
function extractImages(html: string, limit: number): GoogleImage[] {
  const images: GoogleImage[] = [];
  const seen = new Set<string>();

  // --- Strategy 1: full-resolution image URLs from embedded script data ---
  // Matches: ["https://example.com/photo.jpg",1920,1080]
  const fullResRegex =
    /\["(https?:\/\/(?!encrypted-tbn)[^"]+)",\s*(\d+),\s*(\d+)\]/g;
  let match: RegExpExecArray | null;

  while ((match = fullResRegex.exec(html)) !== null && images.length < limit) {
    const [, url, wStr, hStr] = match;
    const width = parseInt(wStr, 10);
    const height = parseInt(hStr, 10);

    if (!isValidImageUrl(url, width, height)) continue;
    if (seen.has(url)) continue;
    seen.add(url);

    const thumbUrl = buildThumbUrl(url, 400);

    images.push({
      id: `gi-${images.length}`,
      url,
      thumbUrl,
      width,
      height,
      source: safeHostname(url),
    });
  }

  // --- Strategy 2: Google thumbnail proxy URLs as fallback ----------------
  if (images.length < limit) {
    const thumbProxyRegex =
      /https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:[A-Za-z0-9_\-&=;%]+/g;
    let thumbMatch: RegExpExecArray | null;

    while (
      (thumbMatch = thumbProxyRegex.exec(html)) !== null &&
      images.length < limit
    ) {
      // Decode HTML entities that Google sometimes injects
      const url = thumbMatch[0].replace(/&amp;/g, "&");
      if (seen.has(url)) continue;
      seen.add(url);

      images.push({
        id: `gi-thumb-${images.length}`,
        url,
        thumbUrl: url,
        width: 300,
        height: 200,
        source: "Google Images",
      });
    }
  }

  return images.slice(0, limit);
}

/** Filters out non-image URLs, Google's own assets, and tiny images. */
function isValidImageUrl(
  url: string,
  width: number,
  height: number
): boolean {
  const blockedHosts = [
    "gstatic.com",
    "google.com",
    "googleapis.com",
    "googleusercontent.com",
    "youtube.com",
    "ytimg.com",
  ];

  try {
    const hostname = new URL(url).hostname;
    if (blockedHosts.some((h) => hostname.includes(h))) return false;
  } catch {
    return false;
  }

  // Must look like an image (or have no extension — many CDN URLs don't)
  if (url.endsWith(".svg") || url.endsWith(".gif")) return false;

  // Skip tiny images (icons, logos, etc.)
  if (width < 200 || height < 150) return false;

  return true;
}

/** Builds a thumbnail URL — if the source supports resizing, use it; otherwise return the original. */
function buildThumbUrl(originalUrl: string, targetWidth: number): string {
  // Many CDNs/CMSs support width parameters — we can't know all of them,
  // so just return the original and rely on Next.js <Image> sizing.
  void targetWidth;
  return originalUrl;
}

/** Safely extracts the hostname from a URL. */
function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}
