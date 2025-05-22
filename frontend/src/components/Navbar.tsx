import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Search, Sun, Moon, User } from "lucide-react";
import { cn } from "utils/cn";
import { Breadcrumbs } from "components/Breadcrumbs";
import { useAuth } from "utils/auth-context";
import { useTheme } from "utils/use-theme";
import { NotificationIndicator } from "components/NotificationIndicator";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export interface Props {
  onToggleSidebar: () => void;
  title?: string;
  actions?: React.ReactNode;
  className?: string;
  variant?: "prime" | "longevity" | "neutral";
}

/**
 * Navigation bar component with mobile menu toggle,
 * breadcrumbs, and action buttons
 */
export function Navbar({ 
  onToggleSidebar, 
  title, 
  actions, 
  className = "",
  variant = "neutral"
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Determine if we're on a Prime or Longevity page
  const isPrimePage = location.pathname.includes("/prime") || 
    location.pathname.includes("/training") || 
    (title?.toLowerCase()?.includes("prime"));
  
  const isLongevityPage = location.pathname.includes("/longevity") || 
    location.pathname.includes("/nutrition") || 
    (title?.toLowerCase()?.includes("longevity"));
  
  // Set the variant based on the current page if not explicitly provided
  const effectiveVariant = variant === "neutral" ?
    (isPrimePage ? "prime" : (isLongevityPage ? "longevity" : "neutral")) :
    variant;
  
  // Accent colors for the navbar
  const accentStyles = {
    prime: "border-indigo-500",
    longevity: "border-pink-500",
    neutral: "border-border"
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };
  
  return (
    <div className={cn(
      "h-16 border-b-2 bg-background flex flex-col sticky top-0 z-10 shadow-none",
      accentStyles[effectiveVariant],
      className
    )}>
      {/* Main Navbar Content */}
      <div className="flex-1 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="md:hidden border hover:bg-accent bg-background shadow-none"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Logo for small screens (shown when sidebar is hidden) */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center font-mono text-sm font-bold text-primary-foreground">
              NGX
            </div>
            <div className="font-mono font-bold tracking-tighter text-sm">NEXUSCORE</div>
          </div>
          
          {title && (
            <h1 className="font-mono font-bold tracking-tighter text-lg hidden md:block truncate max-w-[150px] lg:max-w-[300px]">{title}</h1>
          )}
          
          {/* Quick actions */}
          <div className="hidden md:flex items-center ml-6 gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => navigate('/clients')}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Indicador de notificaciones */}
            <NotificationIndicator userId={user?.id || "user1"} />
            
            {/* Theme toggle button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {actions}
          
          {/* Theme toggle button (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-accent md:hidden"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {/* User profile dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="border hover:bg-accent bg-background shadow-none rounded-full ml-2"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border bg-background shadow-md rounded-sm">
                <DropdownMenuLabel className="font-mono text-xs">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="font-mono cursor-pointer"
                  onClick={() => navigate('/settings')}
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="font-mono cursor-pointer"
                  onClick={() => navigate('/Notifications')}
                >
                  Notificaciones
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="font-mono cursor-pointer"
                  onClick={() => navigate('/mcp-status')}
                >
                  Estado MCP
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="font-mono text-red-500 hover:text-red-400 cursor-pointer"
                  onClick={handleSignOut}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Breadcrumbs */}
      <div className="px-4 py-0">
        <Breadcrumbs variant={effectiveVariant} />
      </div>
    </div>
  );
}