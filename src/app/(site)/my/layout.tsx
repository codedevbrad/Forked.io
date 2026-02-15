import { auth } from "@/auth"; 
import { BreadcrumbView } from "@/src/components/custom/breadcrumb-view";
import { RecommendChatDrawer } from "./recipes/_components/recommend-chat-drawer";

export default async function MyLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await auth();
 
  return (
    <>
      {session && <BreadcrumbView />}
      {children}
      {session && <RecommendChatDrawer />}
    </>
  );
}