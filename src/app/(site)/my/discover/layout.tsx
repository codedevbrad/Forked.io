import Link from "next/link"
import { Separator } from "@/src/components/ui/separator"

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-row gap-4 w-full h-full">
            <div className="w-[200px] p-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold mb-2">Discover</h1>
                    <p className="text-muted-foreground">
                        Discover new recipes, videos, and websites
                    </p>
                    <Separator />
                    <ul>
                        <li>
                            <Link href="/my/discover">All</Link>
                        </li>
                        <li>
                            <Link href="/my/discover/picks">Picks</Link>
                        </li>
                    </ul>
                    <Separator />
                </div>
            </div>
            <div className="w-3/4">
                {children}
            </div>
        </div>
    );
}