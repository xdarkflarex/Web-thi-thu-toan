import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/custom/app-sidebar";
import { getSessionUserAndRole } from "@/lib/auth";
import "./globals.css";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getSessionUserAndRole();
  return (
    <html lang="vi">
      <head>{/* <link rel="stylesheet" href="/style.css" /> */}</head>
      <body>
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full">
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
