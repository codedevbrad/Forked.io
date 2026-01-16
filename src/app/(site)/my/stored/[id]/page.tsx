"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/src/domains/user/_contexts/useUser";
import { useStoredLocation } from "@/src/domains/stored/_contexts/useStored";
import { StoredIngredientsList } from "./_components/stored-ingredients-list";
import { AddIngredientToStoredPopover } from "./_components/add-ingredient-to-stored-popover";
import { StorageType } from "@prisma/client";

function getStorageTypeLabel(type: StorageType): string {
  switch (type) {
    case StorageType.pantry:
      return "Pantry";
    case StorageType.fridge:
      return "Fridge";
    case StorageType.freezer:
      return "Freezer";
    default:
      return type;
  }
}

export default function StoredLocationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: user, isLoading: userLoading } = useUser();
  const { data: stored, error, isLoading } = useStoredLocation(id);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!isLoading && !stored && !error) {
      router.push("/my/stored");
    }
  }, [stored, isLoading, error, router]);

  if (userLoading || isLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <p className="text-muted-foreground">Loading storage location...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <p className="text-destructive">
          Error loading storage location. Please try again.
        </p>
      </div>
    );
  }

  if (!stored) {
    return null;
  }

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
          <StoredIngredientsList storedId={stored.id} />
        </div>
      </div>
    </div>
  );
}
