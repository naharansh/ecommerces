"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, ShoppingBag, User, Heart, Menu, X, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { categoryAPI } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  children: Category[];
}

export default function Header() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/register") return null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { isAuthenticated, user } = useAuthStore();
  const { itemCount } = useCartStore();

  useEffect(() => {
    categoryAPI.getAll().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-[#222] text-white text-xs py-1.5">
        <div className="max-w-[1260px] mx-auto px-4 flex justify-between items-center">
          <p className="hidden sm:block">
            Special collection already available.{" "}
            <Link href="/products" className="underline hover:text-[#c96]">
              Read more...
            </Link>
          </p>
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <Link href="/login" className="hover:text-[#c96] transition-colors truncate max-w-[120px] sm:max-w-none">
              {isAuthenticated ? `Hi, ${user?.name}` : "Sign in / Sign up"}
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Header */}
      <div className="max-w-[1260px] mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <button
          className="lg:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <img
            src="/assets/images/demos/demo-2/logo.png"
            alt="ShopWave"
            width={105}
            height={25}
            className="h-6 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
          <span className="text-2xl font-bold tracking-tight text-[#333] hidden">
            Shop<span className="text-[#c96]">Wave</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#333]">
          <Link href="/" className="hover:text-[#c96] transition-colors">Home</Link>
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-[#c96] transition-colors cursor-pointer peer">
              Categories <ChevronDown size={14} />
            </button>
            <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px]">
              <div className="bg-white border border-[#ebebeb] rounded shadow-lg py-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.id}`}
                    className="block px-4 py-2 hover:bg-[#f5f5f5] hover:text-[#c96] whitespace-nowrap"
                  >
                    {cat.name}
                    {cat.children?.length > 0 && (
                      <span className="ml-2 text-[#999]">&rsaquo;</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link href="/products" className="hover:text-[#c96] transition-colors">Shop</Link>
          <Link href="/about" className="hover:text-[#c96] transition-colors">About</Link>
          <Link href="/contact" className="hover:text-[#c96] transition-colors">Contact</Link>
        </nav>

        {/* Search & Icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 hover:text-[#c96] transition-colors"
          >
            <Search size={20} />
          </button>
          <Link href="/wishlist" className="p-2 hover:text-[#c96] transition-colors relative hidden sm:block">
            <Heart size={20} />
          </Link>
          <Link href={isAuthenticated ? "/account" : "/login"} className="p-2 hover:text-[#c96] transition-colors hidden sm:block">
            <User size={20} />
          </Link>
          <Link href="/cart" className="p-2 hover:text-[#c96] transition-colors relative">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#c96] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div className="border-t border-[#ebebeb] py-3 px-4">
          <div className="max-w-[1260px] mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full border border-[#ebebeb] rounded py-2.5 px-4 text-sm focus:outline-none focus:border-[#c96]"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c96]">
                <Search size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#ebebeb] bg-white">
          <nav className="flex flex-col p-4 text-sm font-medium">
            <Link href="/" className="py-2 hover:text-[#c96]" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <div className="py-2 font-medium text-[#333]">Categories</div>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="py-1.5 pl-4 text-sm text-[#555] hover:text-[#c96]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/products" className="py-2 hover:text-[#c96]" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
            <Link href="/about" className="py-2 hover:text-[#c96]" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/contact" className="py-2 hover:text-[#c96]" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <Link href="/wishlist" className="py-2 hover:text-[#c96]" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
            <Link href={isAuthenticated ? "/account" : "/login"} className="py-2 hover:text-[#c96]" onClick={() => setMobileMenuOpen(false)}>Account</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
