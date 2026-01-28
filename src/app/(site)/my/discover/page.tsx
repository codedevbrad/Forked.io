"use client";

import { DiscoverShorts } from "@/src/system/discover/user/_components/discover.short";
import { DiscoverWebsites } from "../../../../system/discover/user/_components/discover.website";

export default function DiscoverPage() {
    return (
        <div className="container mx-auto py-6 px-4"> 
            
            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Recipe Websites</h2>
                    <DiscoverWebsites />
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Surprise Me</h2>
                    <DiscoverShorts />
                </section>
            </div>
        </div>
    );
}
