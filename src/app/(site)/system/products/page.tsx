"use client";

import { ProductsList } from "@/src/domains/products/_components/products-list";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Products</h1>
      <ProductsList />
    </div>
  );
}