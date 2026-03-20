"use client";

import { useState } from "react";
import { signup } from "@/api/linkfolioApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Signup page: includes new field for display name.
 */
export default function SignupPage() {
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | undefined>();
  const router = useRouter();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);
    setLoading(true);
    try {
      await signup(form);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl border border-[#ec5c33]/20 animate-fade-in">
        <h2 className="text-3xl font-bold mb-6 text-[#ec5c33] font-display">
          Create your LinkFolio account
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            type="text"
            name="displayName"
            required
            placeholder="Display Name"
            value={form.displayName}
            onChange={onChange}
            className="rounded-xl border-[#ec5c33]/30 bg-white/80 backdrop-blur-sm"
            maxLength={32}
          />
          <Input
            type="email"
            name="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            className="rounded-xl border-[#ec5c33]/30 bg-white/80 backdrop-blur-sm"
          />
          <Input
            type="text"
            name="username"
            required
            placeholder="Choose a username"
            value={form.username}
            onChange={onChange}
            className="rounded-xl border-[#ec5c33]/30 bg-white/80 backdrop-blur-sm"
          />
          <Input
            type="password"
            name="password"
            required
            minLength={6}
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={onChange}
            className="rounded-xl border-[#ec5c33]/30 bg-white/80 backdrop-blur-sm"
          />
          {err && <div className="text-destructive text-sm">{err}</div>}
          <Button
            className="w-full rounded-xl bg-[#ec5c33] hover:bg-[#d54a29] text-white"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : "Sign Up"}
          </Button>
        </form>
        <div className="text-center mt-6 text-sm text-[#504d46]">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-[#ec5c33] underline hover:text-[#d54a29]"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
