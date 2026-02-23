"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogPortal,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Sparkles,
  Send,
  RotateCcw,
  Loader2,
  ChefHat,
  User,
  Flame,
  Wind,
  XIcon,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import React from "react";
import { RecipeForm, type SuggestedIngredient } from "@/src/domains/recipes/_components/recipe-form";
import type { GoogleImage } from "@/src/services/googleimages";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type View = "chat" | "add-recipe";

/**
 * Extracts recipe names from bold markdown patterns: **Recipe Name**
 */
function extractRecipeNames(text: string): string[] {
  const matches = text.match(/\*\*([^*]+)\*\*/g);
  if (!matches) return [];

  return matches
    .map((m) => m.replace(/\*\*/g, "").trim())
    // Strip leading numbered list prefixes like "1. ", "2. ", "3) ", etc.
    .map((name) => name.replace(/^\d+[\.\)]\s*/, "").trim())
    .filter((name) => {
      const lower = name.toLowerCase();
      if (lower.startsWith("important")) return false;
      if (lower.startsWith("note")) return false;
      if (lower.includes("recipe link")) return false;
      if (name.length < 3) return false;
      return true;
    });
}

/**
 * Parses a 📝 ingredient line into structured data.
 * Format: "📝 chicken breast (500 g), bell pepper (2 piece), soy sauce (3 tbsp)"
 */
function parseIngredientLine(line: string): SuggestedIngredient[] {
  const ingredients: SuggestedIngredient[] = [];
  const regex = /([^,]+?)\s*\((\d+(?:\.\d+)?)\s*(g|kg|ml|l|tbsp|tsp|piece)\)/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    ingredients.push({
      name: match[1].trim(),
      quantity: parseFloat(match[2]),
      unit: match[3],
    });
  }

  return ingredients;
}

/**
 * Builds a map of recipe name → ingredients from an assistant message.
 * Associates each 📝 line with the most recently seen **Recipe Name**.
 */
function extractRecipeIngredients(text: string): Map<string, SuggestedIngredient[]> {
  const result = new Map<string, SuggestedIngredient[]>();
  const lines = text.split("\n");
  let currentRecipe = "";

  for (const line of lines) {
    const nameMatch = line.match(/\*\*([^*]+)\*\*/);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      // Apply same filter as extractRecipeNames
      const lower = name.toLowerCase();
      if (
        !lower.startsWith("important") &&
        !lower.startsWith("note") &&
        !lower.includes("recipe link") &&
        name.length >= 3
      ) {
        currentRecipe = name;
      }
    }

    if (line.includes("📝") && currentRecipe) {
      const ingredients = parseIngredientLine(line);
      if (ingredients.length > 0) {
        result.set(currentRecipe, ingredients);
      }
    }
  }

  return result;
}

/**
 * Renders a single line of text with basic markdown:
 *  - **bold**
 *  - [label](url) → clickable link
 */
