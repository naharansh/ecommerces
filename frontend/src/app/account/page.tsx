"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Package, Heart, MapPin, LogOut } from "lucide-react";
import AnimateOnScroll, { StaggerChildren } from "@/components/AnimateOnScroll";
import { userAPI, orderAPI, authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, setUser } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user) {
      setProfileForm({ name: user.name || "", phone: user.phone || "" });
    }
    loadOrders();
  }, [isAuthenticated, user, router]);

  const loadOrders = async () => {
    try {
      const { data } = await orderAPI.getAll({ limit: "10" });
      setOrders(data?.orders || data?.data || []);
    } catch {
      setOrders([]);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    }
    logout();
    toast.success("Logged out");
    router.push("/");
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await userAPI.updateProfile(profileForm);
      setUser(data?.user || data);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (!isAuthenticated || !user) return null;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
  ];

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-[#333] mb-8">My Account</h1>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <AnimateOnScroll type="slideLeft" duration={500}>
        <div className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-sm transition-colors shrink-0 ${
                  activeTab === tab.id
                    ? "bg-[#c96] text-white"
                    : "text-[#666] hover:bg-[#f4f4f4]"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#666] hover:bg-[#f4f4f4] rounded-sm transition-colors shrink-0"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
        </AnimateOnScroll>

        {/* Content */}
        <AnimateOnScroll type="slideRight" duration={500} className="md:col-span-3">
          {activeTab === "dashboard" && (
            <div className="bg-white border border-[#ebebeb] rounded-sm p-6">
              <h2 className="text-lg font-bold text-[#333] mb-4">Dashboard</h2>
              <p className="text-sm text-[#666] mb-6">
                Welcome back, <strong className="text-[#333]">{user.name}</strong>!
              </p>
              <form onSubmit={updateProfile} className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm text-[#333] mb-1">Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c96]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#333] mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm bg-[#f9f9f9] text-[#999] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#333] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c96]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#c96] text-white px-6 py-2.5 rounded-sm text-sm font-medium hover:bg-[#c96]/90 transition-colors"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white border border-[#ebebeb] rounded-sm p-6">
              <h2 className="text-lg font-bold text-[#333] mb-4">My Orders</h2>
              {orders.length === 0 ? (
                <p className="text-sm text-[#999]">No orders yet.</p>
              ) : (
                <StaggerChildren staggerDelay={80} duration={300} className="space-y-3">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="block border border-[#ebebeb] rounded-sm p-4 hover:border-[#c96] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-[#333]">{order.order_number}</p>
                          <p className="text-xs text-[#999]">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#c96]">${Number(order.total_amount).toFixed(2)}</p>
                          <span className="text-xs px-2 py-0.5 rounded-sm bg-[#f0f0f0] text-[#666] capitalize">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </StaggerChildren>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="bg-white border border-[#ebebeb] rounded-sm p-6">
              <h2 className="text-lg font-bold text-[#333] mb-4">My Addresses</h2>
              <p className="text-sm text-[#999] mb-4">Manage your shipping addresses.</p>
              <button className="bg-[#c96] text-white px-6 py-2.5 rounded-sm text-sm font-medium hover:bg-[#c96]/90 transition-all duration-300 hover:scale-105 active:scale-95">
                Add New Address
              </button>
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="bg-white border border-[#ebebeb] rounded-sm p-6">
              <h2 className="text-lg font-bold text-[#333] mb-4">My Wishlist</h2>
              <Link
                href="/wishlist"
                className="bg-[#c96] text-white px-6 py-2.5 rounded-sm text-sm font-medium inline-block hover:bg-[#c96]/90 transition-colors"
              >
                View Wishlist
              </Link>
            </div>
          )}
        </AnimateOnScroll>
      </div>
    </div>
  );
}
