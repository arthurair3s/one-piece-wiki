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
import { registerUser } from "./_service";
import { REGISTER_CONFIG } from "./_configuration";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!username || username.length < REGISTER_CONFIG.validationRules.name.minLength) {
      setErrorMsg(REGISTER_CONFIG.validationRules.name.errorMessage);
      return;
    }
    if (!email) {
      setErrorMsg(REGISTER_CONFIG.validationRules.email.required);
      return;
    }
    if (!REGISTER_CONFIG.validationRules.email.pattern.test(email)) {
      setErrorMsg(REGISTER_CONFIG.validationRules.email.errorMessage);
      return;
    }
    if (!password || password.length < REGISTER_CONFIG.validationRules.password.minLength) {
      setErrorMsg(REGISTER_CONFIG.validationRules.password.errorMessage);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(REGISTER_CONFIG.validationRules.confirmPassword.matchMessage);
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(username, email, password);
      setSuccessMsg("Conta criada com sucesso! Redirecionando para o login...");
      setTimeout(() => {
        router.push(REGISTER_CONFIG.redirectUrl);
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao realizar o cadastro. Tente novamente.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black relative overflow-hidden">
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />
      {/* Soft Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

      <Card className="w-full max-w-sm bg-card/75 border border-border/40 backdrop-blur-md shadow-2xl rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="text-4xl mb-2 animate-bounce duration-1000">🏴‍☠️</div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Registro
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground/80">
            Crie sua conta para acessar o Grand Line.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="text-sm text-red-500 font-medium bg-red-500/10 p-2 rounded text-center border border-red-500/20">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="text-sm text-green-500 font-medium bg-green-500/10 p-2 rounded text-center border border-green-500/20">
                {successMsg}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="mugiwara"
                autoComplete="username"
                disabled={isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-muted/10 border-border/40 focus-visible:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="luffy@grandline.com"
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
                autoComplete="new-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/10 border-border/40 focus-visible:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-muted/10 border-border/40 focus-visible:ring-primary"
              />
            </div>

            <Button type="submit" className="w-full mt-2 transition-all duration-300 hover:opacity-90 active:scale-[0.98]" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar"}
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-2">
              Já possui conta?{" "}
              <Link
                href="/login"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Entrar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
