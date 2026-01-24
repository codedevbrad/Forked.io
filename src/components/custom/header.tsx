"use client"
import { useState } from "react"
import { useUser } from "@/src/domains/user/_contexts/useUser"
import { SignOutButton } from "@/src/domains/user/_components/sign-out-button"
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients"
import { useRecipes } from "@/src/domains/recipes/_contexts/useRecipes"
import { useShoppingLists } from "@/src/domains/shop/_contexts/useShoppingLists"
import { useStored } from "@/src/domains/stored/_contexts/useStored"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { CreateModal } from "./create-modal"
import { Plus } from "lucide-react"

export function Header() {
  const { data: user, isLoading } = useUser();
  const { data: ingredients } = useIngredients();
  const { data: recipes } = useRecipes();
  const { data: shoppingLists } = useShoppingLists();
  const { data: stored } = useStored();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const ingredientsCount = ingredients?.length ?? 0;
  const recipesCount = recipes?.length ?? 0;
  const shoppingListsCount = shoppingLists?.length ?? 0;
  const storedCount = stored?.length ?? 0;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-5 flex justify-center">
        <div className="container flex h-14 items-center">
          <div className=" flex">
            <Link href="/" className="flex">
              <h3 className="font-bold">
                 Foodforked.io
              </h3>
            </Link>   
          </div>
          <nav className="ml-5 flex flex-row gap-4">
            <ul className="flex flex-row gap-4 text-sm">
               <li> <Link href="/my/">Home</Link></li>
               <li> <Link href="/my/discover">Discover</Link></li>
               <li> 
                 <Link href="/my/ingredients" className="flex items-center gap-1.5">
                   Ingredients
                   <span className="text-xs text-muted-foreground">({ingredientsCount})</span>
                 </Link>
               </li>
               
               <li> 
                 <Link href="/my/recipes" className="flex items-center gap-1.5">
                   Recipes
                   <span className="text-xs text-muted-foreground">({recipesCount})</span>
                 </Link>
               </li>
               <li> 
                 <Link href="/my/shop" className="flex items-center gap-1.5">
                   Shopping Lists
                   <span className="text-xs text-muted-foreground">({shoppingListsCount})</span>
                 </Link>
               </li>
               <li> 
                 <Link href="/my/stored" className="flex items-center gap-1.5">
                   Stored
                   <span className="text-xs text-muted-foreground">({storedCount})</span>
                 </Link>
               </li>            
            </ul>
          </nav>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">
                  {/* skeeton placeholder */}
                  <div className="w-10 h-4 bg-muted rounded animate-pulse"></div>
                  <div className="w-10 h-4 bg-muted rounded animate-pulse"></div>
                  <div className="w-10 h-4 bg-muted rounded animate-pulse"></div>
                </div>
              ) : user ? (
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    onClick={() => setCreateModalOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <p className=" pr-1"> Create </p>
                  </Button>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Signed in as </span>
                    <span className="font-medium">{user.username}</span>
                  </div>
                  <SignOutButton />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" asChild>
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>
      <CreateModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </>
  );
}
