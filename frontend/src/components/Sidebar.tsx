import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../utils/auth-context";
import { cn } from "../utils/cn";
import { 
  CalendarDays, LineChart, Users, Dumbbell, 
  ScrollText, Bot, MessageSquare, BarChart,
  Home, UserPlus, Settings, Database, Activity,
  Brain, PieChart, Apple, History, AppWindow
} from "lucide-react";

export interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  variant?: "prime" | "longevity" | "neutral" | "danger";
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  variant?: "prime" | "longevity" | "neutral";
  items: NavItem[];
}

export interface Props {
  className?: string;
}

/**
 * Neo-brutalist styled sidebar navigation component
 * with glowing active indicators and structured sections
 */
export function Sidebar({ className = "" }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Determine current active path
  const currentPath = location.pathname;
  
  // Navigation structure
  const navSections: NavSection[] = [
    {
      title: "Overview",
      items: [
        {
          title: "Home",
          icon: Home,
          href: "/",
        },
        {
          title: "Dashboard",
          icon: BarChart,
          href: "/dashboard",
        },
      ],
    },
    {
      title: "PRIME",
      variant: "prime",
      items: [
        {
          title: "Clients",
          icon: Users,
          href: "/clients?type=PRIME",
          variant: "prime",
        },
        {
          title: "Training Programs",
          icon: Dumbbell,
          href: "/training-programs?type=PRIME",
          variant: "prime",
        },
        {
          title: "Visual Program Editor",
          icon: AppWindow,
          href: "/program-editor",
          variant: "prime",
        },
        {
          title: "Nutrition Plans",
          icon: Apple,
          href: "/nutrition-plans?type=PRIME",
          variant: "prime",
        },
        {
          title: "Progress",
          icon: Activity,
          href: "/progress?type=PRIME",
          variant: "prime",
        },
        {
          title: "Dashboard",
          icon: LineChart,
          href: "/dashboard?type=PRIME",
          variant: "prime",
        },
      ],
    },
    {
      title: "LONGEVITY",
      variant: "longevity",
      items: [
        {
          title: "Clients",
          icon: Users,
          href: "/clients?type=LONGEVITY",
          variant: "longevity",
        },
        {
          title: "Training Programs",
          icon: Dumbbell,
          href: "/training-programs?type=LONGEVITY",
          variant: "longevity",
        },
        {
          title: "Visual Program Editor",
          icon: AppWindow,
          href: "/program-editor?type=LONGEVITY",
          variant: "longevity",
        },
        {
          title: "Nutrition Plans",
          icon: Apple,
          href: "/nutrition-plans?type=LONGEVITY",
          variant: "longevity",
        },
        {
          title: "Progress",
          icon: Activity,
          href: "/progress?type=LONGEVITY",
          variant: "longevity",
        },
        {
          title: "Dashboard",
          icon: LineChart,
          href: "/dashboard?type=LONGEVITY",
          variant: "longevity",
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          title: "Clients",
          icon: Users,
          href: "/clients",
        },
        {
          title: "Settings",
          icon: Settings,
          href: "/database-setup",
        },
        {
          title: "AI Assistant",
          icon: Bot,
          href: "/coach-assistant",
        },
        {
          title: "Activity Logs",
          icon: History,
          href: "/activity-logs",
        },
        {
          title: "Message Templates",
          icon: MessageSquare,
          href: "/message-templates",
        },
        {
          title: "Claude MCP",
          icon: Brain,
          href: "/mcp-status",
        },
        {
          title: "Database Setup",
          icon: Database,
          href: "/database-setup",
        },
      ],
    },
  ];

  // Check if a path is active (exact match or starts with for nested routes)
  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  // Get variant-specific classes for nav items
  const getNavItemClasses = (item: NavItem, isItemActive: boolean) => {
    const variant = item.variant || "neutral";
    
    const baseClasses = "w-full justify-start font-mono text-sm border-l-2";
    
    const variantClasses = {
      prime: {
        active: "border-indigo-500 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20",
        inactive: "border-transparent hover:border-indigo-500/50 text-muted-foreground hover:text-indigo-500 hover:bg-accent/50"
      },
      longevity: {
        active: "border-pink-500 bg-pink-500/10 text-pink-500 hover:bg-pink-500/20",
        inactive: "border-transparent hover:border-pink-500/50 text-muted-foreground hover:text-pink-500 hover:bg-accent/50"
      },
      neutral: {
        active: "border-foreground bg-accent/50 text-foreground hover:bg-accent/70",
        inactive: "border-transparent hover:border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
      },
      danger: {
        active: "border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20",
        inactive: "border-transparent hover:border-red-500 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
      }
    };
    
    return cn(
      baseClasses,
      isItemActive 
        ? variantClasses[variant].active 
        : variantClasses[variant].inactive
    );
  };

  return (
    <div className={cn("w-full md:w-64 bg-card border-r border-border flex flex-col", className)}>
      <div className="p-4 border-b border-border flex items-center gap-2">
        <div className="w-8 h-8 rounded-none bg-indigo-600 flex items-center justify-center font-mono text-lg font-bold text-primary-foreground shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          NGX
        </div>
        <div className="font-mono font-bold tracking-tighter text-lg">NEXUSCORE</div>
      </div>
      
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-4">
          {navSections.map((section) => (
            <div key={section.title}>
              <h3 className={cn(
                "mb-2 text-xs font-mono uppercase tracking-wider font-bold",
                section.variant === "prime" ? "text-indigo-400" : 
                section.variant === "longevity" ? "text-pink-400" : 
                "text-slate-400"
              )}>
                {section.title}
              </h3>
              
              <div className="space-y-1">
                {section.items.map((item) => {
                  const itemActive = isActive(item.href);
                  const Icon = item.icon;
                  
                  return (
                    <Button 
                      key={item.title}
                      variant="ghost" 
                      className={getNavItemClasses(item, itemActive)}
                      onClick={() => navigate(item.href)}
                    >
                      <Icon className={cn(
                        "mr-2 h-4 w-4",
                        itemActive && "animate-pulse"
                      )} />
                      {item.title}
                    </Button>
                  );
                })}
              </div>
              
              <Separator className="border-border my-3" />
            </div>
          ))}
          
          {/* Design System Link */}
          <div>
            <h3 className="mb-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Development
            </h3>
            <Button
              variant="ghost"
              className="w-full justify-start font-mono text-sm border-l-2 border-transparent hover:border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
              onClick={() => navigate('/design-system')}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                ></path>
              </svg>
              Sistema de Diseño
            </Button>
          </div>

          {/* Add Client Quick Action */}
          <div>
            <h3 className="mb-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Quick Actions
            </h3>
            <Button 
              className="w-full justify-start font-mono text-sm bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
              onClick={() => navigate("/add-client")}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Client
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}