import type { ScrapedRecipeData } from "./types";

/**
 * Checks whether a URL points to a YouTube video or short.
 */
export function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    return (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be" ||
      host === "youtube-nocookie.com"
    );
  } catch {
    return false;
  }
}

/**
 * Extracts the video ID from various YouTube URL formats:
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://www.youtube.com/shorts/VIDEO_ID
 *  - https://youtube.com/embed/VIDEO_ID
 */
function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "").replace("m.", "");

    // youtu.be/VIDEO_ID
    if (host === "youtu.be") {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }

    // youtube.com/watch?v=VIDEO_ID
    const vParam = parsed.searchParams.get("v");
    if (vParam) return vParam;

    // youtube.com/shorts/VIDEO_ID or youtube.com/embed/VIDEO_ID
    const pathMatch = parsed.pathname.match(/^\/(shorts|embed)\/([a-zA-Z0-9_-]+)/);
    if (pathMatch) return pathMatch[2];

    return null;
  } catch {
    return null;
  }
}

/**
 * Scrapes recipe data from a YouTube video by extracting its description.
 *
 * YouTube embeds video metadata as JSON inside `<script>` tags
 * (`ytInitialPlayerResponse` / `ytInitialData`), so we can grab the title,
 * description and thumbnail without an API key.
 */
export async function scrapeYouTube(url: string): Promise<ScrapedRecipeData> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Could not extract YouTube video ID from URL");
  }

  // Always use the canonical watch URL so we get the full page with metadata
  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const response = await fetch(canonicalUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch YouTube page: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  // ── Extract ytInitialPlayerResponse (contains title + description) ──
  const playerResponse = extractJson(html, "ytInitialPlayerResponse");
  const initialData = extractJson(html, "ytInitialData");

  let title = "";
  let description = "";
  const images: string[] = [];

  // --- From playerResponse ---
  if (playerResponse) {
    const videoDetails = playerResponse.videoDetails;
    if (videoDetails) {
      title = videoDetails.title || "";
      description = videoDetails.shortDescription || "";

      // High-res thumbnail
      const thumbs: { url: string }[] = videoDetails.thumbnail?.thumbnails || [];
      if (thumbs.length > 0) {
        // Take the highest resolution thumbnail (last in array)
        images.push(thumbs[thumbs.length - 1].url);
      }
    }
  }

  // --- Fallback / supplement from initialData ---
  if (initialData && !description) {
    try {
      // The description lives deep in the engagement panels or the
      // two-column watch results. Walk the tree cautiously.
      const contents =
        initialData?.contents?.twoColumnWatchNextResults?.results?.results?.contents;

      if (Array.isArray(contents)) {
        for (const item of contents) {
          const primary = item?.videoSecondaryInfoRenderer;
          if (primary) {
            const descRuns: { text: string }[] =
              primary?.attributedDescription?.content
                ? [{ text: primary.attributedDescription.content }]
                : primary?.description?.runs || [];
            if (descRuns.length > 0) {
              description = descRuns.map((r) => r.text).join("");
            }
          }
          // Also try to grab the title from primary info
          if (!title) {
            const primaryInfo = item?.videoPrimaryInfoRenderer;
            if (primaryInfo) {
              const titleRuns: { text: string }[] = primaryInfo?.title?.runs || [];
              title = titleRuns.map((r) => r.text).join("");
            }
          }
        }
      }
    } catch {
      // Nested extraction failed — we still have whatever we got above
    }
  }

  if (!title && !description) {
    // Last-resort: try to grab <title> from the HTML
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    if (titleMatch) {
      title = titleMatch[1].replace(" - YouTube", "").trim();
    }
  }

  if (!description) {
    throw new Error(
      "Could not extract video description from YouTube. The video may be private or age-restricted."
    );
  }

  // Build the text block that will be sent to OpenAI for extraction.
  // We include the full description so the AI can pull out ingredients,
  // recipe name, etc.
  let text = "";
  if (title) {
    text += `Recipe Name: ${title}\n\n`;
  }
  text += `YouTube Video Description:\n${description}`;

  return {
    text,
    images,
    method: "youtube",
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Extracts a JSON object that YouTube embeds as:
 *   var NAME = { ... };
 * inside a <script> tag. Returns the parsed object or null.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractJson(html: string, varName: string): Record<string, any> | null {
  // YouTube uses two patterns:
  //   var ytInitialPlayerResponse = {...};
  //   window["ytInitialData"] = {...};
  const patterns = [
    new RegExp(`var\\s+${varName}\\s*=\\s*`, "s"),
    new RegExp(`window\\["${varName}"\\]\\s*=\\s*`, "s"),
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (!match) continue;

    const startIdx = match.index + match[0].length;
    // Find the matching closing brace
    const jsonStr = extractBalancedJson(html, startIdx);
    if (jsonStr) {
      try {
        return JSON.parse(jsonStr);
      } catch {
        // Malformed JSON, try next pattern
      }
    }
  }

  return null;
}

/**
 * Starting from `start` in `str`, extracts a balanced `{…}` JSON string.
 * Handles nested braces and quoted strings.
 */
function extractBalancedJson(str: string, start: number): string | null {
  if (str[start] !== "{") return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < str.length; i++) {
    const ch = str[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === "\\") {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return str.slice(start, i + 1);
      }
    }
  }

  return null;
}
