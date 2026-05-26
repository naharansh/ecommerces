"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import AnimateOnScroll, { StaggerChildren } from "@/components/AnimateOnScroll";
import { PageLoader } from "@/components/Loader";
import { cartAPI, checkoutAPI } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface CartItemData {
  id: number;
  product_id: number;
  quantity: number;
  product: { id: number; name: string; price: number; image_url?: string; stock_qty: number };
}

export default function CartPage() {
  const { isAuthenticated } = useAuthStore();
  const { items, itemCount, total, setItems, removeItem, updateQuantity } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplying, setCouponApplying] = useState(false);

  useEffect(() => {
  const applyCoupon = async () => {
    if (!couponCode) return;
    setCouponApplying(true);
    try {
      const { data } = await checkoutAPI.applyCoupon({ code: couponCode, subtotal: total });
      if (data.valid) {
        const coupon = data.coupon;
        const disc = coupon.discount_type === "percentage"
          ? Math.min(total * (coupon.discount_value / 100), coupon.max_discount || Infinity)
          : coupon.discount_value;
        setDiscount(disc);
        toast.success("Coupon applied!");
      }
    } catch {
      toast.error("Invalid coupon code");
    } finally {
      setCouponApplying(false);
    }
  };

  const finalTotal = total - discount;

  if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const { data } = await cartAPI.getCart();
        const cartData = data?.cart || data?.data || data;
        const cartItems: CartItemData[] = cartData?.items || [];
        setItems(
          cartItems.map((item: CartItemData) => ({
            id: item.id,
            product_id: item.product_id,
            name: item.product?.name || `Product #${item.product_id}`,
            price: item.product?.price || 0,
            quantity: item.quantity,
            image: item.product?.image_url,
          }))
        );
      } catch {
        // Not logged in or API not available
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAuthenticated, setItems]);

  const handleRemove = async (id: number) => {
    try {
      await cartAPI.removeItem(id);
      removeItem(id);
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const handleQuantity = async (id: number, qty: number) => {
    if (qty < 1) return;
    try {
      await cartAPI.updateItem(id, { quantity: qty });
      updateQuantity(id, qty);
    } catch {
      toast.error("Failed to update");
    }
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    setCouponApplying(true);
    try {
      const { data } = await checkoutAPI.applyCoupon({ code: couponCode, subtotal: total });
      if (data.valid) {
        const coupon = data.coupon;
        const disc = coupon.discount_type === "percentage"
          ? Math.min(total * (coupon.discount_value / 100), coupon.max_discount || Infinity)
          : coupon.discount_value;
        setDiscount(disc);
        toast.success("Coupon applied!");
      }
    } catch {
      toast.error("Invalid coupon code");
    } finally {
      setCouponApplying(false);
    }
  };

  const finalTotal = total - discount;

  if (!isAuthenticated) {
    return (
      <div className="max-w-[1260px] mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-[#ccc] mb-4" />
        <h1 className="text-2xl font-bold text-[#333] mb-4">Your Cart</h1>
        <p className="text-[#999] mb-6">Please sign in to view your cart.</p>
        <Link href="/login" className="bg-[#c96] text-white px-8 py-3 rounded-sm text-sm font-medium inline-block hover:bg-[#c96]/90">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) return <PageLoader text="Loading cart..." />;

  if (items.length === 0) {
    return (
      <div className="max-w-[1260px] mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-[#ccc] mb-4" />
        <h1 className="text-2xl font-bold text-[#333] mb-4">Your Cart is Empty</h1>
        <p className="text-[#999] mb-6">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/products" className="bg-[#c96] text-white px-8 py-3 rounded-sm text-sm font-medium inline-block hover:bg-[#c96]/90">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-[#333] mb-8">Shopping Cart ({itemCount} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <StaggerChildren staggerDelay={100} duration={400} className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 bg-white border border-[#ebebeb] rounded-sm transition-all duration-300 hover:shadow-md hover:border-[#c96]">
              <div className="w-20 h-20 bg-[#f4f4f4] rounded-sm flex-shrink-0 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#ccc] text-xs">No img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product_id}`}
                  className="text-sm font-medium text-[#333] hover:text-[#c96] line-clamp-1"
                >
                  {item.name}
                </Link>
                <p className="text-[#c96] font-semibold text-sm mt-1">${Number(item.price).toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex border border-[#ebebeb] rounded-sm">
                    <button
                      onClick={() => handleQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs hover:bg-[#f4f4f4]"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs border-x border-[#ebebeb]">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs hover:bg-[#f4f4f4]"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-[#999] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#333]">${(Number(item.price) * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </StaggerChildren>

        <AnimateOnScroll type="slideRight" duration={600}>
        <div className="bg-white border border-[#ebebeb] rounded-sm p-6 h-fit transition-all duration-300 hover:shadow-lg">
          <h3 className="text-lg font-bold text-[#333] mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#999]">Subtotal</span>
              <span className="font-medium text-[#333]">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#999]">Shipping</span>
              <span className="font-medium text-[#333]">Calculated at checkout</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-green-600">Discount</span>
                <span className="text-green-600">-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-[#ebebeb] pt-3 flex justify-between">
              <span className="font-bold text-[#333]">Total</span>
              <span className="font-bold text-[#c96] text-lg">${finalTotal.toFixed(2)}</span>
            </div>
            </div>

          {/* Coupon */}
          <div className="mt-4 pt-4 border-t border-[#ebebeb]">
            <p className="text-xs font-medium text-[#333] mb-2">Have a coupon?</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code"
                className="min-w-0 flex-1 border border-[#ebebeb] rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#c96] uppercase"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={couponApplying}
                className="bg-[#333] text-white px-3 py-2 rounded-sm text-xs hover:bg-black transition-colors shrink-0 disabled:opacity-50"
              >
                {couponApplying ? "..." : "Apply"}
              </button>
            </div>
          </div>
          </div>
          <Link
            href="/checkout"
            className="block w-full bg-[#c96] text-white text-center py-3 rounded-sm text-sm font-medium mt-6 hover:bg-[#c96]/90 transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/products"
            className="block w-full text-center py-3 text-sm text-[#999] mt-2 hover:text-[#c96] transition-colors"
          >
            <ArrowLeft size={14} className="inline mr-1" />
            Continue Shopping
          </Link>
        </AnimateOnScroll>
      </div>
    </div>
  );
}
