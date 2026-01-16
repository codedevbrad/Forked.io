"use client";

import { usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BreadcrumbNav, type BreadcrumbItem } from "@/src/components/ui/breadcrumb";
import { getStoredLocationAction } from "@/src/domains/stored/db";
import { GoBackButton } from "./goBack";

/**
 * BreadcrumbView component that automatically detects the current route
 * and builds breadcrumbs based on the page hierarchy.
 * 
 * Supports routes:
 * - / - Home page
 * - /my - My Dashboard
 * - /my/ingredients - Ingredients
 * - /my/recipes - Recipes
 * - /my/shop - Shopping Lists
 * - /my/stored - Stored Locations
 * - /my/stored/[id] - Individual Storage Location
 * - /auth/signin - Sign In
 * - /auth/signup - Sign Up
 */
export function BreadcrumbView() {
  const pathname = usePathname();
  const params = useParams();
  const [dynamicName, setDynamicName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchDynamicData() {
      // Check if we're on a dynamic route that needs data fetching
      const pathParts = pathname.split("/").filter(Boolean);
      
      // Handle /my/stored/[id] route
      if (pathParts[0] === "my" && pathParts[1] === "stored" && params?.id) {
        setIsLoading(true);
        try {
          const stored = await getStoredLocationAction(params.id as string);
          if (stored?.name) {
            setDynamicName(stored.name);
          }
        } catch (error) {
          console.error("Error fetching stored location:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setDynamicName(null);
      }
    }

    fetchDynamicData();
  }, [pathname, params]);

  // Build breadcrumb items based on the current route
  const breadcrumbItems: BreadcrumbItem[] = [];
  const pathParts = pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on the home page
  if (pathname === "/") {
    return null;
  }

  // Always start with Home
  breadcrumbItems.push({
    label: "Home",
    href: "/",
  });

  // Handle /my routes
  if (pathParts[0] === "my") {
    breadcrumbItems.push({
      label: "My Dashboard",
      href: pathname === "/my" ? undefined : "/my",
    });

    // Handle /my/ingredients
    if (pathParts[1] === "ingredients") {
      breadcrumbItems.push({
        label: "Ingredients",
      });
    }
    // Handle /my/recipes
    else if (pathParts[1] === "recipes") {
      breadcrumbItems.push({
        label: "Recipes",
      });
    }
    // Handle /my/shop
    else if (pathParts[1] === "shop") {
      breadcrumbItems.push({
        label: "Shopping Lists",
      });
    }
    // Handle /my/stored
    else if (pathParts[1] === "stored") {
      if (pathParts[2]) {
        // Dynamic route: /my/stored/[id]
        breadcrumbItems.push({
          label: "Stored",
          href: "/my/stored",
        });
        if (isLoading) {
          breadcrumbItems.push({
            label: "Loading...",
          });
        } else if (dynamicName) {
          breadcrumbItems.push({
            label: dynamicName,
          });
        }
      } else {
        // Static route: /my/stored
        breadcrumbItems.push({
          label: "Stored",
        });
      }
    }
  }
  // Handle /auth routes
  else if (pathParts[0] === "auth") {
    if (pathParts[1] === "signin") {
      breadcrumbItems.push({
        label: "Sign In",
      });
    } else if (pathParts[1] === "signup") {
      breadcrumbItems.push({
        label: "Sign Up",
      });
    }
  }

  // Don't show breadcrumbs if we only have Home (shouldn't happen, but just in case)
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-row gap-4 items-center mb-4">
      <GoBackButton variant="ghost" text="Back" />
      <BreadcrumbNav items={breadcrumbItems} />
    </div>
  );
}
