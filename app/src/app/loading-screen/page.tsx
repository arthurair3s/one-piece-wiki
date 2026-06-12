"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Frases temáticas de One Piece ──
const quotes = [
  "O mar está cheio de mistérios esperando para serem descobertos...",
  "A aventura está apenas começando, navegador.",
  "Cada ilha guarda uma história que precisa ser contada.",
  "Os ventos do Grand Line sopram para quem tem coragem.",
  "Nenhum sonho é grande demais para quem navega com determinação.",
  "O One Piece existe! E nós vamos encontrá-lo!",
  "O mapa do mundo ainda tem muitos espaços em branco...",
  "Zarpar é fácil. O difícil é manter o curso.",
  "As estrelas guiam quem sabe olhar para o céu.",
  "Todo grande pirata começou em uma pequena ilha.",
  "A liberdade está além do horizonte.",
  "Prepare-se para navegar pela Grand Line...",
];

// ── Componente de nuvem SVG ──
function Cloud({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 200 100"
      className={className}
      style={style}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M170 70c0-16.6-13.4-30-30-30-3.2 0-6.3.5-9.2 1.4C124.4 27.8 111.4 18 96 18c-12.2 0-23 6.5-29 16.2C62.8 31.5 58 30 53 30c-16.6 0-30 13.4-30 30 0 1 .1 2 .2 3H170c.1-1 .2-2 .2-3z" />
    </svg>
  );
}

// ── Tempo total da animação (ms) ──
const LOADING_DURATION = 4000;
const QUOTE_INTERVAL = 2500;

export default function LoadingScreenPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fadeQuote, setFadeQuote] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // Seleciona frases aleatórias sem repetição sequencial
  const getNextQuoteIndex = useCallback(() => {
    let next: number;
    do {
      next = Math.floor(Math.random() * quotes.length);
    } while (next === quoteIndex && quotes.length > 1);
    return next;
  }, [quoteIndex]);

  // ── Progresso da barra ──
  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / LOADING_DURATION) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        // Fade out antes de redirecionar
        setTimeout(() => setFadeOut(true), 300);
        setTimeout(() => {
          sessionStorage.setItem("dashboard_loaded", "true"); // Grava a flag que rompe o loop
          router.push("/");
        }, 1000);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [router]);

  // ── Rotação de frases ──
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeQuote(false);
      setTimeout(() => {
        setQuoteIndex(getNextQuoteIndex());
        setFadeQuote(true);
      }, 400);
    }, QUOTE_INTERVAL);

    return () => clearInterval(interval);
  }, [getNextQuoteIndex]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* ── Nuvens decorativas (background) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Cloud
          className="absolute text-muted/40 w-64 animate-pulse"
          style={{ top: "8%", left: "5%", animationDuration: "4s" }}
        />
        <Cloud
          className="absolute text-muted/30 w-48 animate-pulse"
          style={{ top: "15%", right: "10%", animationDuration: "5s", animationDelay: "1s" }}
        />
        <Cloud
          className="absolute text-muted/25 w-72 animate-pulse"
          style={{ top: "40%", left: "15%", animationDuration: "6s", animationDelay: "0.5s" }}
        />
        <Cloud
          className="absolute text-muted/35 w-56 animate-pulse"
          style={{ top: "55%", right: "5%", animationDuration: "4.5s", animationDelay: "1.5s" }}
        />
        <Cloud
          className="absolute text-muted/20 w-40 animate-pulse"
          style={{ top: "75%", left: "30%", animationDuration: "5.5s", animationDelay: "2s" }}
        />
        <Cloud
          className="absolute text-muted/30 w-60 animate-pulse"
          style={{ top: "25%", left: "50%", animationDuration: "7s", animationDelay: "0.8s" }}
        />
      </div>

      {/* ── Conteúdo central: frase ── */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-8 max-w-2xl text-center">
        <p
          className={`text-xl md:text-2xl lg:text-3xl font-semibold leading-relaxed text-foreground transition-opacity duration-400 ${
            fadeQuote ? "opacity-100" : "opacity-0"
          }`}
        >
          &ldquo;{quotes[quoteIndex]}&rdquo;
        </p>
      </div>

      {/* ── Barra de carregamento (rodapé) ── */}
      <div className="relative z-10 w-full px-8 pb-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-medium">
              Carregando...
            </span>
            <span className="text-sm text-muted-foreground font-mono">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
