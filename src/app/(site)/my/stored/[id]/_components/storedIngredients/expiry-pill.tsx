"use client";

import { getExpiryStatus } from "./utils";

type ExpiryPillProps = {
  expiresAt: Date | string | null;
};

export function ExpiryPill({ expiresAt }: ExpiryPillProps) {
  const status = getExpiryStatus(expiresAt);
  if (!status) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status.isExpired ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-destructive/15 text-destructive border border-destructive/30">
          Expired
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
          {status.daysUntil === 0
            ? "Expires today"
            : `${status.daysUntil} ${status.daysUntil === 1 ? "day" : "days"} left`}
        </span>
      )}
      <span className="text-xs text-muted-foreground">{status.dateLabel}</span>
    </div>
  );
}
