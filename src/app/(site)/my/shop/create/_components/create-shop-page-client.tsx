"use client";

import { useRouter } from "next/navigation";
import { ShoppingListForm } from "@/src/domains/shop/_components/shopping-list-form";

export function CreateShopPageClient() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/my/shop");
  };

  const handleCancel = () => {
    router.push("/my/shop");
  };

  return (
    <ShoppingListForm onSuccess={handleSuccess} onCancel={handleCancel} />
  );
}
