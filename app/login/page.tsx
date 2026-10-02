"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");if(!email||!password){setError("Email dan password wajib diisi.");return;}router.push("/dashboard");}
  return <main className="grid min-h-screen place-items-center bg-[#05070b] px-6 text-white"><div className="w-full max-w-md">
    <Link href="/" className="mb-8 block text-center text-sm text-slate-500 hover:text-cyan-300">← Kembali ke CTP Alpha</Link>
    <div className="rounded-3xl border border-white/10 bg-white/[.035] p-8 shadow-2xl">
      <div className="mb-8 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-xl font-black text-cyan-300">α</div><h1 className="mt-5 text-2xl font-bold">Welcome back</h1><p className="mt-2 text-sm text-slate-500">Masuk ke CTP Alpha Terminal</p></div>
      <form onSubmit={submit} className="space-y-5">
        <label className="block text-sm text-slate-400">Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-400/50"/></label>
        <label className="block text-sm text-slate-400">Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-400/50"/></label>
        {error&&<p className="text-sm text-rose-400">{error}</p>}<button className="w-full rounded-xl bg-cyan-300 py-3 font-bold text-slate-950">Sign in</button>
      </form><p className="mt-6 text-center text-xs text-slate-600">Auth backend siap dihubungkan ke Express API.</p>
    </div></div></main>;
}