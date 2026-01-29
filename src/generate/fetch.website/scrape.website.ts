import * as cheerio from "cheerio";

export type ScrapedWebsiteMeta = {
  name: string;
  description: string;
  imageURL: string;
  logoURL: string;
};

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/150";

/**
 * Scrapes a website URL to extract name, description, image and logo from meta/header.
 * Uses og:title, og:description, og:image and common header/logo selectors.
 */
export async function scrapeWebsiteMeta(url: string): Promise<ScrapedWebsiteMeta> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Invalid URL format");
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const resolve = (href: string | undefined): string => {
    if (!href || href.startsWith("data:")) return PLACEHOLDER_IMAGE;
    try {
      return new URL(href, parsedUrl.origin).href;
    } catch {
      return PLACEHOLDER_IMAGE;
    }
  };

  // Name: og:site_name, og:title, <title>
  let name =
    $('meta[property="og:site_name"]').attr("content")?.trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("title").first().text().trim() ||
    parsedUrl.hostname.replace(/^www\./, "");

  // Description: og:description, meta description
  const description =
    $('meta[property="og:description"]').attr("content")?.trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    "";

  // Image: og:image
  const imageURL =
    resolve($('meta[property="og:image"]').attr("content")) || PLACEHOLDER_IMAGE;

  // Logo: apple-touch-icon, shortcut icon, icon, or first header logo img
  let logoURL =
    $('link[rel="apple-touch-icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    $('link[rel="icon"]').attr("href");

  if (logoURL) {
    logoURL = resolve(logoURL);
  } else {
    const headerLogo = $("header img[src], [role='banner'] img[src], .logo img[src], [class*='logo'] img[src], [class*='brand'] img[src]").first().attr("src");
    logoURL = headerLogo ? resolve(headerLogo) : PLACEHOLDER_IMAGE;
  }

  if (!logoURL || logoURL === "") {
    logoURL = PLACEHOLDER_IMAGE;
  }

  return {
    name: name || parsedUrl.hostname,
    description: description || "",
    imageURL,
    logoURL,
  };
}
