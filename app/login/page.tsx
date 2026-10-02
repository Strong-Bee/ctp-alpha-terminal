"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Chrome, Apple, Loader2 } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState("");

  async function login(provider: "google" | "apple") {
    setLoading(provider);
    setError("");
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch {
      setError("Login gagal. Silakan coba lagi.");
      setLoading(null);
    }
  }

  const authError = searchParams.get("error");
  const message = error || (authError ? "Autentikasi tidak berhasil. Periksa konfigurasi provider dan coba lagi." : "");

  return (
    <main className="grid min-h-screen place-items-center bg-[#05070b] px-6 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-sm text-slate-500 hover:text-cyan-300">← Kembali ke CTP Alpha</Link>
        <div className="rounded-3xl border border-white/10 bg-white/[.035] p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-xl font-black text-cyan-300">α</div>
            <h1 className="mt-5 text-2xl font-bold">Welcome to CTP Alpha</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in untuk mengakses Alpha Terminal.</p>
          </div>

          <div className="space-y-3">
            <button onClick={() => void login("google")} disabled={loading !== null} className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60">
              {loading === "google" ? <Loader2 size={18} className="animate-spin" /> : <Chrome size={18} />}
              Continue with Google
            </button>
            <button onClick={() => void login("apple")} disabled={loading !== null} className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60">
              {loading === "apple" ? <Loader2 size={18} className="animate-spin" /> : <Apple size={18} />}
              Continue with Apple
            </button>
          </div>

          {message && <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-xs leading-5 text-rose-300">{message}</p>}

          <div className="mt-7 border-t border-white/10 pt-5 text-center text-xs leading-5 text-slate-600">
            Dengan masuk, Anda akan diarahkan ke dashboard setelah provider berhasil memverifikasi akun.
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#05070b] text-white"><Loader2 className="animate-spin text-cyan-300" /></main>}><LoginContent /></Suspense>;
}
