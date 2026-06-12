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
      // Garante que a tela de loading-screen execute ao redirecionar
      sessionStorage.removeItem("dashboard_loaded");
      router.push(LOGIN_CONFIG.redirectUrl);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao realizar o login. Verifique suas credenciais.");
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🏴‍☠️</div>
          <CardTitle className="text-2xl font-bold">Grand Line API</CardTitle>
          <CardDescription>
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
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="mt-4 pt-4 border-t border-muted/50 flex flex-col gap-2">
              <span className="text-xs text-muted-foreground text-center font-medium">
                Acesso Rápido (Dados das Seeds)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {LOGIN_CONFIG.demoUsers.map((user, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs py-1 h-auto"
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
