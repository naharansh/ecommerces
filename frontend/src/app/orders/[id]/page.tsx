"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { PageLoader } from "@/components/Loader";
import { orderAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface OrderDetail {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  coupon_code?: string;
  created_at: string;
  shipping_address: Record<string, unknown>;
  items: { id: number; product_name: string; quantity: number; unit_price: number; total_price: number; image_url?: string }[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await orderAPI.getById(params.id as string);
        setOrder(data?.order || data?.data || data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-[1260px] mx-auto px-4 py-20 text-center">
        <p className="text-[#999]">Please sign in to view this order.</p>
        <Link href="/login" className="text-[#c96] hover:underline text-sm">Sign In</Link>
      </div>
    );
  }

  if (loading) return <PageLoader text="Loading order..." />;

  if (!order) {
    return (
      <div className="max-w-[1260px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-[#333] mb-4">Order Not Found</h1>
        <Link href="/account" className="text-[#c96] hover:underline text-sm">Back to Account</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm text-[#999] hover:text-[#c96] mb-6">
        <ArrowLeft size={14} />
        Back to Account
      </Link>

      <AnimateOnScroll type="slideUp" duration={600}>
      <div className="bg-white border border-[#ebebeb] rounded-sm p-6 mb-6 transition-all duration-300 hover:shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#333]">Order {order.order_number}</h1>
            <p className="text-sm text-[#999]">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-sm bg-[#f0f0f0] text-[#666] capitalize font-medium">
            {order.status}
          </span>
        </div>

          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3 md:gap-4 py-3 border-b border-[#ebebeb] last:border-0">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#f4f4f4] rounded-sm overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#ccc] text-xs">No img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#333] truncate">{item.product_name}</p>
                  <p className="text-xs text-[#999]">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-[#333] shrink-0">${Number(item.total_price).toFixed(2)}</p>
              </div>
            ))}
          </div>

        <div className="mt-6 pt-4 border-t border-[#ebebeb] space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#999]">Subtotal</span>
            <span className="text-[#333]">${Number(order.subtotal || 0).toFixed(2)}</span>
          </div>
          {Number(order.tax_amount) > 0 && (
            <div className="flex justify-between">
              <span className="text-[#999]">Tax</span>
              <span className="text-[#333]">${Number(order.tax_amount).toFixed(2)}</span>
            </div>
          )}
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between">
              <span className="text-[#999]">Discount {order.coupon_code ? <span className="text-green-600 font-mono text-[10px] uppercase">({order.coupon_code})</span> : ""}</span>
              <span className="text-green-600">-${Number(order.discount_amount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-2 border-t border-[#ebebeb]">
            <span className="text-[#333]">Total</span>
            <span className="text-[#c96] text-lg">${Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>
      </AnimateOnScroll>
    </div>
  );
}
