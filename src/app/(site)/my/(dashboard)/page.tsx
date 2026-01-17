import DashboardPageClient from "./_components/dashboard-page-client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function MyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/my/what");
  }

  return <DashboardPageClient />;
}
