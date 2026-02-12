"use client";
import { DiscoverShortsStack } from "@/src/system/discover/user/_components/discover-shorts-stack"; 

export default function DiscoverPage() {
    return (
        <div className="container mx-auto py-6 px-4"> 
            
            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Videos</h2>
                        <DiscoverShortsStack />
                </section>    
            </div>
        </div>
    );
}
