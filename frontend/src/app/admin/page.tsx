"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Package, ShoppingCart, DollarSign, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AnimateOnScroll, { StaggerChildren } from "@/components/AnimateOnScroll";
import { PageLoader } from "@/components/Loader";
import { adminAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface DashboardStats {
  total_users?: number;
  total_products?: number;
  total_orders?: number;
  total_revenue?: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const { isAuthenticated: auth, user: u } = useAuthStore.getState();
    if (!auth) {
      router.replace("/login");
      return;
    }
    if (u && u.role !== "admin") {
      router.replace("/");
      return;
    }
    loadDashboard();
  }, [mounted, isAuthenticated, user, router]);

  const loadDashboard = async () => {
    try {
      const { data } = await adminAPI.getDashboard();
      setStats(data?.stats || data);
      setRecentOrders(data?.recent_orders || []);
    } catch {
      // API may not be available
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isAuthenticated) return null;
  if (!user) return <PageLoader text="Verifying access..." />;
  if (user.role !== "admin") return null;
  if (loading) return <PageLoader text="Loading dashboard..." />;

  const statusData = [
    { name: "Pending", count: recentOrders.filter((o) => (o as Record<string, string>).status === "pending").length, fill: "#f59e0b" },
    { name: "Processing", count: recentOrders.filter((o) => (o as Record<string, string>).status === "processing").length, fill: "#3b82f6" },
    { name: "Shipped", count: recentOrders.filter((o) => (o as Record<string, string>).status === "shipped").length, fill: "#8b5cf6" },
    { name: "Delivered", count: recentOrders.filter((o) => (o as Record<string, string>).status === "delivered").length, fill: "#10b981" },
    { name: "Cancelled", count: recentOrders.filter((o) => (o as Record<string, string>).status === "cancelled").length, fill: "#ef4444" },
  ];

  const topOrders = [...recentOrders]
    .sort((a, b) => Number((b as Record<string, unknown>).total_amount || 0) - Number((a as Record<string, unknown>).total_amount || 0))
    .slice(0, 5);
  const revenueData = topOrders.map((o, i) => ({
    name: ((o as Record<string, unknown>).order_number as string) || `#${i + 1}`,
    amount: Number((o as Record<string, unknown>).total_amount || 0),
  })).reverse();

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#222]">Dashboard</h1>
        <p className="text-[#888] mt-1">Overview of your store performance</p>
      </div>

      <StaggerChildren staggerDelay={80} duration={350} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Total Users", value: stats?.total_users ?? "-", icon: Users, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
          { label: "Total Products", value: stats?.total_products ?? "-", icon: Package, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
          { label: "Total Orders", value: stats?.total_orders ?? "-", icon: ShoppingCart, color: "bg-violet-50 text-violet-600", border: "border-violet-100" },
          { label: "Total Revenue", value: stats?.total_revenue ? `$${Number(stats.total_revenue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "-", icon: DollarSign, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
        ].map((card) => (
          <div key={card.label} className={`rounded-xl p-5 ${card.color} border ${card.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <card.icon size={24} strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-extrabold tracking-tight">{card.value}</p>
            <p className="text-xs mt-1 font-semibold opacity-70">{card.label}</p>
          </div>
        ))}
      </StaggerChildren>

  <div className="h-6 md:h-8" />

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 items-stretch">
   
   {/* Orders by Status */}
   <AnimateOnScroll type="fadeIn" duration={500}>
    <div className="bg-white border border-[#e8e8e8] rounded-2xl p-4 md:p-6 hover:shadow-md transition-all duration-300 h-full w-full min-w-0">
       <h2 className="text-base font-bold text-[#222] mb-4 md:mb-5">
         Orders by Status
       </h2>

       <div className="w-full" style={{ height: "55vh", maxHeight: "300px", minHeight: "200px" }}>
       <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
         <BarChart
           data={statusData}
           barCategoryGap={0}
           barGap={6}
           margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
         >
           <CartesianGrid
             strokeDasharray="3 3"
             stroke="#f0f0f0"
             vertical={false}
           />

           <XAxis
             dataKey="name"
             tick={{ fontSize: 12, fill: "#888" }}
             axisLine={false}
             tickLine={false}
           />

           <YAxis
             tick={{ fontSize: 12, fill: "#888" }}
             axisLine={false}
             tickLine={false}
             allowDecimals={false}
             width={25}
           />

           <Tooltip
             cursor={{ fill: "#f5f5f5" }}
             contentStyle={{ borderRadius: 8, border: "1px solid #e8e8e8", fontSize: 13, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
             labelStyle={{ fontWeight: 600, marginBottom: 2 }}
           />

           <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
             {statusData.map((entry, idx) => (
               <Cell key={idx} fill={entry.fill} />
             ))}
           </Bar>
         </BarChart>
       </ResponsiveContainer>
       </div>

       {/* Legend */}
       <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-[#f0f0f0]">
         {statusData.map((entry) => (
           <div key={entry.name} className="flex items-center gap-1.5 text-xs text-[#666]">
             <span className="w-2.5 h-2.5 rounded-[2px] shrink-0" style={{ backgroundColor: entry.fill }} />
             {entry.name}
           </div>
         ))}
       </div>
     </div>
   </AnimateOnScroll>

   {/* Top Orders by Value */}
   <AnimateOnScroll type="fadeIn" duration={500}>
    <div className="bg-white border border-[#e8e8e8] rounded-2xl p-4 md:p-6 hover:shadow-md transition-all duration-300 h-full w-full min-w-0">
       <h2 className="text-base font-bold text-[#222] mb-4 md:mb-5">
         Top Orders by Value
       </h2>

       <div className="w-full" style={{ height: "55vh", maxHeight: "300px", minHeight: "200px" }}>
       <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <BarChart
          data={revenueData}
          layout="vertical"
          barCategoryGap="25%"
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            horizontal={false}
          />

          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: "#888" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 11, fill: "#888" }}
            axisLine={false}
            tickLine={false}
            width={100}
          />

          <Tooltip
            formatter={(value) => [`$${Number(value).toLocaleString(undefined, {minimumFractionDigits: 2})}`, "Amount"]}
            cursor={{ fill: "#fafafa" }}
            contentStyle={{ borderRadius: 8, border: "1px solid #e8e8e8", fontSize: 13 }}
          />

          <Bar
            dataKey="amount"
            radius={[0, 6, 6, 0]}
            fill="#c96"
          />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  </AnimateOnScroll>
</div>

      {/* Recent Orders table */}
      <AnimateOnScroll type="slideUp" duration={500}>
      <div className="bg-white border border-[#e8e8e8] rounded-xl transition-all duration-300 hover:shadow-md">
        <div className="px-6 py-4 border-b border-[#eee]">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-[#c96]" strokeWidth={1.5} />
            <h2 className="text-base font-bold text-[#222]">Recent Orders</h2>
          </div>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-[#999] text-center py-10">No recent orders.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f5f5f5]">
                    <th className="text-left py-3.5 px-6 font-semibold text-[#555] text-xs uppercase tracking-wider">Order</th>
                    <th className="text-left py-3.5 px-6 font-semibold text-[#555] text-xs uppercase tracking-wider">Customer</th>
                    <th className="text-left py-3.5 px-6 font-semibold text-[#555] text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right py-3.5 px-6 font-semibold text-[#555] text-xs uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 5).map((order, idx) => {
                    const o = order as Record<string, unknown>;
                    const amount = Number(o.total_amount || 0);
                    return (
                      <tr key={idx} className="border-b border-[#f5f5f5] hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-medium text-[#333]">{(o.order_number || o.id) as string}</td>
                        <td className="py-4 px-6 text-[#666]">{(o as Record<string, {name?: string}>).user?.name || "—"}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            o.status === "delivered" ? "bg-emerald-50 text-emerald-600" :
                            o.status === "shipped" ? "bg-purple-50 text-purple-600" :
                            o.status === "processing" ? "bg-blue-50 text-blue-600" :
                            o.status === "cancelled" ? "bg-red-50 text-red-600" :
                            o.status === "returned" ? "bg-orange-50 text-orange-600" :
                            "bg-amber-50 text-amber-600"
                          }`}>
                            {o.status as string}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-[#333]">
                          ${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-[#eee] text-center">
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#c96] hover:underline"
              >
                View all orders <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
      </div>
      </AnimateOnScroll>
    </div>
  );
}
