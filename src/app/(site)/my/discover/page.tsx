"use client";

import { DiscoverShorts } from "../../../../system/discover/user/_components/discover.short";
import { DiscoverWebsites } from "../../../../system/discover/user/_components/discover.website";

export default function DiscoverPage() {
    return (
        <div className="container mx-auto py-6 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-center">Discover</h1>
            </div>
            
            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Recipe Websites</h2>
                    <DiscoverWebsites />
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Videos</h2>
                    <DiscoverShorts />
                </section>
                
             
            </div>
        </div>
    );
}
