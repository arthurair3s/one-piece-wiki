import React from "react";
import type { Island } from "@/types/api";

interface SearchSuggestionsProps {
  showSuggestions: boolean;
  islandSuggestions: Island[];
  onIslandSelect?: (id: string | null) => void;
  onSearchChange?: (val: string) => void;
  setShowSuggestions: (show: boolean) => void;
}

export function SearchSuggestions({
  showSuggestions,
  islandSuggestions,
  onIslandSelect,
  onSearchChange,
  setShowSuggestions,
}: SearchSuggestionsProps) {
  if (!showSuggestions || islandSuggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-lg border border-border bg-background/95 backdrop-blur-md shadow-xl z-50 p-1 flex flex-col">
      {islandSuggestions.map((island) => (
        <button
          key={island.id}
          onClick={() => {
            if (onIslandSelect) onIslandSelect(String(island.id));
            if (onSearchChange) onSearchChange("");
            setShowSuggestions(false);
          }}
          className="text-left px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer select-none font-medium text-foreground"
        >
          {island.name}
        </button>
      ))}
    </div>
  );
}
