import React, { useState, useEffect } from "react";
import { Sidebar } from "components/Sidebar";
import { Navbar } from "components/Navbar";
import { cn } from "utils/cn";

export interface Props {
  children: React.ReactNode;
  showNavbar?: boolean;
  title?: string;
  navbarActions?: React.ReactNode;
  variant?: "prime" | "longevity" | "neutral";
}

/**
 * Main layout component with neo-brutalist design elements
 * Includes responsive sidebar and optional navbar
 */
export function Layout({ 
  children, 
  showNavbar = true, 
  title, 
  navbarActions,
  variant = "neutral" 
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Close sidebar when pressing escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);
  
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [sidebarOpen]);
  
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar - fixed on desktop, sliding drawer on mobile */}
      <Sidebar 
        className={cn(
          "fixed inset-y-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )} 
      />
      
      {/* Mobile sidebar backdrop with fade in/out */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Optional navbar */}
        {showNavbar && (
          <Navbar 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            title={title}
            actions={navbarActions}
            variant={variant}
          />
        )}
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}