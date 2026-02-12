"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useCategories } from "@/src/domains/categories/_contexts/useCategories";
import {
  getMatchableIngredientsAction,
  matchProductsForIngredientAction,
} from "@/src/system/match/db";
import type { MatchableIngredient } from "@/src/system/match/db";
import { Retailer } from "@prisma/client";
import {
  Loader2,
  Play,
  Square,
  Package,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const RETAILER_OPTIONS: { value: Retailer; label: string }[] = [
  { value: "TESCO", label: "Tesco" },
  { value: "MORRISONS", label: "Morrisons" },
  { value: "SAINSBURYS", label: "Sainsbury's" },
  { value: "ASDA", label: "Asda" },
];

type IngredientResult = {
  ingredientId: string;
  ingredientName: string;
  savedCount: number;
  existingCount: number;
  error?: string;
};

type MatchStatus = "idle" | "loading" | "running" | "stopping" | "done";

export default function MatchProductsPage() {
  // ── Controls ────────────────────────────────────────
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [retailer, setRetailer] = useState<Retailer>("TESCO");
  const [batchSize, setBatchSize] = useState(5);
  const [productsPerIngredient, setProductsPerIngredient] = useState(3);
  const [skipMatched, setSkipMatched] = useState(true);

  // ── Data ────────────────────────────────────────────
  const { data: categories } = useCategories();
  const [ingredients, setIngredients] = useState<MatchableIngredient[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  // ── Processing state ────────────────────────────────
  const [status, setStatus] = useState<MatchStatus>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<IngredientResult[]>([]);
  const stopRef = useRef(false);

  // ── Fetch ingredients preview ───────────────────────
  const fetchIngredients = useCallback(async () => {
    setStatus("loading");
    const data = await getMatchableIngredientsAction(
      selectedCategoryId,
      skipMatched
    );
    setIngredients(data);
    setHasFetched(true);
    setStatus("idle");
    setResults([]);
    setCurrentIndex(0);
  }, [selectedCategoryId, skipMatched]);

  // ── Start matching ──────────────────────────────────
  const startMatching = useCallback(async () => {
    const batch = ingredients.slice(0, batchSize);
    if (batch.length === 0) return;

    stopRef.current = false;
    setStatus("running");
    setResults([]);
    setCurrentIndex(0);

    for (let i = 0; i < batch.length; i++) {
      if (stopRef.current) {
        setStatus("done");
        return;
      }

      setCurrentIndex(i);
      const ingredient = batch[i]!;

      const result = await matchProductsForIngredientAction(
        ingredient.id,
        retailer,
        productsPerIngredient
      );

      const entry: IngredientResult = {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        savedCount: 0,
        existingCount: 0,
      };

      if (result.success && result.data) {
        entry.savedCount = result.data.savedCount;
        entry.existingCount = result.data.existingCount;
      } else if (!result.success) {
        entry.error = result.error;
      }

      setResults((prev) => [...prev, entry]);
    }

    setStatus("done");
  }, [ingredients, batchSize, retailer, productsPerIngredient]);

  const stopMatching = useCallback(() => {
    stopRef.current = true;
    setStatus("stopping");
  }, []);

  // ── Derived values ──────────────────────────────────
  const batch = ingredients.slice(0, batchSize);
  const totalSaved = results.reduce((sum, r) => sum + r.savedCount, 0);
  const totalExisting = results.reduce((sum, r) => sum + r.existingCount, 0);
  const errorCount = results.filter((r) => r.error).length;
  const isRunning = status === "running" || status === "stopping";

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold">Match Products</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Batch-find retailer products for ShopIngredients and link them
          automatically.
        </p>
      </div>

      {/* ── Controls ───────────────────────────────── */}
      <div className="rounded-xl border bg-card shadow-sm p-5 space-y-5">
        {/* Category pills */}
        {categories && categories.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryId(null);
                  setHasFetched(false);
                }}
                className={
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors " +
                  (selectedCategoryId === null
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50")
                }
              >
                All
              </button>
              {categories.map((cat) => {
                const isActive = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setHasFetched(false);
                    }}
                    className={
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors " +
                      (isActive
                        ? "border-transparent text-white"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/50")
                    }
                    style={isActive ? { backgroundColor: cat.color } : undefined}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Row of controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Retailer */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Retailer</label>
            <Select
              value={retailer}
              onValueChange={(v) => setRetailer(v as Retailer)}
              disabled={isRunning}
            >
              <SelectTrigger>
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

          {/* Batch size */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Batch size</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value) || 1)}
              disabled={isRunning}
            />
          </div>

          {/* Products per ingredient */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Products to save</label>
            <Input
              type="number"
              min={1}
              max={20}
              value={productsPerIngredient}
              onChange={(e) =>
                setProductsPerIngredient(Number(e.target.value) || 1)
              }
              disabled={isRunning}
            />
          </div>

          {/* Skip matched toggle */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Skip matched</label>
            <button
              type="button"
              onClick={() => {
                setSkipMatched((prev) => !prev);
                setHasFetched(false);
              }}
              disabled={isRunning}
              className={
                "flex h-9 w-full items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors " +
                (skipMatched
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted/50")
              }
            >
              {skipMatched ? "Yes — skip" : "No — include all"}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchIngredients}
            disabled={isRunning || status === "loading"}
            variant="outline"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading…
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-2" />
                Load Ingredients
              </>
            )}
          </Button>

          {hasFetched && batch.length > 0 && !isRunning && status !== "loading" && (
            <Button onClick={startMatching}>
              <Play className="w-4 h-4 mr-2" />
              Start Matching ({batch.length} ingredient
              {batch.length === 1 ? "" : "s"})
            </Button>
          )}

          {isRunning && (
            <Button
              onClick={stopMatching}
              variant="destructive"
              disabled={status === "stopping"}
            >
              <Square className="w-4 h-4 mr-2" />
              {status === "stopping" ? "Stopping…" : "Stop"}
            </Button>
          )}
        </div>
      </div>

      {/* ── Ingredient preview ─────────────────────── */}
      {hasFetched && status !== "running" && status !== "stopping" && status !== "done" && (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="px-5 py-3 border-b">
            <p className="text-sm font-medium">
              {ingredients.length} ingredient{ingredients.length === 1 ? "" : "s"}{" "}
              found
              {batch.length < ingredients.length && (
                <span className="text-muted-foreground">
                  {" "}
                  — processing first {batch.length}
                </span>
              )}
            </p>
          </div>
          {batch.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No ingredients to process. Try a different category or disable
              &quot;Skip matched&quot;.
            </div>
          ) : (
            <div className="divide-y max-h-80 overflow-y-auto">
              {batch.map((ing) => (
                <div
                  key={ing.id}
                  className="flex items-center justify-between px-5 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate">{ing.name}</span>
                    {ing.categoryName && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                        {ing.categoryName}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-3">
                    {ing.productCount} product
                    {ing.productCount === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Progress / Results ─────────────────────── */}
      {(isRunning || status === "done") && (
        <div className="rounded-xl border bg-card shadow-sm">
          {/* Progress bar */}
          <div className="px-5 py-4 border-b space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {status === "done" ? "Complete" : "Processing…"}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {results.length} / {batch.length} ingredients
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${
                    batch.length > 0
                      ? (results.length / batch.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            {isRunning && currentIndex < batch.length && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Searching for{" "}
                <span className="font-medium text-foreground">
                  {batch[currentIndex]?.name}
                </span>
                …
              </p>
            )}
          </div>

          {/* Results log */}
          <div className="divide-y max-h-96 overflow-y-auto">
            {results.map((r) => (
              <div
                key={r.ingredientId}
                className="flex items-center justify-between px-5 py-2.5 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {r.error ? (
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                  <span className="truncate">{r.ingredientName}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {r.error ? (
                    <span className="text-xs tabular-nums text-destructive">
                      {r.error.length > 40
                        ? r.error.slice(0, 40) + "…"
                        : r.error}
                    </span>
                  ) : (
                    <>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {r.savedCount} saved
                      </span>
                      {r.existingCount > 0 && (
                        <span className="text-xs tabular-nums text-amber-500">
                          {r.existingCount} existed
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Currently processing row */}
            {isRunning && currentIndex < batch.length && results.length < batch.length && (
              <div className="flex items-center justify-between px-5 py-2.5 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  <span className="truncate text-muted-foreground">
                    {batch[currentIndex]?.name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-3">
                  searching…
                </span>
              </div>
            )}
          </div>

          {/* Summary footer */}
          {status === "done" && (
            <div className="px-5 py-4 border-t bg-muted/30 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span>
                  <span className="font-medium">{results.length}</span>{" "}
                  ingredient{results.length === 1 ? "" : "s"} processed
                </span>
                <span>
                  <span className="font-medium">{totalSaved}</span> product
                  {totalSaved === 1 ? "" : "s"} saved
                </span>
                {totalExisting > 0 && (
                  <span className="text-amber-500">
                    <span className="font-medium">{totalExisting}</span> already
                    existed
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="text-destructive">
                    <span className="font-medium">{errorCount}</span> error
                    {errorCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatus("idle");
                  setResults([]);
                  setCurrentIndex(0);
                  fetchIngredients();
                }}
              >
                <ArrowRight className="w-4 h-4 mr-1" />
                Run Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
