"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { ProductModal } from "@/src/domains/products/_components/product-modal";
import { deleteProductAction } from "@/src/domains/products/db";
import { useProducts } from "@/src/domains/products/_contexts/useProducts";
import { Retailer, Unit } from "@prisma/client";
import { Pencil, Trash2, ExternalLink, ImageOff } from "lucide-react";
import Image from "next/image";

type ShopProduct = {
  id: string;
  retailer: Retailer;
  productName: string;
  url: string | null;
  price: number | null; // stored in pence
  size: number | null;
  unit: Unit | null;
  imageUrl: string | null;
};

const RETAILER_LABELS: Record<Retailer, string> = {
  TESCO: "Tesco",
  MORRISONS: "Morrisons",
  SAINSBURYS: "Sainsbury's",
  ASDA: "Asda",
};

export function ProductsList() {
  const { data: products, isLoading, error, mutate } = useProducts();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
        <div className="flex justify-end">
          <ProductModal mode="create" />
        </div>
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
      <div className="mb-4 flex justify-end">
        <ProductModal mode="create" />
      </div>
      <div className="space-y-2">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(products as ShopProduct[]).map((product) => (
            <div
              key={product.id}
              className="group relative flex gap-3 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-center">
                  <div className="flex h-30 w-30 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted flex-shrink-0 ">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.productName}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <ImageOff className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
              </div>
             
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium ">{product.productName}</p>
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
      </div>
    </>
  );
}
