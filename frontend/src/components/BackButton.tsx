import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "utils/cn";

interface Props {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  fallbackPath?: string;
  label?: string;
  size?: "default" | "sm" | "lg";
}

/**
 * Universal back button component for consistent navigation
 * Uses browser history by default or falls back to specified path
 */
export function BackButton({
  className = "",
  variant = "outline",
  fallbackPath = "/",
  label,
  size = "default"
}: Props) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // If no history exists, navigate to fallback path
      navigate(fallbackPath);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={cn("font-mono", className)}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label || "Back"}
    </Button>
  );
}
