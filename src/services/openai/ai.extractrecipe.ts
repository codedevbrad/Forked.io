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
 * US → UK ingredient name conversions
 * Applied as a post-processing safety net after AI extraction
 */
const US_TO_UK_INGREDIENTS: Record<string, string> = {
  // Vegetables
  "cilantro": "coriander",
  "scallion": "spring onion",
  "scallions": "spring onion",
  "eggplant": "aubergine",
  "zucchini": "courgette",
  "arugula": "rocket",
  "bell pepper": "pepper",
  "chili pepper": "chilli",
  "chile pepper": "chilli",
  "romaine lettuce": "cos lettuce",
  "romaine": "cos lettuce",
  "swiss chard": "chard",
  "rutabaga": "swede",

  // Meat & Dairy
  "ground beef": "beef mince",
  "ground turkey": "turkey mince",
  "ground pork": "pork mince",
  "ground lamb": "lamb mince",
  "ground chicken": "chicken mince",
  "heavy cream": "double cream",
  "heavy whipping cream": "double cream",
  "half-and-half": "single cream",
  "half and half": "single cream",
  "whipping cream": "double cream",
  "american cheese": "processed cheese slices",
  "sharp cheddar": "mature cheddar",
  "stick butter": "block butter",

  // Baking & Pantry
  "all-purpose flour": "plain flour",
  "all purpose flour": "plain flour",
  "cake flour": "soft flour",
  "cornstarch": "cornflour",
  "corn starch": "cornflour",
  "powdered sugar": "icing sugar",
  "confectioners sugar": "icing sugar",
  "confectioners' sugar": "icing sugar",
  "granulated sugar": "caster sugar",
  "brown sugar": "soft brown sugar",
  "light brown sugar": "light soft brown sugar",
  "dark brown sugar": "dark soft brown sugar",
  "baking soda": "bicarbonate of soda",
  "kosher salt": "flaked salt",
  "tomato sauce": "passata",
  "tomato puree": "sieved tomato",
  "ketchup": "tomato ketchup",

  // Oils & Other
  "canola oil": "rapeseed oil",
  "molasses": "black treacle",
  "vegetable shortening": "trex",
  "marshmallow fluff": "marshmallow spread",
};

/**
 * Converts US ingredient names to UK equivalents
 * Checks for exact match first, then substring match for compound names
 */
function convertToUKIngredient(name: string): string {
  const lower = name.toLowerCase().trim();

  // Check for exact match
  if (US_TO_UK_INGREDIENTS[lower]) {
    // Preserve the original casing style
    const ukName = US_TO_UK_INGREDIENTS[lower];
    // If the original started with uppercase, capitalise the UK name
    if (name[0] === name[0].toUpperCase()) {
      return ukName.charAt(0).toUpperCase() + ukName.slice(1);
    }
    return ukName;
  }

  // Check if the name contains a US term as a substring (e.g., "fresh cilantro" → "fresh coriander")
  for (const [usTerm, ukTerm] of Object.entries(US_TO_UK_INGREDIENTS)) {
    const regex = new RegExp(`\\b${usTerm}\\b`, "i");
    if (regex.test(lower)) {
      return name.replace(regex, ukTerm);
    }
  }

  return name;
}

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
IMPORTANT: Always use UK English ingredient names, never US names.

Available units: g, kg, ml, l, tbsp, tsp, piece

For each ingredient, extract:
- name: the ingredient name in SINGULAR canonical form (e.g., "carrot" not "carrots", "chicken thigh" not "chicken thighs", "onion" not "onions").
  Keep inherently plural/mass nouns as-is (e.g., "grapes", "oats", "baked beans", "noodles", "lentils", "spinach", "rice").
  Normalise the name (e.g., "flour" not "plain flour").
  IMPORTANT: Always use the full, proper ingredient name — never abbreviations, nicknames or slang.
  Examples: "mayo" → "mayonnaise", "parm" → "parmesan", "evoo" → "olive oil", "bicarb" → "bicarbonate of soda",
  "choc" → "chocolate", "veg" → "vegetables", "spag" → "spaghetti", "tom" → "tomato", "pep" → "pepper",
  "cuke" → "cucumber", "avo" → "avocado", "zucch" → "courgette", "garlic pw" → "garlic powder".
  IMPORTANT: Always convert US ingredient names to their UK equivalents:
  "cilantro" → "coriander", "scallion" → "spring onion", "eggplant" → "aubergine", "zucchini" → "courgette",
  "arugula" → "rocket", "bell pepper" → "pepper", "romaine lettuce" → "cos lettuce", "rutabaga" → "swede",
  "ground beef" → "beef mince", "ground pork" → "pork mince", "ground turkey" → "turkey mince",
  "heavy cream" → "double cream", "half-and-half" → "single cream", "whipping cream" → "double cream",
  "sharp cheddar" → "mature cheddar", "all-purpose flour" → "plain flour", "cake flour" → "soft flour",
  "cornstarch" → "cornflour", "powdered sugar"/"confectioners' sugar" → "icing sugar",
  "granulated sugar" → "caster sugar", "brown sugar" → "soft brown sugar",
  "baking soda" → "bicarbonate of soda", "kosher salt" → "flaked salt",
  "canola oil" → "rapeseed oil", "molasses" → "black treacle".
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
        name: convertToUKIngredient(ing.name.trim()),
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
