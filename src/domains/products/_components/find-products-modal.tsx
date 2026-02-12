"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { findProductsAction, createProductAction } from "@/src/domains/products/db";
import type { ScrapedProduct } from "@/src/domains/products/_fetch/products";
import { useProducts } from "@/src/domains/products/_contexts/useProducts";
import { Retailer } from "@prisma/client";
import { Search, Loader2, ImageOff, ExternalLink, ArrowLeft, Plus, Check, Square, CheckSquare } from "lucide-react";
import Image from "next/image";

const RETAILER_OPTIONS: { value: Retailer; label: string }[] = [
  { value: "TESCO", label: "Tesco" },
  { value: "MORRISONS", label: "Morrisons" },
  { value: "SAINSBURYS", label: "Sainsbury's" },
  { value: "ASDA", label: "Asda" },
];

const RETAILER_LABELS: Record<Retailer, string> = {
  TESCO: "Tesco",
  MORRISONS: "Morrisons",
  SAINSBURYS: "Sainsbury's",
  ASDA: "Asda",
};

type FindProductsModalProps = {
  trigger?: React.ReactNode;
};

export function FindProductsModal({ trigger }: FindProductsModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [retailer, setRetailer] = useState<Retailer>("TESCO");
  const [products, setProducts] = useState<ScrapedProduct[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [addingProduct, setAddingProduct] = useState<string | null>(null);
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isAddingSelected, setIsAddingSelected] = useState(false);
  const { data: existingProducts, mutate: mutateProducts } = useProducts();

  // Build a set of existing product identifiers (URL or name+retailer) for quick lookup
  const existingProductKeys = new Set(
    (existingProducts ?? []).flatMap((p) => {
      const keys: string[] = [];
      if (p.url) keys.push(p.url);
      keys.push(`${p.productName}-${p.retailer}`);
      return keys;
    })
  );

  const isAlreadyAdded = (product: ScrapedProduct): boolean => {
    if (product.url && existingProductKeys.has(product.url)) return true;
    if (existingProductKeys.has(`${product.productName}-${product.retailer}`)) return true;
    return false;
  };

  const handleSearch = () => {
    setError("");
    if (!searchQuery.trim()) {
      setError("Enter a search term");
      return;
    }
    startTransition(async () => {
      const result = await findProductsAction(retailer, searchQuery.trim());
      if (result.success && result.data != null) {
        setProducts(result.data);
        setStep(2);
      } else {
        setError(result.error ?? "Failed to find products");
      }
    });
  };

  const handleSearchAgain = () => {
    setStep(1);
    setProducts([]);
    setError("");
    setAddedProducts(new Set());
    setSelectedProducts(new Set());
  };

  const toggleProductSelection = (productKey: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productKey)) {
        next.delete(productKey);
      } else {
        next.add(productKey);
      }
      return next;
    });
  };

  const handleAddSelected = async () => {
    if (selectedProducts.size === 0) return;
    setIsAddingSelected(true);
    setError("");

    const productsToAdd = products.filter((product, i) => {
      const productKey = `${product.productName}-${product.url ?? i}`;
      return selectedProducts.has(productKey);
    });

    let successCount = 0;
    for (const product of productsToAdd) {
      const result = await createProductAction(
        product.retailer,
        product.productName,
        product.url,
        product.price != null ? product.price / 100 : null,
        product.size,
        product.unit,
        product.imageUrl
      );
      if (result.success) {
        successCount++;
        const productKey = `${product.productName}-${product.url ?? products.indexOf(product)}`;
        setAddedProducts((prev) => new Set(prev).add(productKey));
      }
    }

    if (successCount > 0) {
      await mutateProducts();
    }

    if (successCount < productsToAdd.length) {
      setError(`Added ${successCount} of ${productsToAdd.length} products. Some failed.`);
    }

    setSelectedProducts(new Set());
    setIsAddingSelected(false);
  };

  const handleAddProduct = async (product: ScrapedProduct, index: number) => {
    const productKey = `${product.productName}-${product.url ?? index}`;
    setAddingProduct(productKey);
    
    const result = await createProductAction(
      product.retailer,
      product.productName,
      product.url,
      product.price != null ? product.price / 100 : null, // convert pence to pounds for the action
      product.size,
      product.unit,
      product.imageUrl
    );

    if (result.success) {
      setAddedProducts((prev) => new Set(prev).add(productKey));
      await mutateProducts();
    } else {
      setError(result.error ?? "Failed to add product");
    }
    
    setAddingProduct(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep(1);
      setProducts([]);
      setError("");
      setAddedProducts(new Set());
      setSelectedProducts(new Set());
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ?? (
        <DialogTrigger asChild>
          <Button variant="outline" size="default">
            <Search className="w-4 h-4 mr-2" />
            Find products
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Find products" : "Products found"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Search a retailer for products. Enter a query and select a shop, then we'll scrape the results."
              : `${products.length} product${products.length === 1 ? "" : "s"} found. You can add any of these from the main list.`}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search query</label>
              <Input
                placeholder="e.g. chicken tikka, oranges, milk"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Shop</label>
              <Select
                value={retailer}
                onValueChange={(v) => setRetailer(v as Retailer)}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RETAILER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              onClick={handleSearch}
              disabled={isPending}
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchAgain}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Search again
              </Button>
              {selectedProducts.size > 0 && (
                <Button
                  size="sm"
                  onClick={handleAddSelected}
                  disabled={isAddingSelected}
                >
                  {isAddingSelected ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add {selectedProducts.size} selected
                    </>
                  )}
                </Button>
              )}
            </div>
            {error && (
              <p className="text-sm text-destructive mb-2">{error}</p>
            )}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1">
              {products.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No products found. Try a different search or shop.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {products.map((product, i) => {
                    const productKey = `${product.productName}-${product.url ?? i}`;
                    const isAdding = addingProduct === productKey;
                    const isAdded = addedProducts.has(productKey);
                    const alreadyExists = isAlreadyAdded(product);
                    const isSelected = selectedProducts.has(productKey);
                    const isDisabled = isAdded || alreadyExists || isAddingSelected;

                    return (
                      <div
                        key={productKey}
                        className={`flex gap-3 rounded-lg border p-3 shadow-sm transition-colors ${
                          isSelected ? "border-primary bg-primary/5" : "bg-card"
                        } ${isDisabled ? "opacity-60" : "cursor-pointer hover:bg-muted/50"}`}
                        onClick={() => !isDisabled && toggleProductSelection(productKey)}
                      >
                        {/* Checkbox */}
                        <div className="flex items-start pt-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isDisabled) toggleProductSelection(productKey);
                            }}
                            disabled={isDisabled}
                            className="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-primary" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        {/* Image */}
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
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

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm line-clamp-2">
                                {product.productName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {RETAILER_LABELS[product.retailer]}
                              </p>
                            </div>
                            {(alreadyExists || isAdded) ? (
                              <span className="inline-flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded shrink-0">
                                <Check className="w-3 h-3 mr-1" />
                                Added
                              </span>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddProduct(product, i);
                                }}
                                disabled={isAdding || isAddingSelected}
                                className="h-8 shrink-0"
                              >
                                {isAdding ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                          {(product.size != null || product.unit) && (
                            <p className="text-xs text-muted-foreground">
                              {[product.size != null ? product.size : null, product.unit]
                                .filter((x) => x != null)
                                .join(" ")}
                            </p>
                          )}
                          {product.price != null && (
                            <p className="text-sm font-medium mt-0.5">
                              £{(product.price / 100).toFixed(2)}
                            </p>
                          )}
                          {product.url && (
                            <a
                              href={product.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
