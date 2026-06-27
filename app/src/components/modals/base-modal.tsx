"use client";

import React from "react";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  headerCustom?: React.ReactNode;   // cabeçalho customizado
  showBackButton?: boolean;
  onBack?: () => void;
  leftAddon?: React.ReactNode;      // componente adicional à esquerda (ex: visualizador 3d)
  leftAddonOutside?: boolean;      // indica se o componente à esquerda é exibido fora do card
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  headerCustom,
  showBackButton = false,
  onBack,
  leftAddon,
  leftAddonOutside = true,         // exibido fora (à esquerda) por padrão
  children,
  footer,
}: BaseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-[2px] transition-all duration-300 animate-[fadeIn_0.2s_ease-out]">
      {/* alinha o componente esquerdo externo e o card principal */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-stretch md:items-center justify-center gap-6 relative">
        
        {/* componente esquerdo externo */}
        {leftAddon && leftAddonOutside && (
          <div className="w-full md:w-[35%] shrink-0 h-[280px] md:h-[60vh] flex flex-col justify-end">
            {leftAddon}
          </div>
        )}

        {/* card principal do modal */}
        <div className="flex-1 bg-card text-card-foreground border-2 border-border rounded-[2rem] shadow-xl p-6 md:p-10 flex flex-col justify-between min-h-[450px] md:h-[60vh] relative overflow-hidden">
          
          {/* botão de fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-6 text-muted-foreground hover:text-foreground transition-colors text-lg font-bold p-1 cursor-pointer focus:outline-none z-20"
            aria-label="Fechar"
          >
            ✕
          </button>

          {/* componente esquerdo interno */}
          {leftAddon && !leftAddonOutside && (
            <div className="w-full md:w-[35%] shrink-0 mb-4 md:mb-0 md:mr-6">
              {leftAddon}
            </div>
          )}

          {/* conteúdo principal */}
          <div className="flex-1 flex flex-col min-h-0">
            {(title || showBackButton || headerCustom) && (
              <header className="flex items-center justify-between gap-4 mb-4 select-none">
                {showBackButton && onBack ? (
                  <button
                    onClick={onBack}
                    className="border border-border hover:border-primary hover:text-primary rounded-lg w-8 h-8 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors bg-background shrink-0"
                    title="Voltar"
                  >
                    ←
                  </button>
                ) : (
                  <div className="w-8 h-8 pointer-events-none shrink-0" />
                )}

                {headerCustom ? (
                  <div className="flex-1 flex justify-center">
                    {headerCustom}
                  </div>
                ) : title ? (
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground text-center flex-1">
                    {title}
                  </h2>
                ) : (
                  <div className="flex-1" />
                )}

                <div className="w-8 h-8 pointer-events-none shrink-0" />
              </header>
            )}

            <div className="flex-1 overflow-y-auto pr-1 min-h-0">
              {children}
            </div>
          </div>

          {/* Rodapé do Modal */}
          {footer && (
            <footer className="mt-4 shrink-0">
              {footer}
            </footer>
          )}

        </div>
      </div>
    </div>
  );
}
