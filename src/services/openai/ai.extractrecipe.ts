import OpenAI from "openai";
import { Unit } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ExtractedIngredient = {
  name: string;
  quantity: number;
  unit: Unit;
};

export type ExtractedRecipeData = {
  name: string;
  ingredients: ExtractedIngredient[];
  images?: string[];
};

/**
 * Normalizes an ingredient name for comparison
 * Removes common prefixes/suffixes and normalizes case
 */
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove common prefixes that don't change the ingredient identity
    .replace(/^(toasted|roasted|raw|fresh|dried|ground|chopped|sliced|diced|minced|crushed)\s+/i, '')
    .replace(/\s+(toasted|roasted|raw|fresh|dried|ground|chopped|sliced|diced|minced|crushed)$/i, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Combines duplicate ingredients by normalizing names and summing quantities
 * Ingredients with the same normalized name and unit are combined
 */
function combineDuplicateIngredients(ingredients: ExtractedIngredient[]): ExtractedIngredient[] {
  const combinedMap = new Map<string, ExtractedIngredient>();

  for (const ing of ingredients) {
    const normalizedName = normalizeIngredientName(ing.name);
    const key = `${normalizedName}|${ing.unit}`;

    const existing = combinedMap.get(key);
    if (existing) {
      // Combine quantities and keep the original name (prefer the shorter/more common one)
      existing.quantity += ing.quantity;
      // Prefer the shorter name or the one without prefixes
      if (ing.name.length < existing.name.length || 
          !ing.name.toLowerCase().match(/^(toasted|roasted|raw|fresh|dried|ground)/i)) {
        existing.name = ing.name;
      }
    } else {
      // Add new ingredient
      combinedMap.set(key, {
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
      });
    }
  }

  return Array.from(combinedMap.values());
}

/**
 * Extracts recipe name and ingredients from scraped recipe HTML/text using OpenAI
 * Images are passed separately and included in the response
 */
export async function extractRecipeData(
  scrapedContent: string,
  images: string[] = []
): Promise<ExtractedRecipeData> {
  const prompt = `You are a recipe parser. Extract the recipe name and ingredients from the following recipe content.

Available units: g, kg, ml, l, tbsp, tsp, piece

For each ingredient, extract:
- name: the ingredient name (normalized, e.g., "flour" not "all-purpose flour")
- quantity: the numeric quantity (if not specified, use 1)
- unit: one of the available units (g, kg, ml, l, tbsp, tsp, piece). If the unit is not in the list, map it appropriately:
  - cups, cup -> convert to appropriate unit (e.g., 1 cup flour ≈ 120g, 1 cup liquid ≈ 240ml)
  - ounces, oz -> convert to g (1 oz ≈ 28g)
  - pounds, lb -> convert to kg (1 lb ≈ 0.45kg)
  - tablespoons, tablespoon -> tbsp
  - teaspoons, teaspoon -> tsp
  - If no unit is specified, use "piece" for countable items, "g" for solids, "ml" for liquids

Return a JSON object with this structure:
{
  "name": "Recipe Name",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": 100,
      "unit": "g"
    }
  ]
}

Recipe content:
${scrapedContent}

Return only valid JSON, no additional text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful recipe parser. Always return valid JSON only, no markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content) as Omit<ExtractedRecipeData, 'images'>;

    // Validate and normalize the response
    if (!parsed.name || !parsed.ingredients || !Array.isArray(parsed.ingredients)) {
      throw new Error("Invalid recipe data structure from OpenAI");
    }

    // Validate units
    const validUnits: Unit[] = ["g", "kg", "ml", "l", "tbsp", "tsp", "piece"];
    let validatedIngredients = parsed.ingredients
      .filter((ing) => {
        if (!ing.name || !validUnits.includes(ing.unit)) {
          return false;
        }
        if (typeof ing.quantity !== "number" || ing.quantity <= 0) {
          return false;
        }
        return true;
      })
      .map((ing) => ({
        name: ing.name.trim(),
        quantity: ing.quantity,
        unit: ing.unit,
      }));

    // Combine duplicate ingredients
    validatedIngredients = combineDuplicateIngredients(validatedIngredients);

    return {
      ...parsed,
      ingredients: validatedIngredients,
      images: images.length > 0 ? images : undefined,
    };
  } catch (error) {
    console.error("OpenAI extraction error:", error);
    throw new Error(
      `Failed to extract recipe data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
