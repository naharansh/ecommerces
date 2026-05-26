"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { SpinnerSm } from "@/components/Loader";

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { isAuthenticated, user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      router.replace("/admin");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      if (data.user.role !== "admin") {
        toast.error("Access denied. Admin credentials required.");
        setLoading(false);
        return;
      }
      login(data.user, data.accessToken, data.refreshToken);
      toast.success("Welcome back, Admin!");
    } catch {
      toast.error("Invalid email or password.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-white rounded-xl shadow-lg border border-[#e8e8e8] p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#c96] flex items-center justify-center">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#222]">Admin Login</h1>
              <p className="text-xs text-[#888]">ShopWave Administration</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shopwave.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#ddd] text-sm focus:outline-none focus:border-[#c96] focus:ring-1 focus:ring-[#c96]/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[#ddd] text-sm focus:outline-none focus:border-[#c96] focus:ring-1 focus:ring-[#c96]/30 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#555]">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#c96] text-white text-sm font-semibold hover:bg-[#b8852e] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <SpinnerSm />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-[#999] mt-6">
            <a href="/login" className="text-[#c96] hover:underline">Back to customer login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
