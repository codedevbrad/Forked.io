import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StoredList } from "./_components/stored-list";
import { CreateStoredPopover } from "./_components/create-stored-popover";

export default async function StoredPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Storage Locations</h1>
            <p className="text-muted-foreground">
              Manage your storage locations (pantry, fridge, freezer). Create storage locations to track where you keep your ingredients.
            </p>
          </div>
          <CreateStoredPopover />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Storage Locations</h2>
          <StoredList />
        </div>
      </div>
    </div>
  );
}
