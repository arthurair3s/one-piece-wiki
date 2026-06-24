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
        className={`transition-all duration-300 bg-[#fbf9f4]/95 text-[#4f3f24] px-2 py-0.5 rounded text-xs border border-[#d2c29d] shadow-md mb-1 z-10 pointer-events-none block text-center font-bold
          ${selected 
            ? "opacity-100 border-[#4f3f24] scale-105" 
            : "opacity-80 group-hover:opacity-100"
          }`}
      >
        {name}
      </span>

      <div className="relative w-full h-3/5">
        <div
          className={`absolute inset-0 rounded-[50%] border-2 transition-all duration-300
            ${selected
              ? "bg-[#bca374] border-[#4f3f24] shadow-[0_0_20px_rgba(188,163,116,0.7)] animate-pulse"
              : highlighted
                ? "bg-[#d2c29d] border-dashed border-[#8c7a56] group-hover:bg-[#bca374] group-hover:border-[#4f3f24] group-hover:shadow-[0_0_12px_rgba(188,163,116,0.4)]"
                : "bg-[#e4dcce] border-dotted border-[#b4a995]"
            }`}
        />
      </div>

      <div
        className={`w-4/5 h-2/5 mx-auto rounded-[50%] -mt-2 transition-all duration-300 bg-black/15 shadow-[0_4px_8px_rgba(0,0,0,0.15)]`}
      />
    </div>
  );
}
