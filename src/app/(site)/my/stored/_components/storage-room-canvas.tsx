"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useStored, useStoredLocation } from "@/src/domains/stored/_contexts/useStored";
import { StorageType, IngredientType } from "@prisma/client";
import { Box, Refrigerator, Snowflake, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

type StoragePosition = {
  x: number;
  y: number;
};

type StorageWithPosition = {
  id: string;
  name: string;
  type: StorageType;
  ingredients: any[];
  position: StoragePosition;
};

const STORAGE_POSITIONS_KEY = "storage-positions";
const DEFAULT_POSITION = { x: 50, y: 50 };
const RECTANGLE_WIDTH = 150;
const RECTANGLE_HEIGHT = 100;

function getStorageTypeIcon(type: StorageType) {
  switch (type) {
    case StorageType.pantry:
      return Box;
    case StorageType.fridge:
      return Refrigerator;
    case StorageType.freezer:
      return Snowflake;
    default:
      return Box;
  }
}

function getStorageTypeColor(type: StorageType): string {
  switch (type) {
    case StorageType.pantry:
      return "bg-amber-100 border-amber-300 hover:bg-amber-200";
    case StorageType.fridge:
      return "bg-blue-100 border-blue-300 hover:bg-blue-200";
    case StorageType.freezer:
      return "bg-cyan-100 border-cyan-300 hover:bg-cyan-200";
    default:
      return "bg-gray-100 border-gray-300 hover:bg-gray-200";
  }
}

function getStorageTypeLabel(type: StorageType): string {
  switch (type) {
    case StorageType.pantry:
      return "Pantry";
    case StorageType.fridge:
      return "Fridge";
    case StorageType.freezer:
      return "Freezer";
    default:
      return type;
  }
}

function loadPositions(): Record<string, StoragePosition> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_POSITIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function savePositions(positions: Record<string, StoragePosition>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_POSITIONS_KEY, JSON.stringify(positions));
  } catch (error) {
    console.error("Failed to save positions:", error);
  }
}

