import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home, ChevronRight } from "lucide-react";
import { cn } from "utils/cn";

export interface Props {
  className?: string;
  variant?: "prime" | "longevity" | "neutral";
}

interface BreadcrumbMapping {
  [key: string]: {
    label: string;
    parent?: string;
  };
}

/**
 * Neo-brutalist styled breadcrumbs navigation component
 * Shows the current location in the application hierarchy
 */
export function Breadcrumbs({ className, variant = "neutral" }: Props) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  
  // Map of routes to their display names and parent routes
  const routeMapping: BreadcrumbMapping = {
    "dashboard": { label: "Dashboard" },
    
    // PRIME routes
    "prime": { label: "PRIME" },
    "prime-clients": { label: "Clients", parent: "prime" },
    "prime-training-programs": { label: "Training Programs", parent: "prime" },
    "prime-nutrition-plans": { label: "Nutrition Plans", parent: "prime" },
    "prime-progress": { label: "Progress", parent: "prime" },
    "prime-analytics": { label: "Analytics", parent: "prime" },
    
    // LONGEVITY routes
    "longevity": { label: "LONGEVITY" },
    "longevity-clients": { label: "Clients", parent: "longevity" },
    "longevity-training-programs": { label: "Training Programs", parent: "longevity" },
    "longevity-nutrition-plans": { label: "Nutrition Plans", parent: "longevity" },
    "longevity-progress": { label: "Progress", parent: "longevity" },
    "longevity-analytics": { label: "Analytics", parent: "longevity" },
    
    // Original routes (for backward compatibility)
    "clients": { label: "Clients" },
    "client-detail": { label: "Client Details", parent: "clients" },
    "add-client": { label: "Add Client", parent: "clients" },
    "edit-client": { label: "Edit Client", parent: "clients" },
    "training-programs": { label: "Training Programs" },
    "create-training-program": { label: "Create Program", parent: "training-programs" },
    "nutrition-plans": { label: "Nutrition Plans" },
    "progress": { label: "Progress" },
    "mcp-status": { label: "MCP Status" },
    "database-setup": { label: "Database Setup" },
    "settings": { label: "Settings" },
  };
  
  // Don't show breadcrumbs on the home page
  if (pathnames.length === 0 || location.pathname === "/") {
    return null;
  }
  
  // Variant styles
  const variantStyles = {
    prime: "text-indigo-500 hover:text-indigo-400",
    longevity: "text-pink-500 hover:text-pink-400",
    neutral: "text-slate-400 hover:text-slate-300"
  };

  // Check if we need to add a parent breadcrumb
  const breadcrumbItems = [];
  let currentPath = "";
  
  // Always start with Home
  breadcrumbItems.push({
    path: "/",
    label: "Home",
    icon: <Home className="h-3.5 w-3.5" />
  });
  
  // Determine if we're in a program section to set the variant
  let effectiveVariant = variant;
  if (variant === "neutral") {
    if (pathnames[0] === "prime" || pathnames.some(p => p.startsWith("prime-"))) {
      effectiveVariant = "prime";
    } else if (pathnames[0] === "longevity" || pathnames.some(p => p.startsWith("longevity-"))) {
      effectiveVariant = "longevity";
    }
  }
  
  // Add intermediate paths
  for (let i = 0; i < pathnames.length; i++) {
    currentPath += `/${pathnames[i]}`;
    
    // Check if the current path segment is part of a program type
    const isPrime = pathnames[i] === "prime" || pathnames[i].startsWith("prime-");
    const isLongevity = pathnames[i] === "longevity" || pathnames[i].startsWith("longevity-");
    
    // For program-specific routes, we need special handling
    const pathKey = 
      isPrime ? (pathnames[i] === "prime" ? "prime" : `prime-${pathnames[i].replace('prime/', '')}`)
      : isLongevity ? (pathnames[i] === "longevity" ? "longevity" : `longevity-${pathnames[i].replace('longevity/', '')}`)
      : pathnames[i];
    
    // Check if this path has a parent that needs to be inserted
    const current = routeMapping[pathKey];
    if (current && current.parent && i === pathnames.length - 1) {
      const parentPath = `/${current.parent}`;
      const parentLabel = routeMapping[current.parent]?.label || current.parent;
      
      breadcrumbItems.push({
        path: parentPath,
        label: parentLabel
      });
    }
    
    const label = current?.label || pathnames[i];
    breadcrumbItems.push({
      path: currentPath,
      label: label
    });
  }
  
  return (
    <Breadcrumb className={cn("font-mono text-xs", className)}>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <React.Fragment key={item.path}>
              <BreadcrumbItem>
                {!isLast ? (
                  <BreadcrumbLink 
                    asChild 
                    className={cn(
                      "flex items-center", 
                      variantStyles[effectiveVariant]
                    )}
                  >
                    <Link to={item.path}>
                      {item.icon ? (
                        <span className="flex items-center gap-1">
                          {item.icon}
                        </span>
                      ) : item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-bold">{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              
              {!isLast && <BreadcrumbSeparator>
                <ChevronRight className="h-3 w-3" />
              </BreadcrumbSeparator>}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}