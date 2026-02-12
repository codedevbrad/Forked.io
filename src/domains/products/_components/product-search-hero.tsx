"use client";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Retailer } from "@prisma/client";
import { Search, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const RETAILER_OPTIONS: { value: Retailer; label: string }[] = [
  { value: "TESCO", label: "Tesco" },
  { value: "MORRISONS", label: "Morrisons" },
  { value: "SAINSBURYS", label: "Sainsbury's" },
  { value: "ASDA", label: "Asda" },
];

type ProductSearchHeroProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  retailer: Retailer;
  onRetailerChange: (value: Retailer) => void;
  onSearch: () => void;
  isPending: boolean;
  error?: string;
  backHref?: string;
};

export function ProductSearchHero({
  searchQuery,
  onSearchQueryChange,
  retailer,
  onRetailerChange,
  onSearch,
  isPending,
  error,
  backHref = "/system/products",
}: ProductSearchHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        {/* Back link */}
        <Link
          href={backHref}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        {/* Title & Description */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Find Products
          </h1>
          <p className="text-muted-foreground text-lg">
            Search retailers for products and add them to your selection.
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-background/80 backdrop-blur-sm rounded-xl border shadow-lg p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              {/* Input with embedded Select */}
              <div className="relative flex items-center rounded-lg border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <Search className="absolute left-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSearch()}
                  disabled={isPending}
                  className="pl-10 h-12 text-base border-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent outline-none"
                />
                <div className="border-l h-8 mx-1" />
                <Select
                  value={retailer}
                  onValueChange={(v) => onRetailerChange(v as Retailer)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-[130px] h-12   focus:ring-0 focus:ring-offset-0 border-gray-300 m-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="">
                    {RETAILER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button - Centered */}
              <div className="flex justify-center">
                <Button
                  onClick={onSearch}
                  disabled={isPending}
                  className="h-11 px-10"
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search Products
                    </>
                  )}
                </Button>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
