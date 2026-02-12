"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  createProductAction,
  updateProductAction,
} from "@/src/domains/products/db";
import { useProducts } from "@/src/domains/products/_contexts/useProducts";
import { Retailer, Unit } from "@prisma/client";

type ProductFormProps = {
  productId?: string;
  initialRetailer?: Retailer;
  initialProductName?: string;
  initialUrl?: string | null;
  initialPrice?: string | null;
  initialSize?: number | null;
  initialUnit?: Unit | null;
  initialImageUrl?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const RETAILER_OPTIONS: { value: Retailer; label: string }[] = [
  { value: "TESCO", label: "Tesco" },
  { value: "MORRISONS", label: "Morrisons" },
  { value: "SAINSBURYS", label: "Sainsbury's" },
  { value: "ASDA", label: "Asda" },
];

const UNIT_NONE = "__none__" as const;

const UNIT_OPTIONS: { value: Unit; label: string }[] = [
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "ml", label: "ml" },
  { value: "l", label: "l" },
  { value: "tbsp", label: "tbsp" },
  { value: "tsp", label: "tsp" },
  { value: "piece", label: "piece" },
];

export function ProductForm({
  productId,
  initialRetailer = "TESCO",
  initialProductName = "",
  initialUrl = "",
  initialPrice = "",
  initialSize,
  initialUnit,
  initialImageUrl = "",
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const { mutate } = useProducts();
  const [retailer, setRetailer] = useState<Retailer>(initialRetailer);
  const [productName, setProductName] = useState(initialProductName);
  const [url, setUrl] = useState(initialUrl ?? "");
  const [price, setPrice] = useState(initialPrice ?? "");
  const [size, setSize] = useState(initialSize != null ? String(initialSize) : "");
  const [unit, setUnit] = useState<Unit | typeof UNIT_NONE>(initialUnit ?? UNIT_NONE);
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isEditing = !!productId;

  useEffect(() => {
    setRetailer(initialRetailer);
    setProductName(initialProductName);
    setUrl(initialUrl ?? "");
    setPrice(initialPrice ?? "");
    setSize(initialSize != null ? String(initialSize) : "");
    setUnit(initialUnit ?? UNIT_NONE);
    setImageUrl(initialImageUrl ?? "");
  }, [
    initialRetailer,
    initialProductName,
    initialUrl,
    initialPrice,
    initialSize,
    initialUnit,
    initialImageUrl,
    productId,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!productName.trim()) {
      setError("Product name is required");
      return;
    }

    const sizeNum =
      size !== "" && !Number.isNaN(Number(size)) ? Number(size) : null;

    startTransition(async () => {
      const result = isEditing
        ? await updateProductAction(
            productId,
            retailer,
            productName.trim(),
            url || null,
            price || null,
            sizeNum,
            unit === UNIT_NONE ? null : unit,
            imageUrl || null
          )
        : await createProductAction(
            retailer,
            productName.trim(),
            url || null,
            price || null,
            sizeNum,
            unit === UNIT_NONE ? null : unit,
            imageUrl || null
          );

      if (!result.success) {
        setError(result.error);
      } else {
        await mutate();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="productName" className="text-sm font-medium">
          Product name
        </label>
        <Input
          id="productName"
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
          disabled={isPending}
          placeholder="e.g. Finest Chicken Tikka Masala, Oranges 6 Pack"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="retailer" className="text-sm font-medium">
          Retailer
        </label>
        <Select
          value={retailer}
          onValueChange={(v) => setRetailer(v as Retailer)}
          disabled={isPending}
        >
          <SelectTrigger id="retailer">
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

      <div className="space-y-2">
        <label htmlFor="url" className="text-sm font-medium">
          URL (optional)
        </label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isPending}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="price" className="text-sm font-medium">
          Price (optional)
        </label>
        <Input
          id="price"
          type="text"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={isPending}
          placeholder="e.g. 3.50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="size" className="text-sm font-medium">
            Size (optional)
          </label>
          <Input
            id="size"
            type="number"
            min={0}
            step={1}
            value={size}
            onChange={(e) => setSize(e.target.value)}
            disabled={isPending}
            placeholder="e.g. 500"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="unit" className="text-sm font-medium">
            Unit (optional)
          </label>
          <Select
            value={unit}
            onValueChange={(v) => setUnit(v as Unit | typeof UNIT_NONE)}
            disabled={isPending}
          >
            <SelectTrigger id="unit">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNIT_NONE}>None</SelectItem>
              {UNIT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="imageUrl" className="text-sm font-medium">
          Image URL (optional)
        </label>
        <Input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          disabled={isPending}
          placeholder="https://..."
        />
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
              ? "Update product"
              : "Create product"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
