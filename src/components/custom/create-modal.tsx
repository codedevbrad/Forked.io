"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { IngredientForm } from "@/src/domains/ingredients/_components/ingredient-form";
import { RecipeForm } from "@/src/domains/recipes/_components/recipe-form";
import { StoredForm } from "@/src/domains/stored/_components/stored-form";
import { ShoppingListForm } from "@/src/domains/shop/_components/shopping-list-form";
import { 
  ChefHat, 
  Package, 
  Box, 
  ShoppingCart,
  ArrowLeft 
} from "lucide-react";

type CreateType = "recipe" | "ingredient" | "stored" | "shopping-list" | null;

type CreateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateModal({ open, onOpenChange }: CreateModalProps) {
  const [selectedType, setSelectedType] = useState<CreateType>(null);

  const handleSuccess = () => {
    setSelectedType(null);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedType(null);
    onOpenChange(false);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedType(null);
    }
    onOpenChange(newOpen);
  };

  const options = [
    {
      type: "recipe" as const,
      label: "Recipe",
      description: "Create a new recipe with ingredients",
      icon: ChefHat,
    },
    {
      type: "ingredient" as const,
      label: "Ingredient",
      description: "Add a new ingredient to your collection",
      icon: Package,
    },
    {
      type: "stored" as const,
      label: "Stored Location",
      description: "Create a new storage location (pantry, fridge, freezer)",
      icon: Box,
    },
    {
      type: "shopping-list" as const,
      label: "Shopping List",
      description: "Create a new shopping list",
      icon: ShoppingCart,
    },
  ];

  const getTitle = () => {
    if (!selectedType) return "Create New";
    const option = options.find((opt) => opt.type === selectedType);
    return `Create New ${option?.label || ""}`;
  };

  const getDescription = () => {
    if (!selectedType) return "Choose what you'd like to create";
    const option = options.find((opt) => opt.type === selectedType);
    return option?.description || "";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        {!selectedType ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 auto-rows-fr">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.type} className="min-w-0 w-full flex">
                  <Button
                    variant="outline"
                    className="h-full p-6 flex flex-col items-start gap-3 hover:bg-accent w-full overflow-hidden text-left max-w-full"
                    onClick={() => setSelectedType(option.type)}
                  >
                    <Icon className="w-6 h-6 shrink-0" />
                    <div className="text-left w-full min-w-0 overflow-hidden max-w-full flex-1 flex flex-col justify-start">
                      <div className="font-semibold break-words whitespace-normal">{option.label}</div>
                      <div className="text-sm text-muted-foreground font-normal break-words whitespace-normal">
                        {option.description}
                      </div>
                    </div>
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to selection
            </Button>

            {selectedType === "ingredient" && (
              <IngredientForm onSuccess={handleSuccess} onCancel={handleCancel} />
            )}

            {selectedType === "recipe" && (
              <RecipeForm onSuccess={handleSuccess} onCancel={handleCancel} />
            )}

            {selectedType === "stored" && (
              <StoredForm onSuccess={handleSuccess} onCancel={handleCancel} />
            )}

            {selectedType === "shopping-list" && (
              <ShoppingListForm onSuccess={handleSuccess} onCancel={handleCancel} />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
