import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { 
  ChefHat, 
  UtensilsCrossed, 
  ShoppingCart, 
  Box, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { auth } from "@/auth";
import { getCurrentUser } from "@/src/domains/user/db";

export default async function Home() {
  const session = await auth();
  const user = session?.user?.id ? await getCurrentUser() : null;
  const isAuthenticated = !!user;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex items-start justify-center px-4 py-16 overflow-hidden">
        {/* Animated colorful background gradient - food themed colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/8 via-yellow-500/6 to-green-500/10 animate-gradient-rotate" />
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/8 via-orange-500/6 to-red-500/8 animate-gradient" />
        
        {/* Mesh gradient overlay for depth */}
        <div 
          className="absolute inset-0 opacity-30 animate-mesh-gradient"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(249, 115, 22, 0.3), transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(239, 68, 68, 0.3), transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(234, 179, 8, 0.2), transparent 50%),
              radial-gradient(circle at 60% 20%, rgba(34, 197, 94, 0.2), transparent 50%)
            `
          }}
        />
        
        {/* Subtle base layer */}
        <div className="absolute inset-0 bg-background/40" />
        
        {/* Floating colorful decorative elements - warm food colors */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-3xl animate-float animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-float animation-delay-300 animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-amber-400/15 to-orange-500/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-red-400/15 to-pink-500/15 rounded-full blur-3xl animate-float animation-delay-500" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary animate-fade-in-up animation-delay-100">
              <Sparkles className="w-4 h-4 animate-float" />
              <span>Recipes → Ingredients → Organized</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent animate-fade-in-up animation-delay-200 inline-block">
                Organize your kitchen
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-fade-in-up animation-delay-300 inline-block">
                declutter your life
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Forked.io helps you manage recipes, track ingredients, organize storage, 
              and create shopping lists—all in one beautiful platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up animation-delay-500">
              {isAuthenticated ? (
                <Button asChild size="lg" className="text-lg px-8 py-6 animate-scale-in animation-delay-600 group">
                  <Link href="/my/recipes">
                    Go to My Recipes
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-8 py-6 animate-scale-in animation-delay-600 group">
                    <Link href="/auth/signup">
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 animate-scale-in animation-delay-600">
                    <Link href="/auth/signin">
                      Sign In
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features that make recipe and ingredient management effortless
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 - Recipes */}
            <div className="group relative p-8 rounded-2xl border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <ChefHat className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Recipe Management</h3>
                <p className="text-muted-foreground">
                  Create and organize your favorite recipes. Add ingredients with quantities and build your personal cookbook.
                </p>
              </div>
            </div>

            {/* Feature 2 - Ingredients */}
            <div className="group relative p-8 rounded-2xl border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <UtensilsCrossed className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ingredient Library</h3>
                <p className="text-muted-foreground">
                  Build your ingredient database. Track everything you use in recipes and keep your pantry organized.
                </p>
              </div>
            </div>

            {/* Feature 3 - Storage */}
            <div className="group relative p-8 rounded-2xl border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Box className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Storage Tracking</h3>
                <p className="text-muted-foreground">
                  Organize your pantry, fridge, and freezer. Know exactly where everything is stored and what you have.
                </p>
              </div>
            </div>

            {/* Feature 4 - Shopping Lists */}
            <div className="group relative p-8 rounded-2xl border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Shopping Lists</h3>
                <p className="text-muted-foreground">
                  Create shopping lists with quantities and units. Never forget an ingredient again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="border-t py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="relative p-12 rounded-3xl border-2 bg-gradient-to-br from-primary/10 via-background to-primary/5 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.05),transparent_50%)]" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to declutter your kitchen?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join home cooks who are organizing their recipes and ingredients with Forked.io.
                </p>
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link href="/auth/signup">
                    Get Started for Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
