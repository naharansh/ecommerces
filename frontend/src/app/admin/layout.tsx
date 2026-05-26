"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Users, Package, ShoppingCart, LayoutDashboard, PieChart, Tag, LogOut, Menu, X, ChevronLeft } from "lucide-react";
import { PageLoader } from "@/components/Loader";
import { useAuthStore } from "@/store/authStore";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: PieChart },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || isLoginPage) return;
    const { isAuthenticated: auth, user: u } = useAuthStore.getState();
    if (!auth) { router.replace("/admin/login"); return; }
    if (u && u.role !== "admin") { router.replace("/"); return; }
  }, [mounted, isAuthenticated, user, router, isLoginPage]);

  useEffect(() => {
    if (!mounted || isLoginPage) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [mounted, isLoginPage]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isLoginPage) return <>{children}</>;

  if (!mounted || !isAuthenticated) return null;
  if (!user) return <PageLoader text="Verifying access..." />;
  if (user.role !== "admin") return null;

  const sidebarWidth = sidebarCollapsed ? "w-16" : "w-64";

  const sidebarContent = (
    <>
      <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} gap-3 px-${sidebarCollapsed ? "0" : "6"} h-16 border-b border-[#eee] shrink-0 ${sidebarCollapsed ? "px-0" : "px-6"}`}>
        <div className={`flex items-center gap-3 ${sidebarCollapsed ? "flex-col" : ""}`}>
          <LayoutDashboard size={22} className="text-[#c96]" strokeWidth={1.5} />
          {!sidebarCollapsed && <span className="text-lg font-bold text-[#222] whitespace-nowrap">Admin Panel</span>}
        </div>
        <button className="hidden lg:flex p-1 text-[#666] hover:text-[#333] items-center justify-center" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <ChevronLeft size={18} className={`transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
        </button>
        <button className="lg:hidden p-1 text-[#666] hover:text-[#333]" onClick={() => setSidebarOpen(false)}>
          <X size={20} />
        </button>
      </div>
      <nav className={`flex-1 p-${sidebarCollapsed ? "2" : "4"} space-y-1 overflow-y-auto`}>
        {sidebarLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3 px-4"} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-[#fdf8f3] text-[#c96] border border-[#c96]/20"
                  : "text-[#666] hover:bg-gray-50 hover:text-[#333]"
              }`}
              title={sidebarCollapsed ? link.label : undefined}
            >
              <link.icon size={18} strokeWidth={1.5} />
              {!sidebarCollapsed && link.label}
            </Link>
          );
        })}
      </nav>
      <div className={`p-${sidebarCollapsed ? "2" : "4"} border-t border-[#eee]`}>
        <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3 px-4"} py-2.5 text-xs text-[#888] truncate`}>
          <div className="w-7 h-7 rounded-full bg-[#c96] text-white flex items-center justify-center text-xs font-bold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          {!sidebarCollapsed && (
            <div className="truncate">
              <p className="font-medium text-[#333] text-sm truncate">{user.name}</p>
              <p className="truncate">{user.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => { logout(); router.push("/admin/login"); }}
          className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2"} w-full px-4 py-2.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors mt-1`}
          title="Sign Out"
        >
          <LogOut size={15} strokeWidth={1.5} />
          {!sidebarCollapsed && "Sign Out"}
        </button>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-[100] flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - mobile */}
      <aside className={`fixed lg:hidden inset-y-0 left-0 z-50 w-64 shrink-0 bg-white border-r border-[#e8e8e8] flex flex-col transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {sidebarContent}
      </aside>

      {/* Sidebar - desktop (collapsible) */}
      <aside className={`hidden lg:flex ${sidebarWidth} shrink-0 bg-white border-r border-[#e8e8e8] flex-col transition-all duration-300`}>
        {sidebarContent}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Mobile header bar */}
        <div className="sticky top-0 z-30 lg:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-[#e8e8e8]">
          <button onClick={() => setSidebarOpen(true)} className="p-1 text-[#666] hover:text-[#333]">
            <Menu size={22} />
          </button>
          <LayoutDashboard size={18} className="text-[#c96]" strokeWidth={1.5} />
          <span className="text-sm font-bold text-[#222]">Admin Panel</span>
        </div>
        {children}
      </main>
    </div>
  );
}
