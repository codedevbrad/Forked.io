import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RecipesList } from "./_components/recipes-list";
import { CreateRecipePopover } from "./_components/create-recipe-popover";
import { ImportRecipeDialog } from "./_components/import-recipe-dialog";

export default async function RecipesPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/my/recipes/what");
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Recipes</h1>
            <p className="text-muted-foreground">
              Create and manage your recipes. Add ingredients and quantities to build your recipe collection.
            </p>
          </div>
          <div className="flex gap-2">
            <ImportRecipeDialog />
            <CreateRecipePopover />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Recipes</h2>
          <RecipesList />
        </div>
      </div>
    </div>
  );
}
