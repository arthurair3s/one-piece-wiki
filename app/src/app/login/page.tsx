"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { loginUser } from "./_service";
import { LOGIN_CONFIG } from "./_configuration";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    if (!email) {
      setErrorMsg(LOGIN_CONFIG.validationRules.email.required);
      return;
    }
    if (!LOGIN_CONFIG.validationRules.email.pattern.test(email)) {
      setErrorMsg(LOGIN_CONFIG.validationRules.email.errorMessage);
      return;
    }
    if (!password) {
      setErrorMsg(LOGIN_CONFIG.validationRules.password.required);
      return;
    }
    if (password.length < LOGIN_CONFIG.validationRules.password.minLength) {
      setErrorMsg(LOGIN_CONFIG.validationRules.password.errorMessage);
      return;
    }

    setIsLoading(true);
    try {
      await loginUser(email, password);
      // garante que a tela de loading-screen execute ao redirecionar
      sessionStorage.removeItem("dashboard_loaded");
      router.push(LOGIN_CONFIG.redirectUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao realizar o login. Verifique suas credenciais.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleQuickLogin = (demoUser: typeof LOGIN_CONFIG.demoUsers[number]) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setErrorMsg("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black relative overflow-hidden">
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />
      {/* Soft Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

      <Card className="w-full max-w-sm bg-card/75 border border-border/40 backdrop-blur-md shadow-2xl rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="text-4xl mb-2 animate-bounce duration-1000">🏴‍☠️</div>
          <CardTitle className="text-2xl font-bold tracking-tight">Grand Line API</CardTitle>
          <CardDescription className="text-xs text-muted-foreground/80">
            Entre com suas credenciais para acessar o painel.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="text-sm text-red-500 font-medium bg-red-500/10 p-2 rounded text-center border border-red-500/20">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@admin.com"
                autoComplete="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/10 border-border/40 focus-visible:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/10 border-border/40 focus-visible:ring-primary"
              />
            </div>

            <Button type="submit" className="w-full mt-2 transition-all duration-300 hover:opacity-90 active:scale-[0.98]" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="mt-4 pt-4 border-t border-muted/50 flex flex-col gap-2">
              <span className="text-[10px] text-muted-foreground text-center font-bold tracking-wide uppercase">
                Acesso Rápido (Dados das Seeds)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {LOGIN_CONFIG.demoUsers.map((user, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] py-1.5 h-auto bg-background/40 hover:bg-muted/50 border-border/40 transition-colors"
                    onClick={() => handleQuickLogin(user)}
                    disabled={isLoading}
                  >
                    {user.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground mt-2">
              Não tem conta?{" "}
              <Link
                href="/register"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Criar conta
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
