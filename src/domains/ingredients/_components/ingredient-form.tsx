"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { createIngredientAction } from "@/src/domains/ingredients/db";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { TagSelector } from "./tag-selector";
import { Plus, X, ExternalLink } from "lucide-react";
import { tescoAutoComplete } from "@/src/services/food/store/tesco";
import { cn } from "@/src/lib/utils";

type IngredientFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function IngredientForm({ onSuccess, onCancel }: IngredientFormProps) {
  const { mutate } = useIngredients();
  const [name, setName] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [storeLinks, setStoreLinks] = useState<string[]>([]);
  const [newStoreLink, setNewStoreLink] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Auto-suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search for suggestions
  useEffect(() => {
    if (!name.trim() || name.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const results = await tescoAutoComplete(name);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setSelectedSuggestionIndex(-1);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [name]);

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    setName(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    nameInputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        nameInputRef.current &&
        !nameInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Ingredient name is required");
      return;
    }

    startTransition(async () => {
      const result = await createIngredientAction(
        name,
        selectedTagIds.length > 0 ? selectedTagIds : undefined,
        storeLinks.length > 0 ? storeLinks : undefined
      );

      if (!result.success) {
        setError(result.error);
      } else {
        setName("");
        setSelectedTagIds([]);
        setStoreLinks([]);
        setNewStoreLink("");
        await mutate();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 relative">
        <label htmlFor="name" className="text-sm font-medium">
          Ingredient Name sds
        </label>
        <div className="relative">
          <Input
            ref={nameInputRef}
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={handleKeyDown}
            required
            disabled={isPending}
            placeholder="e.g., Flour, Sugar, Salt"
            autoFocus
          />
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto"
            >
              {isLoadingSuggestions ? (
                <div className="p-2 text-sm text-muted-foreground">
                  Loading suggestions...
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="py-1">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className={cn(
                        "px-3 py-2 cursor-pointer text-sm hover:bg-accent",
                        selectedSuggestionIndex === index && "bg-accent"
                      )}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <TagSelector
        selectedTagIds={selectedTagIds}
        onSelectionChange={setSelectedTagIds}
        disabled={isPending}
      />

      <div className="space-y-2">
        <label htmlFor="storeLinks" className="text-sm font-medium">
          Store Links
        </label>
        <div className="space-y-2">
          {storeLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={link}
                onChange={(e) => {
                  const updated = [...storeLinks];
                  updated[index] = e.target.value;
                  setStoreLinks(updated);
                }}
                placeholder="https://..."
                disabled={isPending}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const updated = storeLinks.filter((_, i) => i !== index);
                  setStoreLinks(updated);
                }}
                disabled={isPending}
              >
                <X className="w-4 h-4" />
              </Button>
              {link && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(link, '_blank')}
                  disabled={isPending}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={newStoreLink}
              onChange={(e) => setNewStoreLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newStoreLink.trim()) {
                  e.preventDefault();
                  setStoreLinks([...storeLinks, newStoreLink.trim()]);
                  setNewStoreLink("");
                }
              }}
              placeholder="Add store link (e.g., https://example.com)"
              disabled={isPending}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                if (newStoreLink.trim()) {
                  setStoreLinks([...storeLinks, newStoreLink.trim()]);
                  setNewStoreLink("");
                }
              }}
              disabled={isPending || !newStoreLink.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Creating..." : "Create Ingredient"}
        </Button>
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
