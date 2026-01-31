"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { ProductForm } from "@/src/domains/products/_components/product-form";
import { Retailer, Unit } from "@prisma/client";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/src/components/ui/button";

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

type ProductModalProps =
  | {
      mode: "create";
      product?: never;
      trigger?: React.ReactNode;
    }
  | {
      mode: "edit";
      product: ShopProduct;
      trigger?: React.ReactNode;
    };

export function ProductModal({ mode, product, trigger }: ProductModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const isCreate = mode === "create";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger != null ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant={isCreate ? "default" : "ghost"} size={isCreate ? "default" : "sm"}>
            {isCreate ? (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add product
              </>
            ) : (
              <Pencil className="w-4 h-4" />
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Add product" : "Edit product"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Add a shop product (e.g. Tesco, Morrisons)."
              : "Update product details."}
          </DialogDescription>
        </DialogHeader>
        {isCreate ? (
          <ProductForm
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        ) : (
          <ProductForm
            productId={product.id}
            initialRetailer={product.retailer}
            initialProductName={product.productName}
            initialUrl={product.url}
            initialPrice={product.price != null ? (product.price / 100).toFixed(2) : ""}
            initialSize={product.size}
            initialUnit={product.unit}
            initialImageUrl={product.imageUrl}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
