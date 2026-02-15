import * as cheerio from "cheerio";
import type { ScrapedRecipeData } from "./types";

/**
 * Scrapes recipe data from a URL using Puppeteer (headless browser).
 * Used as a fallback when the static Cheerio scraper can't find ingredients
 * (e.g. JS-rendered SPAs like Gousto).
 *
 * Same extraction logic as scrapeRecipeFromUrl but renders the page with
 * a real browser first so JavaScript-loaded content is available.
 */
export async function scrapeRecipeHeadless(url: string): Promise<ScrapedRecipeData> {
  let browser;

  try {
    // Dynamic import so puppeteer is only loaded when needed
    const puppeteer = await import("puppeteer");

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // Navigate and wait for network to settle (JS content loaded)
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Give extra time for any late-rendering JS frameworks
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get the fully rendered HTML
    const html = await page.content();
    const parsedUrl = new URL(url);
    const $ = cheerio.load(html);

    // ── Extract images ──────────────────────────────────────────
    const imageUrls: string[] = [];
    const imageSelectors = [
      '[class*="recipe-image"]',
      '[class*="recipe-img"]',
      '[class*="recipe-photo"]',
      '[itemprop="image"]',
      '[data-testid*="image"]',
      'img[class*="recipe"]',
      'img[class*="hero"]',
      'img[class*="featured"]',
      "article img",
      "main img",
      '[class*="content"] img',
    ];

    for (const selector of imageSelectors) {
      const images = $(selector);
      if (images.length > 0) {
        images.each((_, el) => {
          const src =
            $(el).attr("src") ||
            $(el).attr("data-src") ||
            $(el).attr("data-lazy-src");
          if (src) {
            try {
              const imageUrl = new URL(src, parsedUrl.origin).href;
              if (
                !imageUrl.startsWith("data:") &&
                !imageUrls.includes(imageUrl)
              ) {
                imageUrls.push(imageUrl);
              }
            } catch {
              // Invalid URL, skip
            }
          }
        });
        if (imageUrls.length > 0) break;
      }
    }

    // Fallback images
    if (imageUrls.length === 0) {
      const mainImages = $(
        'main img, article img, [class*="content"] img'
      ).slice(0, 5);
      mainImages.each((_, el) => {
        const src =
          $(el).attr("src") ||
          $(el).attr("data-src") ||
          $(el).attr("data-lazy-src");
        if (src) {
          try {
            const imageUrl = new URL(src, parsedUrl.origin).href;
            if (
              !imageUrl.startsWith("data:") &&
              !imageUrls.includes(imageUrl)
            ) {
              const width = parseInt($(el).attr("width") || "0");
              const height = parseInt($(el).attr("height") || "0");
              if (width >= 200 || height >= 200 || (width === 0 && height === 0)) {
                imageUrls.push(imageUrl);
              }
            }
          } catch {
            // Invalid URL, skip
          }
        }
      });
    }

    const uniqueImages = Array.from(new Set(imageUrls)).slice(0, 10);

    // ── Extract recipe name ─────────────────────────────────────
    let recipeName = "";
    const nameSelectors = [
      'h1[class*="recipe"]',
      'h1[class*="title"]',
      '[class*="recipe-title"]',
      '[class*="recipe-name"]',
      "h1",
      "title",
    ];

    for (const selector of nameSelectors) {
      const element = $(selector).first();
      if (element.length) {
        recipeName = element.text().trim();
        if (recipeName) break;
      }
    }

    if (!recipeName) {
      recipeName = $("title").text().trim();
    }

    // ── Extract ingredients ─────────────────────────────────────
    let ingredientsText = "";
    const ingredientSelectors = [
      '[class*="ingredient"]',
      '[class*="ingredients"]',
      '[itemprop="recipeIngredient"]',
      '[data-testid*="ingredient"]',
      'ul[class*="ingredient"]',
      'ol[class*="ingredient"]',
      '[class*="recipe-ingredient"]',
    ];

    for (const selector of ingredientSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        const listItems = elements.find("li");
        if (listItems.length > 0) {
          ingredientsText = listItems
            .map((_, el) => $(el).text().trim())
            .get()
            .join("\n");
          break;
        } else {
          ingredientsText = elements.text().trim();
          if (ingredientsText) break;
        }
      }
    }

    // Fallback: guess from any list
    if (!ingredientsText) {
      const lists = $("ul, ol");
      for (let i = 0; i < Math.min(lists.length, 5); i++) {
        const list = $(lists[i]);
        const items = list.find("li");
        if (items.length >= 3 && items.length <= 30) {
          ingredientsText = items
            .map((_, el) => $(el).text().trim())
            .get()
            .join("\n");
          break;
        }
      }
    }

    // ── Build result ────────────────────────────────────────────
    let result = "";
    if (recipeName) {
      result += `Recipe Name: ${recipeName}\n\n`;
    }
    if (ingredientsText) {
      result += `Ingredients:\n${ingredientsText}`;
    } else {
      const mainContent = $("main, [class*='content'], [class*='recipe']")
        .first()
        .text();
      if (mainContent) {
        result += `Recipe Content:\n${mainContent.substring(0, 5000)}`;
      }
    }

    if (!result || result.trim().length === 0) {
      throw new Error("Could not extract recipe data from the URL (headless)");
    }

    return {
      text: result,
      images: uniqueImages,
      method: "headless",
    };
  } catch (error) {
    console.error("Headless scraping error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to scrape recipe from URL (headless)");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
