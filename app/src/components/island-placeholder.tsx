"use client";

import React from "react";

export interface IslandPlaceholderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  name?: string;
  style?: React.CSSProperties;
}

export function IslandPlaceholder({
  size = "md",
  className = "",
  name = "Ilha",
  style,
}: IslandPlaceholderProps) {
  const sizes = {
    sm: "w-28 h-14",
    md: "w-40 h-20",
    lg: "w-52 h-26",
  };

  return (
    <div style={style} className={`${sizes[size]} ${className} group cursor-pointer`}>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/90 text-foreground px-2 py-0.5 rounded text-xs border border-border shadow-sm mb-1 z-10 pointer-events-none block text-center">
        {name}
      </span>
      {/* Ilha */}
      <div className="relative w-full h-3/5">
        <div className="absolute inset-0 bg-muted/50 rounded-[50%] border-2 border-dashed border-muted-foreground/20 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300" />
      </div>
      {/* Sombra / reflexo na água */}
      <div className="w-4/5 h-2/5 mx-auto bg-muted/30 rounded-[50%] -mt-2 group-hover:bg-primary/5 transition-all duration-300" />
    </div>
  );
}
