import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getStoredLocationAction } from "@/src/domains/stored/db";
import { StoredIngredientsList } from "./_components/stored-ingredients-list";
import { AddIngredientToStoredPopover } from "./_components/add-ingredient-to-stored-popover";

export default async function StoredLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const stored = await getStoredLocationAction(id);

  if (!stored) {
    redirect("/my/stored");
  }

  const getStorageTypeLabel = (type: string) => {
    switch (type) {
      case "pantry":
        return "Pantry";
      case "fridge":
        return "Fridge";
      case "freezer":
        return "Freezer";
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{stored.name}</h1>
            <p className="text-muted-foreground">
              {getStorageTypeLabel(stored.type)} • Manage ingredients in this storage location
            </p>
          </div>
          <AddIngredientToStoredPopover storedId={stored.id} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Stored Ingredients</h2>
          <StoredIngredientsList storedId={stored.id} ingredients={stored.ingredients} />
        </div>
      </div>
    </div>
  );
}
