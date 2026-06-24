"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Island } from "@/types/api";

interface UseMapViewportProps {
  activeIslandId: number | null;
  unlockedIslands: Island[];
  mapWidth: number;
  mapHeight: number;
}

export function useMapViewport({
  activeIslandId,
  unlockedIslands,
  mapWidth,
  mapHeight,
}: UseMapViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1.0);
  const [viewportSize, setViewportSize] = useState({ width: 1200, height: 800 });
  const [smoothTransition, setSmoothTransition] = useState(false);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragOffsetStart = useRef({ x: 0, y: 0 });

  const clampOffset = useCallback((x: number, y: number, vw: number, vh: number, currentScale: number) => {
    const effWidth = mapWidth * currentScale;
    const effHeight = mapHeight * currentScale;

    const minX = vw >= effWidth ? -(effWidth - vw) / 2 : -(effWidth - vw);
    const maxX = vw >= effWidth ? -(effWidth - vw) / 2 : 0;
    const minY = vh >= effHeight ? -(effHeight - vh) / 2 : -(effHeight - vh);
    const maxY = vh >= effHeight ? -(effHeight - vh) / 2 : 0;

    const finalX = vw >= effWidth ? (vw - effWidth) / 2 : Math.max(minX, Math.min(maxX, x));
    const finalY = vh >= effHeight ? (vh - effHeight) / 2 : Math.max(minY, Math.min(maxY, y));

    return { x: finalX, y: finalY };
  }, [mapWidth, mapHeight]);

  useEffect(() => {
    const handleResize = () => {
      if (viewportRef.current) {
        setViewportSize({
          width: viewportRef.current.clientWidth,
          height: viewportRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (viewportRef.current) {
      const vw = viewportRef.current.clientWidth;
      const vh = viewportRef.current.clientHeight;
      const centerOffset = clampOffset(
        -(mapWidth / 2 - vw / 2),
        -(mapHeight / 2 - vh / 2),
        vw,
        vh,
        1.0
      );
      setOffset(centerOffset);
    }
  }, [clampOffset, mapWidth, mapHeight]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      const zoomStep = 0.05;
      const direction = e.deltaY < 0 ? 1 : -1;
      
      setScale((prev) => {
        const next = Math.max(0.7, Math.min(1.3, prev + direction * zoomStep));
        return parseFloat(next.toFixed(2));
      });
    };

    viewport.addEventListener("wheel", handleWheelEvent, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", handleWheelEvent);
    };
  }, []);

  useEffect(() => {
    if (!viewportRef.current) return;
    const vw = viewportRef.current.clientWidth;
    const vh = viewportRef.current.clientHeight;
    setOffset((prev) => clampOffset(prev.x, prev.y, vw, vh, scale));
  }, [scale, clampOffset]);

  useEffect(() => {
    if (!activeIslandId || unlockedIslands.length === 0 || !viewportRef.current) return;

    const island = unlockedIslands.find((i) => i.id === activeIslandId);
    if (!island) return;

    const xPct = island.coordinates?.x ?? island.coordinate_x ?? 50;
    const yPct = island.coordinates?.y ?? island.coordinate_y ?? 50;

    const islandPxX = (xPct / 100) * mapWidth;
    const islandPxY = (yPct / 100) * mapHeight;

    const vw = viewportRef.current.clientWidth;
    const vh = viewportRef.current.clientHeight;

    const targetX = -(islandPxX * scale - vw / 2);
    const targetY = -(islandPxY * scale - vh / 2);

    const centeredOffset = clampOffset(targetX, targetY, vw, vh, scale);

    setSmoothTransition(true);
    setOffset(centeredOffset);

    const timer = setTimeout(() => {
      setSmoothTransition(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [activeIslandId, unlockedIslands, clampOffset, scale, mapWidth, mapHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, select, [role=\"combobox\"], a")) {
      return;
    }
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragOffsetStart.current = { ...offset };
    setSmoothTransition(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !viewportRef.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    const vw = viewportRef.current.clientWidth;
    const vh = viewportRef.current.clientHeight;

    const newOffset = clampOffset(
      dragOffsetStart.current.x + dx,
      dragOffsetStart.current.y + dy,
      vw,
      vh,
      scale
    );
    setOffset(newOffset);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button, input, select, [role=\"combobox\"], a")) {
      return;
    }
    if (e.touches.length === 1) {
      isDragging.current = true;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      dragOffsetStart.current = { ...offset };
      setSmoothTransition(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !viewportRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;

    const vw = viewportRef.current.clientWidth;
    const vh = viewportRef.current.clientHeight;

    const newOffset = clampOffset(
      dragOffsetStart.current.x + dx,
      dragOffsetStart.current.y + dy,
      vw,
      vh,
      scale
    );
    setOffset(newOffset);
  };

  const handleMinimapNavigation = useCallback((mapX: number, mapY: number) => {
    if (!viewportRef.current) return;
    const vw = viewportRef.current.clientWidth;
    const vh = viewportRef.current.clientHeight;

    const targetX = -(mapX * scale - vw / 2);
    const targetY = -(mapY * scale - vh / 2);

    const newOffset = clampOffset(targetX, targetY, vw, vh, scale);

    setSmoothTransition(true);
    setOffset(newOffset);

    const timer = setTimeout(() => {
      setSmoothTransition(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [clampOffset, scale]);

  return {
    viewportRef,
    offset,
    scale,
    setScale,
    viewportSize,
    smoothTransition,
    isDragging: isDragging.current,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleMinimapNavigation,
  };
}
