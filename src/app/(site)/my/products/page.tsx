import { auth } from "@/auth";
import { MyProductsPageClient } from "./_components/my-products-page-client";
import { redirect } from "next/navigation";

export default async function MyProductsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/my/products/what");
  }

  return <MyProductsPageClient />;
}