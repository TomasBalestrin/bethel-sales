import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminRoute } from "@/components/layout/AdminRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Participants from "./pages/Participants";
import Closers from "./pages/Closers";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import AdminPanel from "./pages/AdminPanel";
import DiscForm from "./pages/DiscForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/disc/:token" element={<DiscForm />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/participantes" element={<Participants />} />
              <Route path="/closers" element={<Closers />} />
              <Route path="/vendas" element={<Sales />} />
              <Route
                path="/relatorios"
                element={
                  <AdminRoute>
                    <Reports />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
