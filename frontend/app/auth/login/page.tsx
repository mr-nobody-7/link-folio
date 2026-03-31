'use client'

import { useState } from "react";
import { login } from "@/api/linkfolioApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|undefined>();
  const router = useRouter();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);
    setLoading(true);
    try {
      await login(form);
      router.push("/dashboard");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] px-4 py-10">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white shadow-xl border border-[#ec5c33]/20 animate-fade-in">
        <p className="text-sm text-[#888888] mb-2">Welcome back</p>
        <h2 className="text-3xl font-bold mb-6 text-[#ec5c33] font-display">Log in to LinkFolio</h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            type="email"
            name="email"
            required
            autoFocus
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            className="rounded-xl border-[#ec5c33]/30 bg-white/80 backdrop-blur-sm"
          />
          <Input
            type="password"
            name="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            className="rounded-xl border-[#ec5c33]/30 bg-white/80 backdrop-blur-sm"
          />
          {err && <div className="text-sm text-[#504d46] bg-[#ec5c33]/10 border border-[#ec5c33]/25 rounded-lg px-3 py-2">{err}</div>}
          <Button className="w-full rounded-xl bg-[#ec5c33] hover:bg-[#d54a29] text-white" disabled={loading}>
            {loading ? <LoadingSpinner /> : "Log In"}
          </Button>
        </form>
        <div className="text-center mt-6 text-sm text-[#504d46]">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-[#ec5c33] underline hover:text-[#d54a29]">Sign up</Link>
        </div>
      </div>
    </div>
  );
}