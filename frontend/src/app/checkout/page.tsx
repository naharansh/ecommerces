"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { SpinnerSm } from "@/components/Loader";
import { checkoutAPI } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, total } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  if (!isAuthenticated) {
    return (
      <div className="max-w-[1260px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-[#333] mb-4">Checkout</h1>
        <p className="text-[#999] mb-6">Please sign in to checkout.</p>
        <Link href="/login" className="bg-[#c96] text-white px-8 py-3 rounded-sm text-sm font-medium inline-block hover:bg-[#c96]/90">
          Sign In
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[1260px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-[#333] mb-4">Your Cart is Empty</h1>
        <Link href="/products" className="bg-[#c96] text-white px-8 py-3 rounded-sm text-sm font-medium inline-block hover:bg-[#c96]/90">
          Start Shopping
        </Link>
      </div>
    );
  }

  const applyCoupon = async () => {
    if (!couponCode) return;
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await checkoutAPI.checkout({
        ...form,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        coupon_code: couponCode || undefined,
      });
      toast.success("Order placed successfully!");
      router.push(`/orders/${data.order?.id || data.id}`);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { error?: string } } }).response?.data?.error || "Checkout failed"
          : "Checkout failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-[#333] mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          <AnimateOnScroll type="slideLeft" duration={600} className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#ebebeb] rounded-sm p-6 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg font-bold text-[#333] mb-4">Billing Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "First Name", name: "firstName", required: true },
                  { label: "Last Name", name: "lastName", required: true },
                  { label: "Email", name: "email", type: "email", required: true },
                  { label: "Phone", name: "phone", type: "tel" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm text-[#333] mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                      className="w-full border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c96]"
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm text-[#333] mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c96]"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-[#333] mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c96]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#333] mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c96]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#333] mb-1">ZIP *</label>
                  <input
                    type="text"
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                    className="w-full border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c96]"
                    required
                  />
                </div>
              </div>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll type="slideRight" duration={600} className="space-y-6">
            <div className="bg-white border border-[#ebebeb] rounded-sm p-6 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg font-bold text-[#333] mb-4">Your Order</h2>
              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-[#666]">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-[#333]">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-[#ebebeb] pt-3 flex justify-between font-bold">
                  <span className="text-[#333]">Total</span>
                  <span className="text-[#c96]">${(total - discount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#ebebeb] rounded-sm p-6">
              <h2 className="text-lg font-bold text-[#333] mb-4">Coupon</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="min-w-0 flex-1 border border-[#ebebeb] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c96]"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="bg-[#333] text-white px-4 py-2.5 rounded-sm text-sm hover:bg-black transition-colors shrink-0"
                >
                  Apply
                </button>
              </div>
              {discount > 0 && (
                <p className="text-green-600 text-xs mt-2">Discount: -${discount.toFixed(2)}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c96] text-white py-3 rounded-sm text-sm font-medium hover:bg-[#c96]/90 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><SpinnerSm /> Processing...</span> : "Place Order"}
            </button>
          </AnimateOnScroll>
        </div>
      </form>
    </div>
  );
}
