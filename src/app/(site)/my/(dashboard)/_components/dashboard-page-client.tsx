"use client";
  
import { useUser } from "@/src/domains/user/_contexts/useUser";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { useRecipes } from "@/src/domains/recipes/_contexts/useRecipes";
import { useStored } from "@/src/domains/stored/_contexts/useStored";
import { useShoppingLists } from "@/src/domains/shop/_contexts/useShoppingLists";
import { TagManagement } from "@/src/domains/tags/_components/tag-management";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Package, ChefHat, ShoppingCart, Box, Tag } from "lucide-react";

export default function DashboardPageClient() { 
  const { data: user, isLoading: userLoading } = useUser();
  const { data: ingredients, isLoading: ingredientsLoading } = useIngredients();
  const { data: recipes, isLoading: recipesLoading } = useRecipes();
  const { data: stored, isLoading: storedLoading } = useStored();
  const { data: shoppingLists, isLoading: shoppingListsLoading } = useShoppingLists();

  const isLoading = userLoading || ingredientsLoading || recipesLoading || storedLoading || shoppingListsLoading;

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your ingredients, recipes, storage locations, and shopping lists.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-6 border rounded-lg space-y-4">
                <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-6 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {/* Ingredients Card */}
            <DashboardCard
              title="Ingredients"
              count={ingredients?.length || 0}
              icon={<Package className="w-6 h-6" />}
              href="/my/ingredients"
              color="blue"
            />

            {/* Recipes Card */}
            <DashboardCard
              title="Recipes"
              count={recipes?.length || 0}
              icon={<ChefHat className="w-6 h-6" />}
              href="/my/recipes"
              color="blue"
            />

            {/* Shopping Lists Card */}
            <DashboardCard
              title="Shopping Lists"
              count={shoppingLists?.length || 0}
              icon={<ShoppingCart className="w-6 h-6" />}
              href="/my/shop"
              color="orange"
            />

            {/* Stored Card */}
            <DashboardCard
              title="Storage Locations"
              count={stored?.length || 0}
              icon={<Box className="w-6 h-6" />}
              href="/my/stored"
              color="orange"
            />

       
          </div>
        )}

        {/* Recent Items Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Ingredients */}
          <SectionCard
            title="Recent Ingredients"
            items={ingredients?.slice(0, 5) || []}
            isLoading={ingredientsLoading}
            href="/my/ingredients"
            renderItem={(item) => item.name}
          />

          {/* Recent Recipes */}
          <SectionCard
            title="Recent Recipes"
            items={recipes?.slice(0, 5) || []}
            isLoading={recipesLoading}
            href="/my/recipes"
            renderItem={(item) => item.name}
          />

          {/* Recent Shopping Lists */}
          <SectionCard
            title="Recent Shopping Lists"
            items={shoppingLists?.slice(0, 5) || []}
            isLoading={shoppingListsLoading}
            href="/my/shop"
            renderItem={(item) => item.name}
          />

          {/* Recent Storage Locations */}
          <SectionCard
            title="Recent Storage Locations"
            items={stored?.slice(0, 5) || []}
            isLoading={storedLoading}
            href="/my/stored"
            renderItem={(item) => `${item.name} (${item.type})`}
          />
        </div>

        {/* Tag Management Section */}
        <div className="p-6 border rounded-lg">
          <TagManagement />
        </div>
      </div>
    </div>
  );
}

type DashboardCardProps = {
  title: string;
  count: number;
  icon: React.ReactNode;
  href: string;
  color: "blue" | "green" | "orange" | "purple";
};

function DashboardCard({ title, count, icon, href, color }: DashboardCardProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800",
    green: "bg-green-500/10 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800",
    orange: "bg-orange-500/10 text-orange-600 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-800",
    purple: "bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-800",
  };

  return (
    <Link href={href}>
      <div className={`p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${colorClasses[color]}`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
          <p className="text-3xl font-bold">{count}</p>
        </div>
      </div>
    </Link>
  );
}

type SectionCardProps<T> = {
  title: string;
  items: T[];
  isLoading: boolean;
  href: string;
  renderItem: (item: T) => React.ReactNode;
};

function SectionCard<T extends { id: string }>({
  title,
  items,
  isLoading,
  href,
  renderItem,
}: SectionCardProps<T>) {
  return (
    <div className="p-6 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href={href}>
            View All
          </Link>
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items yet</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="text-sm">
              <Link
                href={href}
                className="hover:text-primary transition-colors inline-flex items-center"
              >
                {renderItem(item)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
