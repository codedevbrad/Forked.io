"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { getIngredientDisplayName } from "@/src/domains/ingredients/utils";
import { useShoppingLists } from "@/src/domains/shop/_contexts/useShoppingLists";
import { ShoppingCart, ChevronLeft, ChefHat, X, GripVertical } from "lucide-react";

export function ShoppingListsPopover() {
  const { data: shoppingLists = [], isLoading } = useShoppingLists();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const selectedList = shoppingLists.find((list) => list.id === selectedListId);

  // Center the box on first open
  useEffect(() => {
    if (open && boxRef.current) {
      const boxWidth = boxRef.current.offsetWidth || 320;
      const boxHeight = boxRef.current.offsetHeight || 500;
      setPosition({
        x: (window.innerWidth - boxWidth) / 2,
        y: (window.innerHeight - boxHeight) / 2,
      });
    }
  }, [open]);

  // Handle dragging
  useEffect(() => {
    if (!isDragging || !boxRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - (boxRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (boxRef.current?.offsetHeight || 0);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start dragging if clicking on a button or link
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }

    if (headerRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleListSelect = (listId: string) => {
    setSelectedListId(listId);
  };

  const handleBack = () => {
    setSelectedListId(null);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedListId(null);
  };

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        title="View Shopping Lists"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Shopping Lists
      </Button>
    );
  }

  return (
    <>
      {/* Draggable Box */}
      <div
        ref={boxRef}
        className="fixed z-50 bg-background border rounded-lg shadow-lg w-80 max-h-[500px] flex flex-col"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header with drag handle */}
        <div
          ref={headerRef}
          className="flex items-center justify-between p-4 border-b cursor-move select-none bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <ShoppingCart className="w-4 h-4" />
            <h4 className="font-semibold text-sm">Shopping Lists</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading shopping lists...</div>
          ) : !selectedListId ? (
            <div className="space-y-2">
              {shoppingLists.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No shopping lists found. Create one to get started.
                </p>
              ) : (
                <div className="space-y-1">
                  {shoppingLists.map((list) => (
                    <Button
                      key={list.id}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => handleListSelect(list.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 shrink-0" />
                          <span className="font-medium">{list.name}</span>
                        </div>
                        {list.ingredients && list.ingredients.length > 0 && (
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {list.ingredients.length}
                          </span>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">{selectedList?.name}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="h-6 w-6 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
              
              {selectedList?.ingredients && selectedList.ingredients.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Items:</p>
                  <ul className="space-y-1 text-sm">
                    {selectedList.ingredients.map((ing) => (
                      <li key={ing.id} className="flex items-center gap-2 border rounded-md my-3 p-2 pl-4 shadow-md">
                        <span>
                           {ing.quantity} {ing.unit} {getIngredientDisplayName(ing.ingredient)}
                        </span>
                        {ing.recipe && (
                          <span title={`From recipe: ${ing.recipe.name}`}>
                            <ChefHat className="w-3 h-3 text-muted-foreground" />
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This shopping list is empty.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
