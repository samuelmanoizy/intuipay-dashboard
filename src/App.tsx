import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { ThemeProvider } from "./components/ThemeProvider";
import Home from "./pages/Home";
import ContentDetail from "./pages/ContentDetail";
import Content from "./pages/Content";
import Analytics from "./pages/Analytics";
import Transactions from "./pages/Transactions";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="app-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/content/:id" element={<ContentDetail />} />
              <Route path="/content" element={<Content />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </DashboardLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;