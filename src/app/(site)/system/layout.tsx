import Link from "next/link";

export default function SystemLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-row h-full pt-7">
            <div>
                <ul className="flex flex-col gap-2 px-4 mt-6 w-[180px] ">
                    <li>
                        <Link href="/system">Discover</Link>
                    </li>
                    <li>
                         <Link href="/system/products">Products</Link>
                    </li>
                </ul>
            </div>
            <div>
                {children}
            </div>
            
        </div>
    );
}