import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatFilters = {
  spicy: boolean;
  airfryer: boolean;
};

/**
 * Builds the system prompt for the food assistant, including the user's stored recipes as context.
 */
function buildSystemPrompt(recipeSummaries: string[], filters: ChatFilters): string {
  const recipeContext =
    recipeSummaries.length > 0
      ? `\n\nThe user has the following recipes saved in their collection:\n${recipeSummaries.map((r, i) => `${i + 1}. ${r}`).join("\n")}\n\nUse this information to understand their taste preferences, dietary patterns, and the types of cuisine they enjoy. Reference their existing recipes when relevant (e.g., "Since you like your Chicken Tikka Masala, you might enjoy...").`
      : "\n\nThe user hasn't saved any recipes yet. Focus on discovering their preferences through the conversation.";

  return `You are a friendly, knowledgeable food assistant helping a user discover new recipe ideas. Your personality is warm, enthusiastic about food, and conversational — like a foodie friend.

Guidelines:
- Recommend recipe ideas based on the user's preferences, mood, dietary needs, available ingredients, or any filters they mention.
- Keep responses concise but helpful. Suggest 2-3 recipes at a time unless they ask for more.
- Do NOT number the recipes (no "1.", "2.", "3." etc). Just use the bold recipe name as the heading for each.
- For each suggestion, give the recipe name, a brief enticing description (1-2 sentences), and list the key ingredients.
- **IMPORTANT — Ingredient list:** For every recipe, include a line starting with 📝 that lists the main ingredients with quantities. Use EXACTLY this format per ingredient: name (quantity unit). Separate ingredients with commas. Available units: g, kg, ml, l, tbsp, tsp, piece. Use singular canonical ingredient names.
  Example: 📝 chicken breast (500 g), bell pepper (2 piece), soy sauce (3 tbsp), garlic (3 piece), ginger (1 tsp)
  Place this line AFTER the description and BEFORE the 🔗 links line for each recipe.
- **IMPORTANT — Recipe links:** For every recipe you recommend, you MUST include at least 3 links to websites where the user can find that recipe. Generate search URLs by URL-encoding the recipe name into these popular recipe sites (pick 3 or more that suit the cuisine):
  - BBC Good Food: https://www.bbcgoodfood.com/search?q=RECIPE_NAME
  - Allrecipes: https://www.allrecipes.com/search?q=RECIPE_NAME
  - Jamie Oliver: https://www.jamieoliver.com/search/?s=RECIPE_NAME
  - Delish: https://www.delish.com/search/?q=RECIPE_NAME
  - Bon Appétit: https://www.bonappetit.com/search?q=RECIPE_NAME
  - Serious Eats: https://www.seriouseats.com/search?q=RECIPE_NAME
  Format the links as a compact list under each recipe using markdown links, e.g.:
  🔗 [BBC Good Food](url) · [Allrecipes](url) · [Jamie Oliver](url)
- Ask clarifying follow-up questions to narrow down what they're looking for (e.g., cuisine type, cooking time, difficulty, dietary restrictions).
- If the user is vague, suggest a diverse range of options to help narrow their preferences.
- Be encouraging and make cooking sound fun and approachable.
- You can suggest variations on their existing recipes to keep things fresh.
- Don't provide full recipe instructions unless specifically asked — keep it focused on ideas and inspiration.
- Format your responses nicely with recipe names in bold using markdown.

Active filters (ALWAYS respect these — they override any other preference):
${filters.spicy
    ? "- 🌶️ SPICY MODE ON: The user wants spicy food. Prioritise recipes with bold heat — chillies, hot sauce, spicy marinades, etc. Every suggestion should have a kick."
    : "- 🚫🌶️ NO SPICE: The user does NOT want spicy food. Avoid chillies, hot sauce, cayenne, or anything with significant heat. Keep it mild and flavour-forward."
}
${filters.airfryer
    ? "- 🍟 AIR FRYER MODE ON: The user wants recipes that can be made in an air fryer. Only suggest recipes that work well in an air fryer (or have an easy air fryer adaptation). Mention air fryer temps/times where relevant."
    : ""
}${recipeContext}`;
}

/**
 * Streams a conversation response from the AI food assistant.
 * Returns a ReadableStream of string chunks.
 */
export async function streamConversation(
  messages: ChatMessage[],
  recipeSummaries: string[],
  filters: ChatFilters = { spicy: false, airfryer: false }
): Promise<ReadableStream<string>> {
  const systemPrompt = buildSystemPrompt(recipeSummaries, filters);

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
    temperature: 0.8,
    max_tokens: 2048,
    stream: true,
  });

  return new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(content);
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
