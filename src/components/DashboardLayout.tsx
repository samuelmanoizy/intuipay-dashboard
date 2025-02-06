
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { AuthButton } from "./AuthButton";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const menuItems = [
    { label: "My Content", path: "/content" },
    { label: "Analytics", path: "/analytics" },
    { label: "Transactions", path: "/transactions" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <header className="p-4 border-b flex justify-end">
            <div className="fixed top-4 left-4 md:hidden z-50">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {menuItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <AuthButton />
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
