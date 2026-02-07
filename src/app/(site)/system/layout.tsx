import Link from "next/link";
import { prisma } from "@/src/lib/db";

async function getSidebarCounts() {
    const [discoverVideos, recipeWebsites, products, ingredients] =
        await Promise.all([
            prisma.discoverVideo.count(),
            prisma.recipeWebsites.count(),
            prisma.shopProduct.count(),
            prisma.shopIngredient.count(),
        ]);

    return {
        discover: discoverVideos + recipeWebsites,
        products,
        ingredients,
    };
}

export default async function SystemLayout({ children }: { children: React.ReactNode }) {
    const counts = await getSidebarCounts();

    return (
        <div className="flex flex-row h-full pt-7">
            <div>
                <ul className="flex flex-col gap-2 px-4 mt-6 w-[180px]">
                    <li>
                        <Link href="/system" className="flex items-center justify-between">
                            Discover
                            <span className="text-xs text-muted-foreground tabular-nums">{counts.discover}</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/system/products" className="flex items-center justify-between">
                            Products
                            <span className="text-xs text-muted-foreground tabular-nums">{counts.products}</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/system/ingredients" className="flex items-center justify-between">
                            Ingredients
                            <span className="text-xs text-muted-foreground tabular-nums">{counts.ingredients}</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/system/jobs">Jobs</Link>
                    </li>
                </ul>
            </div>
            <div className="flex-1 px-5 py-6">
                {children}
            </div>
            
        </div>
    );
}