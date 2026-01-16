import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { GoBackButton } from "@/src/components/custom/goBack";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 text-center">
      <div className="max-w-md w-full space-y-6 animate-fade-in-up">
        {/* 404 Number */}
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-primary/20 select-none">
            404
          </h1>
          <div className="h-1 w-24 mx-auto bg-primary/20 rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-lg">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
          <GoBackButton
            variant="outline"
            text="Go Back"
            className="w-full sm:w-auto h-10 px-6"
          />
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Quick links:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/my">My Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/my/ingredients">Ingredients</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/my/recipes">Recipes</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/my/shop">Shopping Lists</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
