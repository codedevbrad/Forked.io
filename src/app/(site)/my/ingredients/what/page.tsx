import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { 
  ChefHat, 
  Tag, 
  ShoppingCart, 
  Package, 
  Link2, 
  Search,
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  Refrigerator,
  Box
} from "lucide-react";

export default function WhatPage() {
  const features = [
    {
      icon: ChefHat,
      title: "Recipe Building Blocks",
      description: "Ingredients are the foundation of every recipe. Create and organize your ingredients to build amazing dishes.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Tag,
      title: "Smart Tagging System",
      description: "Organize ingredients with custom tags. Group by cuisine, dietary restrictions, or any category you need.",
      color: "from-blue-500 to-purple-500",
    },
    {
      icon: Refrigerator,
      title: "Storage Management",
      description: "Track where ingredients belong - pantry, fridge, or freezer. Never lose track of your food storage again.",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Link2,
      title: "Store Links",
      description: "Save direct links to where you buy ingredients online. Quick access to your favorite stores and products.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: ShoppingCart,
      title: "Shopping Lists",
      description: "Seamlessly add ingredients to shopping lists. Plan your grocery trips with ingredients you already know.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Search,
      title: "Powerful Filtering",
      description: "Find ingredients instantly with advanced filters. Search by name, type, storage location, or tags.",
      color: "from-indigo-500 to-violet-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-gradient-rotate" />
        <div className="container mx-auto max-w-6xl px-4 py-16 md:py-24 relative z-10">
          <div className="text-center space-y-6 animate-fade-in-up">
         
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Your Culinary
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                Building Blocks
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ingredients are the foundation of every great recipe. Organize, track, and manage your ingredients 
              with powerful tools designed for modern cooking.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" className="group">
                <Link href="/auth/signin">
                  Get Started
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/my/ingredients">
                  View Ingredients
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything You Need to Manage Ingredients
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features that make ingredient management effortless and enjoyable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="size-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-8 md:p-12 border shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary w-fit">
                <UtensilsCrossed className="size-4" />
                <span className="text-sm font-medium">Perfect For</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold">
                From Recipe Creation to Shopping
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 mt-1">
                    <Box className="size-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Recipe Development</h4>
                    <p className="text-muted-foreground text-sm">
                      Build your recipe library with consistent, reusable ingredients
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 mt-1">
                    <Package className="size-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Storage Tracking</h4>
                    <p className="text-muted-foreground text-sm">
                      Know exactly where each ingredient is stored in your kitchen
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 mt-1">
                    <ShoppingCart className="size-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Shopping Planning</h4>
                    <p className="text-muted-foreground text-sm">
                      Create smart shopping lists from your ingredient database
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center size-24 rounded-full bg-gradient-to-br from-primary to-primary/60 mx-auto animate-pulse-glow">
                    <ChefHat className="size-12 text-primary-foreground" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    Your Ingredients
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Organized • Tracked • Ready to Use
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="text-center space-y-6 p-12 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Organize Your Kitchen?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start managing your ingredients today and take your cooking to the next level
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="group">
              <Link href="/auth/signin">
                Sign In to Get Started
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signup">
                Create Account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}