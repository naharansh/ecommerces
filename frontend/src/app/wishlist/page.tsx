"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import AnimateOnScroll, { StaggerChildren } from "@/components/AnimateOnScroll";
import { PageLoader } from "@/components/Loader";
import { userAPI, cartAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface WishlistItem {
  id: number;
  product_id: number;
  product: { id: number; name: string; price: number; compare_price?: number; image_url?: string };
}

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const { data } = await userAPI.getWishlist();
        setItems(data?.wishlist || data?.data || data || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAuthenticated]);

  const removeItem = async (productId: number) => {
    try {
      await userAPI.removeFromWishlist(productId);
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const addToCart = async (productId: number) => {
    try {
      await cartAPI.addItem({ product_id: productId, quantity: 1 });
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-[1260px] mx-auto px-4 py-20 text-center">
        <Heart size={48} className="mx-auto text-[#ccc] mb-4" />
        <h1 className="text-2xl font-bold text-[#333] mb-4">Wishlist</h1>
        <p className="text-[#999] mb-6">Please sign in to view your wishlist.</p>
        <Link href="/login" className="bg-[#c96] text-white px-8 py-3 rounded-sm text-sm font-medium inline-block hover:bg-[#c96]/90">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) return <PageLoader text="Loading wishlist..." />;

  if (items.length === 0) {
    return (
      <div className="max-w-[1260px] mx-auto px-4 py-20 text-center">
        <Heart size={48} className="mx-auto text-[#ccc] mb-4" />
        <h1 className="text-2xl font-bold text-[#333] mb-4">Your Wishlist is Empty</h1>
        <p className="text-[#999] mb-6">Save your favorite items here.</p>
        <Link href="/products" className="bg-[#c96] text-white px-8 py-3 rounded-sm text-sm font-medium inline-block hover:bg-[#c96]/90">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-[#333] mb-8">My Wishlist ({items.length} items)</h1>
      <StaggerChildren staggerDelay={100} duration={400} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => {
          const product = item.product;
          return (
            <div key={item.id} className="bg-white border border-[#ebebeb] rounded-sm overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <Link href={`/products/${product.id}`}>
                <div className="aspect-square bg-[#f4f4f4] overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#ccc] text-xs">No image</div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/products/${product.id}`} className="text-sm font-medium text-[#333] hover:text-[#c96] line-clamp-1">
                  {product.name}
                </Link>
                <p className="text-[#c96] font-semibold text-sm mt-1">${Number(product.price).toFixed(2)}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => addToCart(product.id)}
                    className="flex-1 bg-[#c96] text-white text-xs py-2 rounded-sm hover:bg-[#c96]/90 transition-colors"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-[#999] hover:text-red-500 p-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </StaggerChildren>
    </div>
  );
}
