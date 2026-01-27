import { Outlet, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const { user, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated but has no role assigned yet
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Aguardando Aprovação</h1>
          <p className="text-muted-foreground">
            Sua conta foi criada com sucesso, mas ainda não possui permissões atribuídas.
            Entre em contato com o administrador para liberar seu acesso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
