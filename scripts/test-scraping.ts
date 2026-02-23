import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

/**
 * Tests the full recipe import pipeline using the actual app code.
 * Calls scrapeRecipeFromUrl and extractRecipeData directly, with
 * timing and logging around each step so you can see exactly where it fails.
 *
 * Usage: npx tsx scripts/test-scraping.ts <recipe-url>
*/

async function testRecipeImport() {
  const url = process.argv[2];

  if (!url) {
    console.error("Usage: npx tsx scripts/test-scraping.ts <recipe-url>");
    console.error(
      "Example: npx tsx scripts/test-scraping.ts https://www.bbcgoodfood.com/recipes/classic-bolognese"
    );
    process.exit(1);
  }

  console.log("=== Recipe Import Test ===");
  console.log(`URL: ${url}`);
  console.log("=".repeat(60) + "\n");

  const totalStart = Date.now();

  // ──────────────────────────────────────────────
  // Step 1: Scrape the URL (actual scraper code)
  // ──────────────────────────────────────────────
  console.log("Step 1 — scrapeRecipeFromUrl()");
  console.log("─".repeat(60));

  let scrapedData: { text: string; images: string[]; method: string };

  try {
    const { scrapeRecipeFromUrl } = await import("../src/services/scraper/index");

    const start = Date.now();
    scrapedData = await scrapeRecipeFromUrl(url);
    const ms = Date.now() - start;

    console.log(`  Method: ${scrapedData.method === "headless" ? "Puppeteer (headless)" : "Cheerio (static)"}`);
    console.log(`  Time:   ${ms}ms`);
    console.log(`  Text:   ${scrapedData.text.length} chars`);
    console.log(`  Images: ${scrapedData.images.length} found`);

    // Show the text that will be sent to OpenAI
    console.log("\n  Scraped text preview:");
    console.log("  ┌" + "─".repeat(56) + "┐");
    const preview =
      scrapedData.text.length > 1500
        ? scrapedData.text.substring(0, 1500) + `\n... (${scrapedData.text.length} chars total)`
        : scrapedData.text;
    preview.split("\n").forEach((line) => console.log(`  │ ${line}`));
    console.log("  └" + "─".repeat(56) + "┘");

    if (scrapedData.images.length > 0) {
      console.log("\n  Images:");
      scrapedData.images.forEach((img, i) => console.log(`    ${i + 1}. ${img}`));
    }
  } catch (error) {
    console.error(`\n  FAILED: ${error instanceof Error ? error.message : error}`);
    if (error instanceof Error && error.stack) {
      console.error("\n  Stack:", error.stack);
    }
    process.exit(1);
  }

  // ──────────────────────────────────────────────
  // Step 2: Extract with OpenAI (actual extraction code)
  // ──────────────────────────────────────────────
  console.log("\n\nStep 2 — extractRecipeData()");
  console.log("─".repeat(60));

  if (!process.env.OPENAI_API_KEY) {
    console.error("  OPENAI_API_KEY not set — cannot run extraction.");
    console.log("  Scraped data above is what would be sent to OpenAI.");
    process.exit(0);
  }

  console.log("  OPENAI_API_KEY: set");

  let extracted: {
    name: string;
    ingredients: { name: string; quantity: number; unit: string }[];
    images?: string[];
  };

  try {
    const { extractRecipeData } = await import("../src/services/openai/ai.extractrecipe");

    const start = Date.now();
    extracted = await extractRecipeData(scrapedData.text, scrapedData.images);
    const ms = Date.now() - start;

    console.log(`  Time:   ${ms}ms`);
    console.log(`  Name:   "${extracted.name || "(empty)"}"`);
    console.log(`  Ingredients: ${extracted.ingredients.length}`);

    if (extracted.ingredients.length > 0) {
      console.log("\n  Extracted ingredients:");
      console.log("  ┌" + "─".repeat(56) + "┐");
      for (const ing of extracted.ingredients) {
        console.log(`  │ ${String(ing.quantity).padStart(6)} ${ing.unit.padEnd(5)}  ${ing.name}`);
      }
      console.log("  └" + "─".repeat(56) + "┘");
    }

    if (extracted.images && extracted.images.length > 0) {
      console.log(`\n  Images passed through: ${extracted.images.length}`);
    }
  } catch (error) {
    console.error(`\n  FAILED: ${error instanceof Error ? error.message : error}`);
    if (error instanceof Error && error.stack) {
      console.error("\n  Stack:", error.stack);
    }
    process.exit(1);
  }

  // ──────────────────────────────────────────────
  // Step 3: Validation (same check as previewRecipeFromUrlAction)
  // ──────────────────────────────────────────────
  const totalMs = Date.now() - totalStart;

  console.log("\n\nStep 3 — Validation (same as previewRecipeFromUrlAction)");
  console.log("─".repeat(60));

  const nameOk = !!extracted.name;
  const ingredientsOk = extracted.ingredients.length > 0;

  console.log(`  Recipe name:  ${nameOk ? "PASS" : "FAIL"}${nameOk ? ` ("${extracted.name}")` : ""}`);
  console.log(`  Ingredients:  ${ingredientsOk ? "PASS" : "FAIL"} (${extracted.ingredients.length} found)`);

  console.log("\n" + "=".repeat(60));
  if (nameOk && ingredientsOk) {
    console.log(`RESULT: SUCCESS — recipe would import correctly (${totalMs}ms total)`);
  } else {
    console.log(`RESULT: FAIL — would trigger "Could not extract recipe name or ingredients" (${totalMs}ms total)`);
  }
  console.log("=".repeat(60));

  process.exit(nameOk && ingredientsOk ? 0 : 1);
}

testRecipeImport();