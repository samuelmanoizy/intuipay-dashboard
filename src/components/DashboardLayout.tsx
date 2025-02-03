import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { AuthButton } from "./AuthButton";
import { ModeToggle } from "./ModeToggle";
import { supabase } from "@/integrations/supabase/client";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (!session && location.pathname !== "/auth") {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session && location.pathname !== "/auth") {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  if (!isAuthenticated && location.pathname === "/auth") {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {isAuthenticated && <DashboardSidebar />}
        <div className="flex-1">
          {isAuthenticated && (
            <header className="p-4 border-b flex justify-end items-center gap-4">
              <ModeToggle />
              <AuthButton />
            </header>
          )}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}