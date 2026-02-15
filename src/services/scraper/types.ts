export type ScrapedRecipeData = {
  text: string;
  images: string[];
  method: "cheerio" | "headless" | "youtube";
};
