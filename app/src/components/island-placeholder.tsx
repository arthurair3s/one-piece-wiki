"use client";

import React from "react";

export interface IslandPlaceholderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  name?: string;
  style?: React.CSSProperties;
  highlighted?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function IslandPlaceholder({
  size = "md",
  className = "",
  name = "Ilha",
  style,
  highlighted = true,
  selected = false,
  onClick,
}: IslandPlaceholderProps) {
  const sizes = {
    sm: "w-48 h-24",
    md: "w-64 h-32",
    lg: "w-80 h-40",
  };

  return (
    <div
      style={style}
      onClick={onClick}
      className={`${sizes[size]} ${className} group cursor-pointer select-none`}
    >
      <span
        className={`transition-all duration-300 bg-background/95 text-foreground px-2 py-0.5 rounded text-xs border shadow-md mb-1 z-10 pointer-events-none block text-center
          ${selected 
            ? "opacity-100 border-primary text-primary font-bold scale-105" 
            : "opacity-0 group-hover:opacity-100 border-border"
          }`}
      >
        {name}
      </span>

      <div className="relative w-full h-3/5">
        <div
          className={`absolute inset-0 rounded-[50%] border-2 transition-all duration-300
            ${selected
              ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-pulse"
              : highlighted
                ? "bg-muted/50 border-dashed border-muted-foreground/30 group-hover:border-primary/50 group-hover:bg-primary/10"
                : "bg-muted/20 border-dotted border-muted-foreground/10"
            }`}
        />
      </div>

      <div
        className={`w-4/5 h-2/5 mx-auto rounded-[50%] -mt-2 transition-all duration-300
          ${selected
            ? "bg-primary/20"
            : highlighted
              ? "bg-muted/30 group-hover:bg-primary/5"
              : "bg-muted/10"
          }`}
      />
    </div>
  );
}
