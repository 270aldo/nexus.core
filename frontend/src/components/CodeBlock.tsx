import React from "react";
import { CopyButton } from "./CopyButton";

interface Props {
  code: string;
  className?: string;
}

export function CodeBlock({ code, className = "" }: Props) {
  return (
    <div className={`relative group ${className}`}>
      <pre className="bg-neutral-900 text-neutral-100 p-3 rounded-md text-sm font-mono overflow-x-auto mb-3">
        <code>{code}</code>
      </pre>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton textToCopy={code} variant="ghost" size="sm" />
      </div>
    </div>
  );
}
