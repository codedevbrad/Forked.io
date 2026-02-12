"use server";

import OpenAI from "openai";
import type { ScrapedProduct } from "./products";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ProductValidation = {
  productName: string;
  isValidProduct: boolean;
};

type AnalysisResponse = {
  products: ProductValidation[];
};

/**
 * Uses AI to filter out non-product items from scraped results.
 * Categories, filters, navigation items, and other non-products are removed.
 */
export async function filterValidProducts(
  products: ScrapedProduct[],
  searchTerm: string
): Promise<ScrapedProduct[]> {
  if (products.length === 0) return [];

  // Extract just the product names for analysis
  const productNames = products.map((p) => p.productName);

  const prompt = `You are a product validation assistant. Given a list of items scraped from a grocery retailer search results page, determine which are actual grocery/food products and which are NOT products (like category names, filters, navigation items, promotional text, etc.).

Search term used: "${searchTerm}"

For each item, return whether it is a valid grocery product (true) or not (false).

Items that are NOT valid products include:
- Category names (e.g., "Clothing & Accessories", "Groceries & Essentials", "Food Cupboard", "Baby & Toddler")
- Navigation/filter labels (e.g., "Find out more", "Show all", "Filter by")
- Store sections (e.g., "F&F Clothing", "Household", "Fresh Food")
- Promotional text (e.g., "Save 20%", "New arrivals", "Best sellers")
- Generic descriptors without specific product info

Valid products typically have:
- A specific product name (e.g., "Tesco Whole Milk 2 Pints", "Heinz Baked Beans 415g")
- Often include brand names, sizes, weights, or pack quantities
- Are things you can actually buy and put in a shopping cart

Items to analyze:
${JSON.stringify(productNames, null, 2)}

Return a JSON object with this structure:
{
  "products": [
    { "productName": "item name", "isValidProduct": true/false }
  ]
}

Return only valid JSON, no additional text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful product validation assistant. Always return valid JSON only, no markdown formatting. Be strict about filtering out non-products.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.warn("No response from OpenAI, returning all products");
      return products;
    }

    const parsed = JSON.parse(content) as AnalysisResponse;

    if (!parsed.products || !Array.isArray(parsed.products)) {
      console.warn("Invalid response structure from OpenAI, returning all products");
      return products;
    }

    // Create a set of valid product names
    const validProductNames = new Set(
      parsed.products
        .filter((p) => p.isValidProduct)
        .map((p) => p.productName.toLowerCase().trim())
    );

    // Filter the original products
    const filteredProducts = products.filter((product) =>
      validProductNames.has(product.productName.toLowerCase().trim())
    );

    console.log(
      `AI filtered products: ${products.length} -> ${filteredProducts.length} (removed ${products.length - filteredProducts.length} non-products)`
    );

    return filteredProducts;
  } catch (error) {
    console.error("AI product filtering error:", error);
    // On error, return original products rather than failing completely
    return products;
  }
}
