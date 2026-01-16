import Link from "next/link";

export function TopBar() {
  return (
    <div className="w-full bg-muted/50 border-b text-sm py-1.5 px-5 flex justify-center">
      <div className="container flex items-center justify-center">
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
