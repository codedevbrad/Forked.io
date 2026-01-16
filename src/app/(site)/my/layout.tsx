import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function MyLayout({
  children,
}: {
  children: React.ReactNode;
}) {

    const session = await auth();
    if (!session) {
        redirect("/auth/signin");
    }
  return (
    <div className="h-full overflow-y-auto">
      {children}
    </div>
  );
}