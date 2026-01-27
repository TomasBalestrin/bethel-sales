import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const adminNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/participantes", label: "Participantes", icon: Users },
  { href: "/closers", label: "Closers", icon: UserCog },
  { href: "/admin", label: "Painel Admin", icon: Settings },
];

const closerNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/participantes", label: "Participantes", icon: Users },
  { href: "/closers", label: "Closers", icon: UserCog },
];

export function Sidebar() {
  const location = useLocation();
  const { profile, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = isAdmin ? adminNavItems : closerNavItems;

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message,
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">B</span>
            </div>
            <span className="font-semibold text-sidebar-foreground">Bethel Events</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-2">
        {profile && (
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile.full_name}
                </p>
                <p className="text-xs text-muted-foreground truncate capitalize">
                  {profile.role || "Sem permissão"}
                </p>
              </div>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full mt-1 text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive",
            isCollapsed ? "justify-center px-0" : "justify-start"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
