"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/src/components/ui/drawer";
import { RecipeFormEdit } from "@/src/domains/recipes/_components/recipe-form-edit";

type EditRecipeDrawerProps = {
  recipeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function EditRecipeDrawer({
  recipeId,
  open,
  onOpenChange,
  onSuccess,
}: EditRecipeDrawerProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full h-full sm:max-w-2xl overflow-y-auto">
        <DrawerHeader className="border-b">
          <DrawerTitle>Edit Recipe</DrawerTitle>
          <DrawerDescription>
            Update recipe details, ingredients, and tags
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          {recipeId && (
            <RecipeFormEdit
              recipeId={recipeId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
