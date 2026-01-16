import * as cheerio from "cheerio";

/**
 * Scrapes recipe data from a URL using Cheerio
 * Extracts recipe name and ingredient list from common recipe website structures
 */
export async function scrapeRecipeFromUrl(url: string): Promise<string> {
  try {
    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error("Invalid URL format");
    }

    // Fetch the page
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

    // Try to extract recipe name from various common selectors
    let recipeName = "";
    const nameSelectors = [
      'h1[class*="recipe"]',
      'h1[class*="title"]',
      '[class*="recipe-title"]',
      '[class*="recipe-name"]',
      'h1',
      'title',
    ];

    for (const selector of nameSelectors) {
      const element = $(selector).first();
      if (element.length) {
        recipeName = element.text().trim();
        if (recipeName) break;
      }
    }

    // If no name found, try to get it from title tag
    if (!recipeName) {
      recipeName = $("title").text().trim();
    }

    // Try to extract ingredients from various common selectors
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
        // Try to get list items
        const listItems = elements.find("li");
        if (listItems.length > 0) {
          ingredientsText = listItems
            .map((_, el) => $(el).text().trim())
            .get()
            .join("\n");
          break;
        } else {
          // If no list items, get the text directly
          ingredientsText = elements.text().trim();
          if (ingredientsText) break;
        }
      }
    }

    // If no ingredients found, try to find any list that might contain ingredients
    if (!ingredientsText) {
      const lists = $("ul, ol");
      for (let i = 0; i < Math.min(lists.length, 5); i++) {
        const list = $(lists[i]);
        const items = list.find("li");
        if (items.length >= 3 && items.length <= 30) {
          // Likely an ingredient list
          ingredientsText = items
            .map((_, el) => $(el).text().trim())
            .get()
            .join("\n");
          break;
        }
      }
    }

    // Combine recipe name and ingredients
    let result = "";
    if (recipeName) {
      result += `Recipe Name: ${recipeName}\n\n`;
    }
    if (ingredientsText) {
      result += `Ingredients:\n${ingredientsText}`;
    } else {
      // If we can't find ingredients, try to extract from the main content
      const mainContent = $("main, [class*='content'], [class*='recipe']").first().text();
      if (mainContent) {
        result += `Recipe Content:\n${mainContent.substring(0, 5000)}`; // Limit to 5000 chars
      }
    }

    if (!result || result.trim().length === 0) {
      throw new Error("Could not extract recipe data from the URL");
    }

    return result;
  } catch (error) {
    console.error("Scraping error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to scrape recipe from URL");
  }
}
