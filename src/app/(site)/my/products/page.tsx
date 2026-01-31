import { auth } from "@/auth";
import { IngredientsPageClient } from "./_components/ingredients-page-client";
import { redirect } from "next/navigation";

export default async function IngredientsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/my/ingredients/what");
  }
  
  return <IngredientsPageClient />;
}