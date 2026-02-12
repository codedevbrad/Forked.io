import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ShoppingListsList } from "./_components/shopping-lists-list";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";

export default async function ShopPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/my/shop/what");
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Shopping Lists</h1>
            <p className="text-muted-foreground">
              Create and manage your shopping lists. Add ingredients with quantities to track what you need to buy.
            </p>
          </div>
          <Button asChild>
            <Link href="/my/shop/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Shopping List
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Shopping Lists</h2>
          <ShoppingListsList />
        </div>
      </div>
    </div>
  );
}
