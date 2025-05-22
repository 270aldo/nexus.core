import React from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
  textToCopy: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function CopyButton({ 
  textToCopy, 
  className = "",
  variant = "outline",
  size = "icon"
}: Props) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error al copiar:", error);
      toast.error("No se pudo copiar al portapapeles");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
    >
      {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
    </Button>
  );
}