export function StorageRoomCanvas() {
  const { data: stored, isLoading } = useStored();
  const [positions, setPositions] = useState<Record<string, StoragePosition>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [openedStorageId, setOpenedStorageId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load positions from localStorage on mount
  useEffect(() => {
    const savedPositions = loadPositions();
    setPositions(savedPositions);
  }, []);

  // Initialize positions for new storage locations
  useEffect(() => {
    if (!stored || stored.length === 0) return;

    setPositions((prev) => {
      const updated = { ...prev };
      let hasChanges = false;

      stored.forEach((location) => {
        if (!updated[location.id]) {
          // Find a position that doesn't overlap with existing ones
          let x = DEFAULT_POSITION.x;
          let y = DEFAULT_POSITION.y;
          let attempts = 0;
          const maxAttempts = 50;

          while (attempts < maxAttempts) {
            const overlaps = Object.values(updated).some(
              (pos) =>
                Math.abs(pos.x - x) < RECTANGLE_WIDTH + 20 &&
                Math.abs(pos.y - y) < RECTANGLE_HEIGHT + 20
            );

            if (!overlaps) break;

            x += RECTANGLE_WIDTH + 30;
            if (x > 800) {
              x = DEFAULT_POSITION.x;
              y += RECTANGLE_HEIGHT + 30;
            }
            attempts++;
          }

          updated[location.id] = { x, y };
          hasChanges = true;
        }
      });

      if (hasChanges) {
        savePositions(updated);
      }

      return updated;
    });
  }, [stored]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      // Don't start dragging if clicking on a link or button
      if ((e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const currentPos = positions[id] || DEFAULT_POSITION;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setDragStartPos({ x: e.clientX, y: e.clientY });
      setDraggingId(id);
      setDragOffset({
        x: mouseX - currentPos.x,
        y: mouseY - currentPos.y,
      });
    },
    [positions]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingId || !canvasRef.current || !dragStartPos) return;

      // Only start dragging if mouse moved more than 5 pixels
      const moveDistance = Math.sqrt(
        Math.pow(e.clientX - dragStartPos.x, 2) + Math.pow(e.clientY - dragStartPos.y, 2)
      );

      if (moveDistance < 5) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newX = Math.max(
        0,
        Math.min(mouseX - dragOffset.x, rect.width - RECTANGLE_WIDTH)
      );
      const newY = Math.max(
        0,
        Math.min(mouseY - dragOffset.y, rect.height - RECTANGLE_HEIGHT)
      );

      setPositions((prev) => {
        const updated = {
          ...prev,
          [draggingId]: { x: newX, y: newY },
        };
        savePositions(updated);
        return updated;
      });
    },
    [draggingId, dragOffset, dragStartPos]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
    setDragOffset({ x: 0, y: 0 });
    setDragStartPos(null);
  }, []);

  useEffect(() => {
    if (draggingId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingId, handleMouseMove, handleMouseUp]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-lg">
        <p className="text-muted-foreground">Loading storage locations...</p>
      </div>
    );
  }

  if (!stored || stored.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-lg bg-gray-50">
        <p className="text-muted-foreground">
          No storage locations yet. Create your first storage location to get started.
        </p>
      </div>
    );
  }

  const storageWithPositions: StorageWithPosition[] = stored.map((location) => ({
    ...location,
    position: positions[location.id] || DEFAULT_POSITION,
  }));

  return (
    <div className="w-full space-y-4">
      <div
        ref={canvasRef}
        className="relative w-full h-[450px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-visible"
        style={{ minHeight: "400px" }}
      >
        {storageWithPositions.map((storage) => {
          const Icon = getStorageTypeIcon(storage.type);
          const colorClass = getStorageTypeColor(storage.type);
          const isDragging = draggingId === storage.id;
          const isOpen = openedStorageId === storage.id;

          return (
            <div key={storage.id}>
              <div
                className={`absolute cursor-move transition-none ${colorClass} border-2 rounded-lg p-3 shadow-md ${
                  isDragging ? "z-50 shadow-lg scale-105" : "z-10"
                }`}
                style={{
                  left: `${storage.position.x}px`,
                  top: `${storage.position.y}px`,
                  width: `${RECTANGLE_WIDTH}px`,
                  height: `${RECTANGLE_HEIGHT}px`,
                }}
                onMouseDown={(e) => handleMouseDown(e, storage.id)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium text-gray-600">
                      {getStorageTypeLabel(storage.type)}
                    </span>
                  </div>
                  <Link
                    href={`/my/stored/${storage.id}`}
                    className="font-semibold text-sm hover:underline flex-1"
                    onClick={(e) => {
                      // Prevent navigation when dragging
                      if (draggingId === storage.id || isDragging) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  >
                    {storage.name}
                  </Link>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-xs text-muted-foreground">
                      {(storage.ingredients?.length || 0)} ingredient
                      {(storage.ingredients?.length || 0) !== 1 ? "s" : ""}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenedStorageId(isOpen ? null : storage.id);
                      }}
                    >
                      {isOpen ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              {isOpen && (
                <StorageAggregationCards
                  storageId={storage.id}
                  position={{
                    x: storage.position.x,
                    y: storage.position.y + RECTANGLE_HEIGHT + 10,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Click and drag storage locations to rearrange them in your room.
      </p>
    </div>
  );
}

function StorageAggregationCards({
  storageId,
  position,
}: {
  storageId: string;
  position: StoragePosition;
}) {
  const { data: storedLocation, isLoading } = useStoredLocation(storageId);

  if (isLoading) {
    return (
      <div
        className="absolute bg-white border rounded-lg p-2 shadow-md z-20"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!storedLocation) {
    return null;
  }

  const storedIngredients = storedLocation.ingredients || [];

  // Calculate aggregations
  const ingredientTypeCounts: Record<IngredientType, number> = {
    food: 0,
    drink: 0,
    condiment: 0,
    cleaning: 0,
    household: 0,
  };

  const storageTypeCounts: Record<StorageType, number> = {
    pantry: 0,
    fridge: 0,
    freezer: 0,
  };

  const tagCounts: Record<string, { name: string; color: string; count: number }> = {};
  const categoryCounts: Record<string, { name: string; color: string; count: number }> = {};

  storedIngredients.forEach((storedIngredient) => {
    const ingredient = storedIngredient.ingredient;
    const shop = ingredient.shopIngredient;

    // Count ingredient types (from ShopIngredient)
    if (shop?.type) {
      ingredientTypeCounts[shop.type] = (ingredientTypeCounts[shop.type] || 0) + 1;
    }

    // Count storage types (from ShopIngredient)
    if (shop?.storageType) {
      storageTypeCounts[shop.storageType] =
        (storageTypeCounts[shop.storageType] || 0) + 1;
    }

    // Count tags
    ingredient.tag?.forEach((tag) => {
      if (!tagCounts[tag.id]) {
        tagCounts[tag.id] = {
          name: tag.name,
          color: tag.color,
          count: 0,
        };
      }
      tagCounts[tag.id].count += 1;
    });

    // Count categories (from ShopIngredient)
    if (shop?.category) {
      const category = shop.category;
      if (!categoryCounts[category.id]) {
        categoryCounts[category.id] = {
          name: category.name,
          color: category.color,
          count: 0,
        };
      }
      categoryCounts[category.id].count += 1;
    }
  });

  const allCards: Array<{ label: string; count: number; type: string; color?: string }> = [];

  // Add ingredient type cards
  Object.entries(ingredientTypeCounts)
    .filter(([_, count]) => count > 0)
    .forEach(([type, count]) => {
      allCards.push({ label: type, count, type: "ingredientType" });
    });

  // Add storage type cards
  Object.entries(storageTypeCounts)
    .filter(([_, count]) => count > 0)
    .forEach(([type, count]) => {
      allCards.push({
        label: getStorageTypeLabel(type as StorageType),
        count,
        type: "storageType",
      });
    });

  // Add tag cards
  Object.values(tagCounts).forEach((tag) => {
    allCards.push({
      label: tag.name,
      count: tag.count,
      type: "tag",
      color: tag.color,
    });
  });

  // Add category cards
  Object.values(categoryCounts).forEach((category) => {
    allCards.push({
      label: category.name,
      count: category.count,
      type: "category",
      color: category.color,
    });
  });

  if (allCards.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute z-20 flex flex-wrap gap-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxWidth: `${RECTANGLE_WIDTH * 2}px`,
      }}
    >
      {allCards.map((card, index) => {
        let cardClassName = "px-2 py-1 rounded-md text-xs font-medium border shadow-sm";
        let cardStyle: React.CSSProperties = {};

        if (card.type === "ingredientType") {
          cardClassName += " bg-primary/10 text-primary border-primary/20";
        } else if (card.type === "storageType") {
          cardClassName += " bg-blue-100 text-blue-700 border-blue-200";
        } else if (card.type === "tag" && card.color) {
          cardClassName += " flex items-center gap-1";
          cardStyle = {
            backgroundColor: `${card.color}20`,
            color: card.color,
            border: `1px solid ${card.color}40`,
          };
        } else if (card.type === "category" && card.color) {
          cardStyle = {
            backgroundColor: `${card.color}20`,
            color: card.color,
            border: `1px solid ${card.color}40`,
          };
        }

        return (
          <div key={`${card.type}-${card.label}-${index}`} className={cardClassName} style={cardStyle}>
            {card.type === "tag" && card.color && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: card.color }}
              />
            )}
            <span>
              {card.count} {card.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
