/**
 * Shared pluralisation utilities for ingredient name matching.
 *
 * Canonical form rules:
 *
 * | Type              | Example                        | Canonical form             |
 * |-------------------|--------------------------------|----------------------------|
 * | Countable         | Carrot, Onion, Apple           | Singular                   |
 * | Mass noun         | Chicken, Flour, Rice           | As-is (no plural)          |
 * | Inherently plural | Grapes, Oats, Baked beans      | Plural (natural form)      |
 * | Compound          | Chicken breast, Pork chop      | Singular                   |
 */

import pluralize from "pluralize";

/**
 * Returns the singular form of an ingredient name.
 * Handles compound names like "Chicken thighs" → "Chicken thigh"
 * by singularising only the last word.
 */
export function toSingular(name: string): string {
  return pluralize.singular(name);
}

/**
 * Returns the plural form of an ingredient name.
 */
export function toPlural(name: string): string {
  return pluralize.plural(name);
}

/**
 * Returns an array of unique name variants (original, singular, plural)
 * all lowercased, for use in case-insensitive DB matching.
 */
export function getNameVariants(name: string): string[] {
  const singular = toSingular(name);
  const plural = toPlural(name);
  const variants = new Set([
    name.toLowerCase(),
    singular.toLowerCase(),
    plural.toLowerCase(),
  ]);
  return Array.from(variants);
}
