"use client";

import { DiscoverShorts } from "@/src/system/discover/user/_components/discover.short"
import { DiscoverWebsites } from "../../../../system/discover/user/_components/discover.website"
import { Separator } from "@/src/components/ui/separator"

export default function DiscoverPage() {
    return (
        <div className="container mx-auto py-6 px-4"> 
            
            <div className="space-y-12">
                <section>
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-semibold mb-1">Great recipe websites to take inspiration from. </h2>
                        <p className="text-muted-foreground">
                            These websites are great sources of inspiration for your recipes. 
                            Go take a look and give the author some love and a follow
                        </p>
                    </div>
                    <Separator className="my-4"/>
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
