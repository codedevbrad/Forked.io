/**
 * Canonical form rules for ingredient names:
 *
 * | Type              | Example                        | Canonical form             |
 * |-------------------|--------------------------------|----------------------------|
 * | Countable         | Carrot, Onion, Apple           | Singular                   |
 * | Mass noun         | Chicken, Flour, Rice           | As-is (no plural)          |
 * | Inherently plural | Grapes, Oats, Baked beans      | Plural (natural form)      |
 * | Compound          | Chicken breast, Pork chop      | Singular                   |
 */

export { toSingular, toPlural, getNameVariants } from "../../src/lib/pluralise";
