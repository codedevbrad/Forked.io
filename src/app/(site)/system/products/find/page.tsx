"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { findProductsAction, createProductAction } from "@/src/domains/products/db";
import type { ScrapedProduct } from "@/src/domains/products/_fetch/products";
import { useProducts } from "@/src/domains/products/_contexts/useProducts";
import { ProductSearchHero } from "@/src/domains/products/_components/product-search-hero";
import { Retailer } from "@prisma/client";
import {
  Loader2,
  ImageOff,
  ExternalLink,
  Plus,
  Check,
  Square,
  CheckSquare,
  Search,
  Download,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

type SearchStep = "idle" | "finding" | "getting" | "filtering" | "complete";

const SEARCH_STEPS: { key: SearchStep; label: string; icon: React.ReactNode }[] = [
  { key: "finding", label: "Finding products", icon: <Search className="w-4 h-4" /> },
  { key: "getting", label: "Getting results", icon: <Download className="w-4 h-4" /> },
  { key: "filtering", label: "Filtering for best results", icon: <Sparkles className="w-4 h-4" /> },
  { key: "complete", label: "Found", icon: <CheckCircle2 className="w-4 h-4" /> },
];

function SearchProgress({ currentStep }: { currentStep: SearchStep }) {
  const currentIndex = SEARCH_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="flex items-center gap-2">
        {SEARCH_STEPS.map((step, index) => {
          const isActive = step.key === currentStep;
          const isComplete = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.key} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground scale-105"
                    : isComplete
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isComplete ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.icon
                )}
                <span className={`text-sm font-medium ${isPending ? "hidden sm:inline" : ""}`}>
                  {step.label}
                </span>
              </div>
              {index < SEARCH_STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${
                    isComplete ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-muted-foreground text-sm animate-pulse">
        {currentStep === "finding" && "Searching retailer for products..."}
        {currentStep === "getting" && "Retrieving product information..."}
        {currentStep === "filtering" && "Using AI to filter the best matches..."}
        {currentStep === "complete" && "Search complete!"}
      </p>
    </div>
  );
}

const RETAILER_LABELS: Record<Retailer, string> = {
  TESCO: "Tesco",
  MORRISONS: "Morrisons",
  SAINSBURYS: "Sainsbury's",
  ASDA: "Asda",
};

export default function FindProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [retailer, setRetailer] = useState<Retailer>("TESCO");
  const [products, setProducts] = useState<ScrapedProduct[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [searchStep, setSearchStep] = useState<SearchStep>("idle");
  const [addingProduct, setAddingProduct] = useState<string | null>(null);
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isAddingSelected, setIsAddingSelected] = useState(false);
  const { data: existingProducts, mutate: mutateProducts } = useProducts();
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

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

    // Clear any existing timer
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
    }

    // Start the step progression
    setSearchStep("finding");
    setHasSearched(false);

    // Progress through steps with timing (simulated progress)
    stepTimerRef.current = setTimeout(() => {
      setSearchStep("getting");
      stepTimerRef.current = setTimeout(() => {
        setSearchStep("filtering");
      }, 2000);
    }, 1500);

    startTransition(async () => {
      const result = await findProductsAction(retailer, searchQuery.trim());
      
      // Clear the timer and set final state
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }

      if (result.success && result.data != null) {
        setSearchStep("complete");
        setProducts(result.data);
        
        // Show complete state briefly, then show results
        setTimeout(() => {
          setSearchStep("idle");
          setHasSearched(true);
        }, 800);
        
        setSelectedProducts(new Set());
        setAddedProducts(new Set());
      } else if (!result.success) {
        setSearchStep("idle");
        setError(result.error ?? "Failed to find products");
      }
    });
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
    };
  }, []);

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
      product.price != null ? product.price / 100 : null,
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

  return (
    <div className="space-y-8">
      {/* Hero Search Section */}
      <ProductSearchHero
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        retailer={retailer}
        onRetailerChange={setRetailer}
        onSearch={handleSearch}
        isPending={isPending}
        error={error}
      />

      {/* Search Progress */}
      {searchStep !== "idle" && (
        <div className="rounded-xl border bg-card shadow-sm">
          <SearchProgress currentStep={searchStep} />
        </div>
      )}

      {/* Results */}
      {hasSearched && searchStep === "idle" && (
        <div className="space-y-4">
          {/* Results header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {products.length} product{products.length === 1 ? "" : "s"} found
            </p>
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

          {/* Product grid */}
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No products found. Try a different search or shop.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    className={`flex gap-3 rounded-lg border p-4 shadow-sm transition-colors ${
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
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.productName}
                          width={80}
                          height={80}
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
                        {alreadyExists || isAdded ? (
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
      )}
    </div>
  );
}
