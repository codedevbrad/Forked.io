import { Unit } from "@prisma/client";

export type ExpiryStatus = {
  isExpired: boolean;
  daysUntil: number;
  dateLabel: string;
};

export function getExpiryStatus(
  expiresAt: Date | string | null
): ExpiryStatus | null {
  if (!expiresAt) return null;
  const exp = new Date(expiresAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);
  const isExpired = exp < today;
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntil = Math.ceil((exp.getTime() - today.getTime()) / msPerDay);
  const dateLabel = new Date(expiresAt).toLocaleDateString();
  return { isExpired, daysUntil, dateLabel };
}

export function getUnitLabel(unit: Unit): string {
  return unit;
}