function renderMarkdownLine(line: string, lineIdx: number): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }

    if (match[3] && match[4]) {
      parts.push(
        <a
          key={`${lineIdx}-${match.index}`}
          href={match[4]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 text-primary hover:text-primary/80 font-medium"
        >
          {match[3]}
        </a>
      );
    } else if (match[2]) {
      parts.push(
        <strong key={`${lineIdx}-${match.index}`} className="font-semibold">
          {match[2]}
        </strong>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return (
    <React.Fragment key={lineIdx}>
      {parts.length > 0 ? parts : line}
    </React.Fragment>
  );
}

/** Renders plain markdown text (bold + links + newlines). */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => (
    <React.Fragment key={lineIdx}>
      {renderMarkdownLine(line, lineIdx)}
      {lineIdx < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

/**
 * Renders an image gallery row for a recipe.
 */
function renderImageGallery(
  recipeName: string,
  imgs: GoogleImage[] | undefined,
  isLoading: boolean,
  onImageError: (recipeName: string, imageId: string) => void
): React.ReactNode {
  return (
    <div key={`imgs-${recipeName}`} className="my-2">
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading images&hellip;
        </div>
      ) : imgs && imgs.length > 0 ? (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {imgs.map((img) => (
            <a
              key={img.id}
              href={img.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg overflow-hidden border border-border/50 hover:border-primary/30 transition-colors group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.thumbUrl}
                alt={recipeName}
                className="w-[90px] h-[68px] object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
                onError={() => onImageError(recipeName, img.id)}
              />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Renders an assistant message splitting each recipe into a bordered card.
 * Card order: title → description → ingredients → images → links → "Add" button
 */
function renderMessageWithImages(
  text: string,
  recipeImgs: Record<string, GoogleImage[]>,
  loadingImgs: Set<string>,
  onImageError: (recipeName: string, imageId: string) => void,
  onAddRecipe: (recipeName: string) => void
): React.ReactNode[] {
  const lines = text.split("\n");
  const totalLines = lines.length;

  // ---- Split lines into sections: "intro" (no recipe) or "recipe" --------
  type Line = { text: string; globalIdx: number };
  type Section =
    | { kind: "intro"; lines: Line[] }
    | { kind: "recipe"; name: string; lines: Line[] };

  const sections: Section[] = [];
  let current: Section = { kind: "intro", lines: [] };

  for (let i = 0; i < totalLines; i++) {
    const line = lines[i];
    const nameMatch = line.match(/\*\*([^*]+)\*\*/);

    if (nameMatch) {
      const raw = nameMatch[1].trim().replace(/^\d+[\.\)]\s*/, "").trim();
      const lower = raw.toLowerCase();
      const isRecipe =
        !lower.startsWith("important") &&
        !lower.startsWith("note") &&
        !lower.includes("recipe link") &&
        raw.length >= 3;

      if (isRecipe) {
        if (current.lines.length > 0) sections.push(current);
        current = { kind: "recipe", name: raw, lines: [{ text: line, globalIdx: i }] };
        continue;
      }
    }

    current.lines.push({ text: line, globalIdx: i });
  }
  if (current.lines.length > 0) sections.push(current);

  // ---- Render each section -----------------------------------------------
  const result: React.ReactNode[] = [];

  for (const section of sections) {
    if (section.kind === "intro") {
      for (const { text: line, globalIdx } of section.lines) {
        result.push(
          <React.Fragment key={`line-${globalIdx}`}>
            {renderMarkdownLine(line, globalIdx)}
            {globalIdx < totalLines - 1 && <br />}
          </React.Fragment>
        );
      }
      continue;
    }

    // ---- Recipe card ------------------------------------------------------
    const { name: recipeName, lines: sectionLines } = section;
    const imgs = recipeImgs[recipeName];
    const isLoading = loadingImgs.has(recipeName);
    let imagesInserted = false;
    const cardNodes: React.ReactNode[] = [];

    for (let j = 0; j < sectionLines.length; j++) {
      const { text: line, globalIdx } = sectionLines[j];
      const isLastLine = j === sectionLines.length - 1;

      cardNodes.push(
        <React.Fragment key={`line-${globalIdx}`}>
          {renderMarkdownLine(line, globalIdx)}
          {!isLastLine && <br />}
        </React.Fragment>
      );

      // After ingredient line, insert images
      if (line.includes("📝") && !imagesInserted) {
        imagesInserted = true;
        if (isLoading || (imgs && imgs.length > 0)) {
          cardNodes.push(renderImageGallery(recipeName, imgs, isLoading, onImageError));
        }
      }
    }

    // If no 📝 line was found, insert images at end of card
    if (!imagesInserted && (isLoading || (imgs && imgs.length > 0))) {
      cardNodes.push(renderImageGallery(recipeName, imgs, isLoading, onImageError));
    }

    // "Add" button inside the card
    cardNodes.push(
      <div key={`add-${recipeName}`} className="pt-2">
        <button
          onClick={() => onAddRecipe(recipeName)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add &ldquo;{recipeName}&rdquo;
        </button>
      </div>
    );

    result.push(
      <div
        key={`card-${recipeName}`}
        className="my-2.5 rounded-xl border border-border/60 bg-background/30 p-3"
      >
        {cardNodes}
      </div>
    );
  }

  return result;
}

const SUGGESTIONS = [
  // 🥗 Fresh & Light
  "Crunchy Asian slaw with sesame dressing",
  "Thai-style slaw with peanut lime sauce",
  "Vietnamese chicken salad with herbs",
  "Crispy tofu and red cabbage slaw bowl",
  "Fresh mango, carrot & chilli slaw",

  // 🍗 Chicken
  "Sticky honey garlic chicken",
  "Creamy Tuscan chicken with spinach",
  "Spicy gochujang chicken rice bowl",
  "Lemon butter chicken with greens",
  "Chicken shawarma flatbreads",
  "Teriyaki chicken stir fry",
  "Chicken katsu curry at home",

  // 🥩 Beef Mince
  "Korean beef mince rice bowl",
  "Spaghetti bolognese with rich tomato sauce",
  "Beef mince tacos with fresh salsa",
  "Loaded beef nachos",
  "Shepherd’s pie with cheesy mash",
  "Beef and mushroom stroganoff",
  "Juicy homemade beef burgers",

  // 🐟 Salmon
  "Honey soy glazed salmon",
  "Creamy garlic salmon with spinach",
  "Teriyaki salmon poke bowl",
  "Crispy skin salmon with lemon butter",
  "Salmon and avocado rice bowl",
  "Salmon fishcakes with dill sauce",

  // 🥢 Quick Asian-Inspired
  "Ginger garlic noodle stir fry",
  "Sweet chilli chicken noodles",
  "Beef and broccoli stir fry",
  "Spicy udon with vegetables",
  "Thai red curry with chicken",
  "Coconut curry salmon",

  // 🥙 Healthy High-Protein
  "High protein chicken burrito bowl",
  "Lean beef mince meal prep bowls",
  "Grilled salmon with quinoa salad",
  "Chicken and avocado protein wrap",
  "Low carb Asian lettuce wraps",

  // 🥘 Comfort Food
  "Creamy chicken pasta bake",
  "Beef mince chilli con carne",
  "One pan garlic butter chicken",
  "Salmon creamy pasta",
  "Sticky BBQ chicken tray bake",

  // 🔥 Meal Prep Friendly
  "5 day chicken meal prep ideas",
  "Beef mince batch cooking ideas",
  "Salmon lunches for the week",
  "Healthy Asian slaw meal prep bowls"
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function RecommendChatDrawer() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [spicy, setSpicy] = useState(false);
  const [airfryer, setAirfryer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Two-view system
  const [view, setView] = useState<View>("chat");
  const [selectedRecipeName, setSelectedRecipeName] = useState("");
  const [selectedRecipeIngredients, setSelectedRecipeIngredients] = useState<SuggestedIngredient[]>([]);

  // Recipe images scraped from Google
  const [recipeImages, setRecipeImages] = useState<Record<string, GoogleImage[]>>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const fetchedRecipesRef = useRef<Set<string>>(new Set());

  const fetchRecipeImages = useCallback(async (recipeName: string) => {
    if (fetchedRecipesRef.current.has(recipeName)) return;
    fetchedRecipesRef.current.add(recipeName);

    setLoadingImages((prev) => new Set(prev).add(recipeName));

    try {
      const res = await fetch(
        `/api/images/recipe?q=${encodeURIComponent(recipeName)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        setRecipeImages((prev) => ({ ...prev, [recipeName]: data.images }));
      }
    } catch {
      // Silently fail — images are non-critical
    } finally {
      setLoadingImages((prev) => {
        const next = new Set(prev);
        next.delete(recipeName);
        return next;
      });
    }
  }, []);

  // Remove broken images (404s, blocked URLs, etc.) from state
  const handleImageError = useCallback((recipeName: string, imageId: string) => {
    setRecipeImages((prev) => {
      const images = prev[recipeName];
      if (!images) return prev;
      const filtered = images.filter((img) => img.id !== imageId);
      if (filtered.length === images.length) return prev;
      return { ...prev, [recipeName]: filtered };
    });
  }, []);

  // When streaming finishes, fetch images for any new recipes
  useEffect(() => {
    if (isStreaming) return;

    for (const msg of messages) {
      if (msg.role === "assistant" && msg.content) {
        const names = extractRecipeNames(msg.content);
        for (const name of names) {
          fetchRecipeImages(name);
        }
      }
    }
  }, [isStreaming, messages, fetchRecipeImages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open && !isStreaming && view === "chat") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, isStreaming, view]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content: content.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    const assistantMessage: ChatMessage = { role: "assistant", content: "" };
    setMessages([...updatedMessages, assistantMessage]);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/chat/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, filters: { spicy, airfryer } }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Please sign in to use the assistant."
            : "Something went wrong. Please try again."
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: accumulated,
          };
          return updated;
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong.";

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `Sorry, I ran into an issue: ${errorMessage}`,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setInput("");
    setIsStreaming(false);
    setSpicy(false);
    setAirfryer(false);
    setView("chat");
    setSelectedRecipeName("");
    setSelectedRecipeIngredients([]);
    setRecipeImages({});
    setLoadingImages(new Set());
    fetchedRecipesRef.current = new Set();
  };

  const handleAddRecipe = (recipeName: string) => {
    // Search all assistant messages for ingredients matching this recipe
    let ingredients: SuggestedIngredient[] = [];
    for (const msg of messages) {
      if (msg.role === "assistant" && msg.content) {
        const recipeData = extractRecipeIngredients(msg.content);
        const found = recipeData.get(recipeName);
        if (found && found.length > 0) {
          ingredients = found;
          break;
        }
      }
    }

    setSelectedRecipeName(recipeName);
    setSelectedRecipeIngredients(ingredients);
    setView("add-recipe");
  };

  const handleBackToChat = () => {
    setView("chat");
    setSelectedRecipeName("");
    setSelectedRecipeIngredients([]);
  };

  const handleRecipeCreated = () => {
    setOpen(false);
    setView("chat");
    setSelectedRecipeName("");
    setSelectedRecipeIngredients([]);
  };

  const randomSuggestions = useMemo(
    () => pickRandom(SUGGESTIONS, 6).map((s) => `${s}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open]
  );

  const hasMessages = messages.length > 0;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="absolute inset-0 -m-2 rounded-full bg-background/0 backdrop-blur-sm" />
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          className="relative gap-2 rounded-full shadow-lg px-6 hover:shadow-xl transition-shadow"
        > 
          Food Assistant
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          {/* Backdrop — blurs the page */}
          <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className="fixed inset-0 z-50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          />

          <DialogPrimitive.Content
            data-slot="dialog-content"
            className={cn(
              "fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
              "w-[calc(100%-2rem)] h-[min(680px,85vh)]",
              view === "chat" ? "max-w-xl" : "max-w-2xl",
              "flex flex-col rounded-2xl border shadow-2xl outline-none",
              "bg-background/80 backdrop-blur-xl",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "duration-200 transition-[max-width] ease-in-out"
            )}
          >
            {/* ============ VIEW 1: CHAT ============ */}
            {view === "chat" && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-3 border-b border-border/50 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <ChefHat className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-base font-semibold">Food Assistant</DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground">
                        Get personalised recipe ideas
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {hasMessages && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="h-8 px-2 text-muted-foreground"
                        title="Start new conversation"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <DialogPrimitive.Close className="rounded-sm p-1.5 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <XIcon className="size-4" />
                      <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {!hasMessages ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-5 py-4">
                      <div className="space-y-2 shrink-0">
                      
                        <h3 className="text-lg font-semibold">
                          What are you in the mood for?
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-[280px]">
                          Tell me what you&apos;re craving and I&apos;ll suggest
                          recipes based on your tastes.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2.5 justify-center max-w-[340px]">
                      <p className="text-sm text-muted-foreground max-w-[280px]">
                        suggest me something like 
                      </p>
                        {randomSuggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => sendMessage(suggestion)}
                            className="cursor-pointer px-3 py-1.5 text-sm rounded-full border border-border/50 bg-background/60 text-secondary-foreground hover:bg-background/80 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isAssistant = message.role === "assistant";
                      // Only show recipe cards for completed assistant messages
                      const showRecipeCards =
                        isAssistant &&
                        message.content &&
                        (index < messages.length - 1 || !isStreaming);

                      return (
                        <div key={index} className="space-y-2">
                          <div
                            className={`flex gap-3 ${
                              message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            {isAssistant && (
                              <div className="flex items-start shrink-0">
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
                                  <ChefHat className="w-3.5 h-3.5 text-primary" />
                                </div>
                              </div>
                            )}
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted/70 rounded-bl-md"
                              }`}
                            >
                              {isAssistant ? (
                                <div>
                                  {message.content ? (
                                    showRecipeCards
                                      ? renderMessageWithImages(message.content, recipeImages, loadingImages, handleImageError, handleAddRecipe)
                                      : renderMarkdown(message.content)
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Thinking...
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="whitespace-pre-wrap">
                                  {message.content}
                                </div>
                              )}
                            </div>
                            {message.role === "user" && (
                              <div className="flex items-start shrink-0">
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary">
                                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Filters + Input */}
                <div className="shrink-0 border-t border-border/50 p-4 space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSpicy((v) => !v)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        spicy
                          ? "bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20"
                          : "bg-background/60 text-muted-foreground border-border/50 hover:bg-background/80"
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      {spicy ? "Spicy" : "No Spice"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAirfryer((v) => !v)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        airfryer
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20"
                          : "bg-background/60 text-muted-foreground border-border/50 hover:bg-background/80"
                      }`}
                    >
                      <Wind className="w-3.5 h-3.5" />
                      Air Fryer
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                    <div className="relative flex-1">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask for recipe ideas..."
                        rows={1}
                        className="w-full resize-none rounded-xl border border-border/50 bg-background/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring max-h-[120px] min-h-[42px]"
                        style={{ height: "auto", minHeight: "42px" }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = "auto";
                          target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                        }}
                        disabled={isStreaming}
                      />
                    </div>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim() || isStreaming}
                      className="h-[42px] w-[42px] rounded-xl shrink-0"
                    >
                      {isStreaming ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            )}

            {/* ============ VIEW 2: ADD RECIPE ============ */}
            {view === "add-recipe" && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-3 border-b border-border/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToChat}
                      className="h-8 px-2 text-muted-foreground"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                      <DialogTitle className="text-base font-semibold">
                        Add Recipe
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground">
                        Save &ldquo;{selectedRecipeName}&rdquo; to your collection
                      </DialogDescription>
                    </div>
                  </div>
                  <DialogPrimitive.Close className="rounded-sm p-1.5 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <XIcon className="size-4" />
                    <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>
                </div>

                {/* Recipe Form */}
                <div className="flex-1 overflow-y-auto p-4">
                  <RecipeForm
                    initialName={selectedRecipeName}
                    initialSuggestedIngredients={selectedRecipeIngredients}
                    onSuccess={handleRecipeCreated}
                    onCancel={handleBackToChat}
                    onBackToChat={handleBackToChat}
                  />
                </div>
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}
