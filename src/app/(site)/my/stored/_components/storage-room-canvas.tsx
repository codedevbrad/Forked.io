"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useStored } from "@/src/domains/stored/_contexts/useStored";
import { StorageType } from "@prisma/client";
import { Box, Refrigerator, Snowflake } from "lucide-react";
import Link from "next/link";

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
      // Don't start dragging if clicking on a link
      if ((e.target as HTMLElement).closest('a')) {
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
    <div className="w-full">
      <div
        ref={canvasRef}
        className="relative w-full h-[450px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden"
        style={{ minHeight: "400px" }}
      >
        {storageWithPositions.map((storage) => {
          const Icon = getStorageTypeIcon(storage.type);
          const colorClass = getStorageTypeColor(storage.type);
          const isDragging = draggingId === storage.id;

          return (
            <div
              key={storage.id}
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
                <div className="text-xs text-muted-foreground mt-auto">
                  {(storage.ingredients?.length || 0)} ingredient
                  {(storage.ingredients?.length || 0) !== 1 ? "s" : ""}
                </div>
              </div>
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
