"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
 * Renders a plain-text string with basic markdown:
 *  - **bold**
 *  - [label](url) → clickable link
 *  - newlines preserved
 */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
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
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

const SUGGESTIONS = [
  "What should I cook tonight?",
  "Suggest something quick and easy",
  "I'm in the mood for comfort food",
  "What can I make with chicken?",
  "Recommend a healthy dinner",
];

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

  const hasMessages = messages.length > 0;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Recommend Me
      </Button>

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
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
                          <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">
                          What are you in the mood for?
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-[280px]">
                          Tell me what you&apos;re craving and I&apos;ll suggest
                          recipes based on your tastes.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center max-w-[320px]">
                        {SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => sendMessage(suggestion)}
                            className="px-3 py-1.5 text-sm rounded-full border border-border/50 bg-background/60 text-secondary-foreground hover:bg-background/80 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isAssistant = message.role === "assistant";
                      // Only extract recipe names from completed assistant messages
                      const showAddButtons =
                        isAssistant &&
                        message.content &&
                        (index < messages.length - 1 || !isStreaming);
                      const recipeNames = showAddButtons
                        ? extractRecipeNames(message.content)
                        : [];

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
                                    renderMarkdown(message.content)
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

                          {/* Add as Recipe buttons */}
                          {recipeNames.length > 0 && (
                            <div className="flex gap-2 flex-wrap ml-10">
                              {recipeNames.map((name) => (
                                <button
                                  key={name}
                                  onClick={() => handleAddRecipe(name)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add &ldquo;{name}&rdquo;
                                </button>
                              ))}
                            </div>
                          )}
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
