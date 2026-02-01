"use server";

import * as cheerio from "cheerio";
import { Retailer, Unit } from "@prisma/client";

/**
 * Scraped product shape matching ShopProduct schema (fields we can get from scraping).
 * Excludes id, userId, createdAt, updatedAt.
 */
export type ScrapedProduct = {
  retailer: Retailer;
  productName: string;
  url: string | null;
  price: number | null; // pence
  size: number | null;
  unit: Unit | null;
  imageUrl: string | null;
};

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

const ACCEPT_LANGUAGES = [
  "en-GB,en;q=0.9",
  "en-GB,en;q=0.9,en-US;q=0.8",
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/** Human-like delay in ms (avoids fixed intervals). */
function humanDelay(minMs: number, maxMs: number): Promise<void> {
  const ms = randomBetween(minMs, maxMs);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Build request headers that look like a real browser. */
function humanHeaders(baseUrl: string): HeadersInit {
  return {
    "User-Agent": pick(USER_AGENTS),
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": pick(ACCEPT_LANGUAGES),
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    "Sec-Ch-Ua":
      '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    Referer: baseUrl,
  };
}

function getSearchUrl(retailer: Retailer, searchTerm: string): string {
  const encoded = encodeURIComponent(searchTerm.trim());
  switch (retailer) {
    case "TESCO":
      return `https://www.tesco.com/groceries/en-GB/search?query=${encoded}&sortBy=relevance`;
    case "MORRISONS":
      return `https://groceries.morrisons.com/search?query=${encoded}`;
    case "SAINSBURYS":
      return `https://www.sainsburys.co.uk/gol-ui/SearchDisplayView?searchTerm=${encoded}`;
    case "ASDA":
      return `https://groceries.asda.com/search/${encoded}`;
    default:
      return `https://www.tesco.com/groceries/en-GB/search?query=${encoded}`;
  }
}

function getBaseUrl(retailer: Retailer): string {
  switch (retailer) {
    case "TESCO":
      return "https://www.tesco.com/groceries/en-GB";
    case "MORRISONS":
      return "https://groceries.morrisons.com";
    case "SAINSBURYS":
      return "https://www.sainsburys.co.uk";
    case "ASDA":
      return "https://groceries.asda.com";
    default:
      return "https://www.tesco.com/groceries/en-GB";
  }
}

/** Parse price string to pence. e.g. "£4.60" -> 460, "£1" -> 100 */
function parsePricePence(raw: string | undefined): number | null {
  if (!raw || typeof raw !== "string") return null;
  const cleaned = raw.replace(/\s/g, "");
  const match = cleaned.match(/£(\d+)(?:\.(\d{1,2}))?/);
  if (!match) return null;
  const pounds = parseInt(match[1]!, 10);
  const pence = match[2] ? parseInt(match[2].padEnd(2, "0").slice(0, 2), 10) : 0;
  return pounds * 100 + pence;
}

/** Extract size (number) and unit from product name or text. e.g. "400G" -> { size: 400, unit: Unit.g } */
function parseSizeAndUnit(text: string): { size: number | null; unit: Unit | null } {
  const lower = text.toLowerCase();
  const patterns: { regex: RegExp; unit: Unit }[] = [
    { regex: /(\d+(?:\.\d+)?)\s*kg\b/, unit: "kg" },
    { regex: /(\d+(?:\.\d+)?)\s*g\b/, unit: "g" },
    { regex: /(\d+(?:\.\d+)?)\s*ml\b/, unit: "ml" },
    { regex: /(\d+(?:\.\d+)?)\s*l\b/, unit: "l" },
  ];
  for (const { regex, unit } of patterns) {
    const m = lower.match(regex);
    if (m) {
      const num = parseFloat(m[1]!);
      if (unit === "g" || unit === "ml") return { size: Math.round(num), unit };
      if (unit === "kg") return { size: Math.round(num * 1000), unit };
      if (unit === "l") return { size: Math.round(num * 1000), unit };
      return { size: Math.round(num), unit };
    }
  }
  return { size: null, unit: null };
}

function resolveUrl(href: string | undefined, baseOrigin: string): string | null {
  if (!href || href.startsWith("javascript:") || href.startsWith("data:")) return null;
  try {
    return new URL(href, baseOrigin).href;
  } catch {
    return null;
  }
}

function parseTesco(html: string, baseUrl: string): ScrapedProduct[] {
  const $ = cheerio.load(html);
  const baseOrigin = new URL(baseUrl).origin;
  const results: ScrapedProduct[] = [];

  // Tesco product list: product cards / tiles with link, name, price
  const productSelectors = [
    '[data-auto="product-tile"]',
    '[class*="product-tile"]',
    '[class*="product-card"]',
    '[data-testid="product-tile"]',
    'article[class*="product"]',
    '.product-list__item',
    '[class*="ProductCard"]',
  ];

  let $cards: ReturnType<typeof $> = $(productSelectors[0]!);
  for (const sel of productSelectors) {
    $cards = $(sel);
    if ($cards.length > 0) break;
  }

  // Fallback: any repeated block that has a link + text that looks like a product (e.g. heading + price)
  if ($cards.length === 0) {
    $cards = $('a[href*="/groceries/"]').parent().parent();
    if ($cards.length === 0) $cards = $('a[href*="/product/"]').parent().parent();
  }

  $cards.each((_, el) => {
    const $el = $(el);
    const $linkCandidates = $el.find('a[href*="/groceries/"], a[href*="/product/"]');
    const $link = $linkCandidates.length > 0 ? $linkCandidates.first() : $el.find("a").first();
    const href = $link.attr("href");
    const url = resolveUrl(href, baseOrigin);

    const nameSelectors = ["h2", "h3", "[class*='title']", "[class*='name']", "a"];
    let productName = "";
    for (const sel of nameSelectors) {
      const $nameEl = $el.find(sel).first();
      if ($nameEl.length) {
        const text = $nameEl.text().trim();
        if (text.length > 2 && text.length < 200 && !/^(more like this|filter|sort)/i.test(text)) {
          productName = text;
          break;
        }
      }
    }
    if (!productName && $link.length) productName = $link.text().trim();
    if (!productName) return;

    const priceText =
      $el.find("[class*='price']").text().trim() ||
      $el.find("[data-auto='price']").text().trim() ||
      $el.text();
    const price = parsePricePence(priceText);

    const { size, unit } = parseSizeAndUnit(productName + " " + priceText);

    // Tesco product images: img.gyT8MW_baseImage, data-testid="imageElement_*", src="https://digitalcontent.api.tesco.com/..."
    let $img = $el.find('img[data-testid^="imageElement_"]').first();
    if (!$img.length) $img = $el.find('img[class*="gyT8MW"], img[class*="baseImage"]').first();
    if (!$img.length) $img = $el.find('img[src*="digitalcontent.api.tesco.com"]').first();
    if (!$img.length) $img = $el.find("img").first();
    const imgSrc = $img.attr("src") ?? $img.attr("data-src");
    const imageUrl = imgSrc ? resolveUrl(imgSrc, baseOrigin) : null;

    results.push({
      retailer: "TESCO",
      productName: productName.trim(),
      url,
      price,
      size,
      unit,
      imageUrl,
    });
  });

  // Dedupe by productName
  const seen = new Set<string>();
  return results.filter((p) => {
    const key = p.productName.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseMorrisons(html: string, baseUrl: string): ScrapedProduct[] {
  const $ = cheerio.load(html);
  const baseOrigin = new URL(baseUrl).origin;
  const results: ScrapedProduct[] = [];

  const productSelectors = [
    '[class*="product-tile"]',
    '[class*="product-card"]',
    '[data-testid*="product"]',
    'article[class*="product"]',
  ];
  let $cards: ReturnType<typeof $> = $(productSelectors[0]!);
  for (const sel of productSelectors) {
    $cards = $(sel);
    if ($cards.length > 0) break;
  }
  if ($cards.length === 0) $cards = $('a[href*="/products/"]').closest("li, div[class]");

  $cards.each((_, el) => {
    const $el = $(el);
    const $link = $el.find('a[href*="/products/"]').first();
    const href = $link.attr("href");
    const url = resolveUrl(href, baseOrigin);
    const productName = ($link.text() || $el.find("h2, h3, [class*='title']").first().text()).trim();
    if (!productName || productName.length > 200) return;

    const priceText = $el.find("[class*='price']").text().trim() || $el.text();
    const price = parsePricePence(priceText);
    const { size, unit } = parseSizeAndUnit(productName + " " + priceText);
    const $img = $el.find("img").first();
    const imageUrl = resolveUrl($img.attr("src") || $img.attr("data-src"), baseOrigin);

    results.push({
      retailer: "MORRISONS",
      productName,
      url,
      price,
      size,
      unit,
      imageUrl,
    });
  });

  const seen = new Set<string>();
  return results.filter((p) => {
    const key = p.productName.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseSainsburys(html: string, baseUrl: string): ScrapedProduct[] {
  const $ = cheerio.load(html);
  const baseOrigin = new URL(baseUrl).origin;
  const results: ScrapedProduct[] = [];

  const productSelectors = [
    '[class*="product-tile"]',
    '[class*="productCard"]',
    '[data-testid*="product"]',
    'li[class*="product"]',
  ];
  let $cards: ReturnType<typeof $> = $(productSelectors[0]!);
  for (const sel of productSelectors) {
    $cards = $(sel);
    if ($cards.length > 0) break;
  }
  if ($cards.length === 0) $cards = $('a[href*="/product/"]').closest("li, div[class]");

  $cards.each((_, el) => {
    const $el = $(el);
    const $link = $el.find('a[href*="/product/"]').first();
    const href = $link.attr("href");
    const url = resolveUrl(href, baseOrigin);
    const productName = ($link.text() || $el.find("h2, h3, [class*='title']").first().text()).trim();
    if (!productName || productName.length > 200) return;

    const priceText = $el.find("[class*='price']").text().trim() || $el.text();
    const price = parsePricePence(priceText);
    const { size, unit } = parseSizeAndUnit(productName + " " + priceText);
    const $img = $el.find("img").first();
    const imageUrl = resolveUrl($img.attr("src") || $img.attr("data-src"), baseOrigin);

    results.push({
      retailer: "SAINSBURYS",
      productName,
      url,
      price,
      size,
      unit,
      imageUrl,
    });
  });

  const seen = new Set<string>();
  return results.filter((p) => {
    const key = p.productName.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseAsda(html: string, baseUrl: string): ScrapedProduct[] {
  const $ = cheerio.load(html);
  const baseOrigin = new URL(baseUrl).origin;
  const results: ScrapedProduct[] = [];

  const productSelectors = [
    '[class*="product-tile"]',
    '[class*="product-card"]',
    '[data-testid*="product"]',
    'article[class*="product"]',
  ];
  let $cardsAsda: ReturnType<typeof $> = $(productSelectors[0]!);
  for (const sel of productSelectors) {
    $cardsAsda = $(sel);
    if ($cardsAsda.length > 0) break;
  }
  if ($cardsAsda.length === 0) $cardsAsda = $('a[href*="/product/"]').closest("li, div[class]");

  $cardsAsda.each((_, el) => {
    const $el = $(el);
    const $link = $el.find('a[href*="/product/"]').first();
    const href = $link.attr("href");
    const url = resolveUrl(href, baseOrigin);
    const productName = ($link.text() || $el.find("h2, h3, [class*='title']").first().text()).trim();
    if (!productName || productName.length > 200) return;

    const priceText = $el.find("[class*='price']").text().trim() || $el.text();
    const price = parsePricePence(priceText);
    const { size, unit } = parseSizeAndUnit(productName + " " + priceText);
    const $img = $el.find("img").first();
    const imageUrl = resolveUrl($img.attr("src") || $img.attr("data-src"), baseOrigin);

    results.push({
      retailer: "ASDA",
      productName,
      url,
      price,
      size,
      unit,
      imageUrl,
    });
  });

  const seen = new Set<string>();
  return results.filter((p) => {
    const key = p.productName.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseByRetailer(retailer: Retailer, html: string, baseUrl: string): ScrapedProduct[] {
  switch (retailer) {
    case "TESCO":
      return parseTesco(html, baseUrl);
    case "MORRISONS":
      return parseMorrisons(html, baseUrl);
    case "SAINSBURYS":
      return parseSainsburys(html, baseUrl);
    case "ASDA":
      return parseAsda(html, baseUrl);
    default:
      return parseTesco(html, baseUrl);
  }
}

/**
 * Scrape product search results for a retailer and search term.
 * Uses human-like delays and headers to reduce detection risk.
 * Returns an array of products matching the ShopProduct schema (scraped fields only).
 */
export async function scrapeProducts(
  retailer: Retailer,
  searchTerm: string
): Promise<ScrapedProduct[]> {
  const url = getSearchUrl(retailer, searchTerm);
  const baseUrl = getBaseUrl(retailer);

  await humanDelay(1500, 4000);

  const response = await fetch(url, {
    headers: humanHeaders(baseUrl),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Scrape failed (${retailer}): ${response.status} ${response.statusText}. URL: ${url}`
    );
  }

  const html = await response.text();
  await humanDelay(50, 200);

  const products = parseByRetailer(retailer, html, baseUrl);

  const maxResults = randomBetween(24, 48);
  return products.slice(0, maxResults);
}