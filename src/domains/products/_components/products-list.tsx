"use client";

import { useState, useMemo, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { ProductModal } from "@/src/domains/products/_components/product-modal";
import { deleteProductAction } from "@/src/domains/products/db";
import Link from "next/link";
import { useProducts } from "@/src/domains/products/_contexts/useProducts";
import { useCategories } from "@/src/domains/categories/_contexts/useCategories";
import { Retailer, Unit } from "@prisma/client";
import { Pencil, Trash2, ExternalLink, ImageOff, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

type CategoryInfo = { id: string; name: string; color: string };

type ShopProduct = {
  id: string;
  retailer: Retailer;
  productName: string;
  url: string | null;
  price: number | null; // stored in pence
  size: number | null;
  unit: Unit | null;
  imageUrl: string | null;
  shopIngredient: {
    id: string;
    name: string;
    category: CategoryInfo | null;
  } | null;
};

const RETAILER_LABELS: Record<Retailer, string> = {
  TESCO: "Tesco",
  MORRISONS: "Morrisons",
  SAINSBURYS: "Sainsbury's",
  ASDA: "Asda",
};

type ProductsListProps = {
  /** When false, hide the Find products / Add product bar (e.g. when page has its own header actions). Default true. */
  showHeaderActions?: boolean;
};

export function ProductsList({ showHeaderActions = true }: ProductsListProps) {
  const { data: products, isLoading, error, mutate } = useProducts();
  const { data: categories } = useCategories();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  // Filter products by selected categories
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const all = products as ShopProduct[];
    if (selectedCategoryIds.length === 0) return all;
    return all.filter((p) => {
      const catId = p.shopIngredient?.category?.id;
      return catId ? selectedCategoryIds.includes(catId) : false;
    });
  }, [products, selectedCategoryIds]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedProducts = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, safePage]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    startTransition(async () => {
      const result = await deleteProductAction(itemToDelete);
      if (result.success) {
        await mutate();
      } else {
        alert(result.error);
      }
      setItemToDelete(null);
    });
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground">Loading products...</p>
    );
  }

  if (error) {
    return (
      <p className="text-destructive">Error loading products. Please try again.</p>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="space-y-4">
        {showHeaderActions && (
          <div className="flex justify-end gap-2">
            <Link href="/system/products/find">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Find products
              </Button>
            </Link>
            <ProductModal mode="create" />
          </div>
        )}
        <p className="text-muted-foreground">
          No products yet. Add a product to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
      {showHeaderActions && (
        <div className="mb-4 flex justify-end gap-2">
          <Link href="/system/products/find">
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Find products
            </Button>
          </Link>
          <ProductModal mode="create" />
        </div>
      )}

      {/* Category filters */}
      {categories && categories.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-1">Category:</span>
          {categories.map((category) => {
            const isSelected = selectedCategoryIds.includes(category.id);
            const count = (products as ShopProduct[]).filter(
              (p) => p.shopIngredient?.category?.id === category.id
            ).length;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryToggle(category.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium transition-colors ${
                  isSelected
                    ? "ring-2 ring-offset-2"
                    : "opacity-60 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: isSelected
                    ? `${category.color}20`
                    : `${category.color}10`,
                  color: category.color,
                  border: `1px solid ${category.color}40`,
                  ringColor: category.color,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
                <span className="text-xs opacity-70">({count})</span>
              </button>
            );
          })}
          {selectedCategoryIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategoryIds([])}
              className="h-7 px-2 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {selectedCategoryIds.length > 0 && (
          filteredProducts.length === 0 ? (
            <p className="text-muted-foreground">
              No products match the selected {selectedCategoryIds.length === 1 ? "category" : "categories"}.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {(products as ShopProduct[]).length} products
            </p>
          )
        )}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {pagedProducts.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col rounded-lg border bg-card shadow-sm transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-center overflow-hidden rounded-t-lg bg-muted aspect-square h-[130px]">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.productName}
                    width={200}
                    height={70}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <ImageOff className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0 flex-1 p-4">
                {/* Ingredient pill */}
                {product.shopIngredient && (
                  <div className="flex justify-end mb-1">
                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                      {product.shopIngredient.name}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {RETAILER_LABELS[product.retailer]}
                    </p>
                    {(product.size != null || product.unit) && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[product.size != null ? product.size : null, product.unit]
                          .filter((x) => x != null)
                          .join(" ")}
                      </p>
                    )}
                    {product.price != null && (
                      <p className="mt-1 text-sm font-medium">
                        £{(product.price / 100).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ProductModal
                      mode="edit"
                      product={product}
                      trigger={
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(product.id)}
                      disabled={isPending}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                {product.url && (
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View product
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="sr-only">Previous</span>
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === safePage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="min-w-8"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
