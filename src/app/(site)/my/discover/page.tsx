import { DiscoverShorts } from "./_components/discover.short";

export default function DiscoverPage() {
    return (
        <div className="container mx-auto py-6 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-center">Discover</h1>
            </div>
            <DiscoverShorts />
        </div>
    );
}
