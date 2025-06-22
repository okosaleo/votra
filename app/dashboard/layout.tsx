import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "../components/ThemeProvider";
import Navbar from "../components/dashNav";
import { AppSidebar } from "../components/sideBar";


export default async function DashLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <>
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
        <SidebarProvider>
          <AppSidebar />
        <main className="w-full">
          <div className="flex items-center flex-row justify-between p-1.5 w-full border-b-[1px] border-b-outline-day">
          <SidebarTrigger />
          <Navbar />
          </div>
        {children}
      </main>
        </SidebarProvider>
        </ThemeProvider>
        </>
    )
  }