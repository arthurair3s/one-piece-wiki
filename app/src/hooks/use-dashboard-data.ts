"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCookie, deleteCookie } from "@/lib/cookies";
import { fetchDashboardData } from "@/app/_service";
import { DASHBOARD_CONFIG } from "@/app/_configuration";
import { useSync } from "@/components/providers/sync-provider";
import type { Saga, Arc, Island } from "@/types/api";

export function useDashboardData() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [sagas, setSagas] = useState<Saga[]>([]);
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [islands, setIslands] = useState<Island[]>([]);

  const { isOutOfSync, resolveSync } = useSync();

  useEffect(() => {
    const token = getCookie("token");
    if (!token) {
      router.push(DASHBOARD_CONFIG.loginUrl);
      return;
    }

    const profile = getCookie("user_profile");
    setIsAdmin(profile === "ADMIN");

    const hasLoaded = sessionStorage.getItem("dashboard_loaded");
    if (hasLoaded !== "true") {
      router.push(DASHBOARD_CONFIG.loadingScreenUrl);
      return;
    }

    setIsNavigating(false);
  }, [router]);

  const handleLogout = useCallback(() => {
    deleteCookie("token");
    deleteCookie("user_profile");
    sessionStorage.removeItem("dashboard_loaded");
    router.push(DASHBOARD_CONFIG.loginUrl);
  }, [router]);

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    setError(null);
    const startTime = performance.now();

    try {
      const token = getCookie("token") || "";
      if (!token) {
        setIsLoadingData(false);
        return;
      }

      const result = await fetchDashboardData();

      setSagas(result.sagas);
      setArcs(result.arcs);
      setIslands(result.islands);

      const duration = (performance.now() - startTime).toFixed(1);
      console.log(`[Dashboard] Dados carregados em ${duration}ms diretamente do banco.`);
    } catch (err: any) {
      console.error("Erro ao buscar dados do banco:", err);
      if (err.message === "Unauthorized" || err.message?.includes("401")) {
        deleteCookie("token");
        deleteCookie("user_profile");
        sessionStorage.removeItem("dashboard_loaded");
        router.push(DASHBOARD_CONFIG.loginUrl);
        return;
      }
      setError(err.message || "Erro ao carregar dados do backend");
    } finally {
      setIsLoadingData(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isNavigating) {
      loadData();
    }
  }, [isNavigating, loadData]);

  useEffect(() => {
    if (isOutOfSync) {
      loadData().then(() => {
        resolveSync();
      });
    }
  }, [isOutOfSync, resolveSync, loadData]);

  return {
    isNavigating,
    isLoadingData,
    error,
    isAdmin,
    sagas,
    arcs,
    islands,
    loadData,
    handleLogout,
  };
}
