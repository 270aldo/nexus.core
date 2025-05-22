import React from "react";
import { cn } from "utils/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface Props {
  tabs: TabItem[];
  defaultTab?: string;
  variant?: "prime" | "longevity" | "neutral";
  className?: string;
  tabsClassName?: string;
  contentClassName?: string;
}

/**
 * Neo-brutalist styled tab panel component
 * Used for switching between different content sections
 */
export function TabPanel({ 
  tabs, 
  defaultTab, 
  variant = "neutral",
  className,
  tabsClassName,
  contentClassName 
}: Props) {
  // Variant styles
  const variantStyles = {
    prime: {
      active: "bg-indigo-600 text-white data-[state=active]:shadow-[0_0_10px_rgba(99,102,241,0.5)]",
      inactive: "text-slate-300 hover:text-indigo-400",
      border: "border-indigo-500/50"
    },
    longevity: {
      active: "bg-pink-600 text-white data-[state=active]:shadow-[0_0_10px_rgba(236,72,153,0.5)]",
      inactive: "text-slate-300 hover:text-pink-400",
      border: "border-pink-500/50"
    },
    neutral: {
      active: "bg-slate-700 text-white",
      inactive: "text-slate-400 hover:text-slate-100",
      border: "border-slate-700"
    }
  };
  
  return (
    <Tabs 
      defaultValue={defaultTab || tabs[0]?.id} 
      className={cn("w-full", className)}
    >
      <TabsList 
        className={cn(
          "w-full flex bg-slate-800/50 p-1 border-2",
          variantStyles[variant].border,
          tabsClassName
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            disabled={tab.disabled}
            className={cn(
              "flex-1 font-mono text-sm py-2",
              "data-[state=inactive]:", variantStyles[variant].inactive,
              "data-[state=active]:", variantStyles[variant].active,
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent 
          key={tab.id} 
          value={tab.id}
          className={cn(
            "mt-4",
            contentClassName
          )}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
