import { scrapeWebsite } from "./website";
import { isYouTubeUrl, scrapeYouTube } from "./youtube";

export type { ScrapedRecipeData } from "./types";
import type { ScrapedRecipeData } from "./types";

/**
 * Scrapes recipe data from a URL.
 *
 * Detects the URL type and delegates to the appropriate scraper:
 *  - YouTube videos/shorts → extracts the video description
 *  - Normal websites        → Cheerio (fast) with Puppeteer fallback
 */
export async function scrapeRecipeFromUrl(url: string): Promise<ScrapedRecipeData> {
  if (isYouTubeUrl(url)) {
    console.log("Detected YouTube URL — scraping video description...");
    return scrapeYouTube(url);
  }

  console.log("Detected website URL — scraping page content...");
  return scrapeWebsite(url);
}
