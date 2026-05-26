"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { SpinnerSm } from "@/components/Loader";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      login(data.user, data.accessToken, data.refreshToken);
      toast.success("Logged in successfully!");
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { error?: string } } }).response?.data?.error || "Login failed"
          : "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-16">
      <AnimateOnScroll type="slideUp" duration={600}>
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-[#333] text-center mb-8">Sign In</h1>
          <div className="bg-white border border-[#ebebeb] rounded-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c96] transition-all duration-200 focus:shadow-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c96] transition-all duration-200 focus:shadow-md"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c96] text-white py-2.5 rounded-sm text-sm font-medium hover:bg-[#c96]/90 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? <span className="flex items-center justify-center gap-2"><SpinnerSm /> Signing in...</span> : "Sign In"}
              </button>
            </form>
            <p className="text-sm text-center mt-6 text-[#999]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#c96] hover:underline transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </AnimateOnScroll>
    </div>
  );
}
