"use client";

import { useState } from "react";
import { ProductsList } from "@/src/domains/products/_components/products-list";
import { ProductModal } from "@/src/domains/products/_components/product-modal";
import Link from "next/link";
import { IngredientsPageClient } from "../ingredients/_components/ingredients-page-client";
import { Button } from "@/src/components/ui/button";
import { Package, UtensilsCrossed, Search } from "lucide-react";
import { cn } from "@/src/lib/utils";

type Display = "products" | "ingredients";

export function MyProductsPageClient() {
  const [display, setDisplay] = useState<Display>("products");

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Products</h1>
            <p className="text-muted-foreground">
              Manage your shop products and ingredients. Add products from
              retailers and organize ingredients for recipes and storage.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div
          role="tablist"
          aria-label="Products and ingredients"
          className="flex gap-1 rounded-lg border bg-muted/50 p-1 w-fit"
        >
          <Button
            role="tab"
            aria-selected={display === "products"}
            aria-controls="products-panel"
            id="products-tab"
            variant="ghost"
            size="sm"
            onClick={() => setDisplay("products")}
            className={cn(
              "gap-2",
              display === "products" &&
                "bg-background shadow-sm hover:bg-background"
            )}
          >
            <Package className="size-4" />
            Products
          </Button>
          <Button
            role="tab"
            aria-selected={display === "ingredients"}
            aria-controls="ingredients-panel"
            id="ingredients-tab"
            variant="ghost"
            size="sm"
            onClick={() => setDisplay("ingredients")}
            className={cn(
              "gap-2",
              display === "ingredients" &&
                "bg-background shadow-sm hover:bg-background"
            )}
          >
            <UtensilsCrossed className="size-4" />
            Ingredients
          </Button>
        </div>

        {/* Actions per display */}
        {display === "products" && (
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/system/products/find">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Find products
              </Button>
            </Link>
            <ProductModal mode="create" />
          </div>
        )}

        {/* Products display */}
        <section
          id="products-panel"
          role="tabpanel"
          aria-labelledby="products-tab"
          hidden={display !== "products"}
          className="space-y-4"
        >
          <ProductsList showHeaderActions={false} />
        </section>

        {/* Ingredients display */}
        <section
          id="ingredients-panel"
          role="tabpanel"
          aria-labelledby="ingredients-tab"
          hidden={display !== "ingredients"}
          className="space-y-4"
        >
          <IngredientsPageClient variant="section" />
        </section>
      </div>
    </div>
  );
}
