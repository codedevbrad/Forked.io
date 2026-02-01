import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CreateShopPageClient } from "./_components/create-shop-page-client";

export default async function CreateShopPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/my/shop/what");
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create Shopping List</h1>
          <p className="text-muted-foreground">
            Add a new shopping list with ingredients and quantities. You can add
            ingredients manually or from recipes.
          </p>
        </div>
        <CreateShopPageClient />
      </div>
    </div>
  );
}
