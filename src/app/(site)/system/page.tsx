import { DiscoverVideoManagement } from "@/src/system/discover/app/_components/discover-video-management";
import { RecipeWebsiteManagement } from "@/src/system/discover/app/_components/recipe-website-management";
import { Separator } from "@/src/components/ui/separator";

export default function SystemPage() {
    return (
        <div className="container mx-auto  px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">System Management</h1>
                <p className="text-muted-foreground">
                    Manage discover videos and recipe websites
                </p>
            </div>
            
            <div className="space-y-8">
                <DiscoverVideoManagement />
                
                <Separator />
                
                <RecipeWebsiteManagement />
            </div>
        </div>
    );
}