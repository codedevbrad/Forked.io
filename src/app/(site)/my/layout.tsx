import { auth } from "@/auth"; 
import { BreadcrumbView } from "@/src/components/custom/breadcrumb-view";

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
    </>
  );
}