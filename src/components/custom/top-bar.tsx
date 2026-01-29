import { Settings } from "lucide-react";
import Link from "next/link";

export function TopBar() {
  return (
    <div className="w-full bg-muted/50 border-b text-sm py-1.5 px-5 flex justify-center">
      <div className="container flex items-center justify-center">

          <Link href="/system" className="font-medium text-foreground hover:underline flex items-center gap-1 mr-5">
             System <Settings className="w-4 h-4" />
          </Link>

          <span className="text-muted-foreground">
              Built for fun by{" "}
              <Link
                href="https://github.com/codedevbrad"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                brad lumber 🍕🔥
              </Link>
          </span> 
      </div>
    </div>
  );
}
