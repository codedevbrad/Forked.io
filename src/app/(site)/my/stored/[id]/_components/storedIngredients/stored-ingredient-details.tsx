"use client";

import { Unit } from "@prisma/client";
import { getUnitLabel } from "./utils";
import { ExpiryPill } from "./expiry-pill";

type StoredIngredientDetailsProps = {
  quantity: number;
  unit: Unit;
  expiresAt: Date | string | null;
  storeLink: string | null;
};

export function StoredIngredientDetails({
  quantity,
  unit,
  expiresAt,
  storeLink,
}: StoredIngredientDetailsProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">
        {quantity} {getUnitLabel(unit)}
      </p>
      <ExpiryPill expiresAt={expiresAt} />
      {storeLink && (
        <p className="text-xs text-muted-foreground">
          <a
            href={storeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Store Link
          </a>
        </p>
      )}
    </div>
  );
}
