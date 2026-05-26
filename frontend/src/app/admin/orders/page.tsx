"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { adminAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Search, Eye } from "lucide-react";
import { PageLoader, SpinnerSm } from "@/components/Loader";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

interface OrderUser {
  id: number;
  name: string;
  email: string;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: string;
  payment_status: string;
  tracking_number: string | null;
  created_at: string;
  user?: OrderUser | null;
  items?: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-indigo-50 text-indigo-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
  returned: "bg-orange-50 text-orange-700",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  completed: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
  refunded: "bg-orange-50 text-orange-700",
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const { isAuthenticated: auth, user: u } = useAuthStore.getState();
    if (!auth) { router.replace("/login"); return; }
    if (u && u.role !== "admin") { router.replace("/"); return; }
    loadOrders();
  }, [mounted, isAuthenticated, user, router, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (statusFilter) params.status = statusFilter;
      const { data } = await adminAPI.getOrders(params);
      setOrders(data?.data || data || []);
    } catch { toast.error("Failed to load orders."); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated.");
      loadOrders();
      if (selectedOrder?.id.toString() === orderId) {
        setSelectedOrder(null);
      }
    } catch { toast.error("Failed to update status."); }
    finally { setUpdating(null); }
  };

  if (!mounted || !isAuthenticated) return null;
  if (!user) return <PageLoader text="Verifying access..." />;
  if (user.role !== "admin") return null;
  if (loading) return <PageLoader text="Loading orders..." />;

  const filtered = orders.filter((o) =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const nextStatuses: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
    returned: [],
  };

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#333]">Orders</h1>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
          <input type="text" placeholder="Search by order number or customer..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#ebebeb] rounded-sm pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#c96] transition-colors" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-[#fafafa] text-[#666] text-left">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-[#999]">No orders found.</td></tr>
            ) : filtered.map((order) => (
              <tr key={order.id} className="border-t border-[#ebebeb] hover:bg-[#fafafa] transition-colors">
                <td className="px-4 py-3 font-medium text-[#333]">{order.order_number}</td>
                <td className="px-4 py-3 text-[#666]">{order.user?.name || order.user?.email || "—"}</td>
                <td className="px-4 py-3 text-[#333]">${parseFloat(order.total_amount).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[order.status] || "bg-[#f5f5f5] text-[#666]"}`}>{order.status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs capitalize ${paymentStatusColors[order.payment_status] || "bg-[#f5f5f5] text-[#666]"}`}>{order.payment_status}</span>
                </td>
                <td className="px-4 py-3 text-[#666] text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="p-1.5 text-[#666] hover:text-[#c96] transition-colors" title="View details"><Eye size={15} /></button>
                    {nextStatuses[order.status]?.map((ns) => (
                      <button key={ns} onClick={() => handleStatusUpdate(order.id.toString(), ns)}
                        disabled={updating === order.id.toString()}
                        className="px-2 py-1 text-xs border border-[#ebebeb] rounded-sm hover:bg-[#fafafa] disabled:opacity-50 capitalize transition-colors">
                        {updating === order.id.toString() ? <SpinnerSm /> : ns}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-sm w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#ebebeb]">
              <h2 className="text-lg font-bold text-[#333]">Order {selectedOrder.order_number}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-[#999] hover:text-[#333] text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#999] text-xs mb-1">Customer</p>
                  <p className="text-[#333] font-medium">{selectedOrder.user?.name || "—"}</p>
                  <p className="text-[#666]">{selectedOrder.user?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-[#999] text-xs mb-1">Date</p>
                  <p className="text-[#333]">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </div>
              {selectedOrder.tracking_number && (
                <div>
                  <p className="text-[#999] text-xs mb-1">Tracking</p>
                  <p className="text-[#333]">{selectedOrder.tracking_number}</p>
                </div>
              )}
              <div>
                <p className="text-[#999] text-xs mb-2">Items</p>
                <div className="border border-[#ebebeb] rounded-sm divide-y divide-[#ebebeb]">
                  {(selectedOrder.items || []).map((item) => (
                    <div key={item.id} className="flex justify-between px-3 py-2">
                      <span className="text-[#333]">{item.product_name} x{item.quantity}</span>
                      <span className="text-[#333] font-medium">${parseFloat(item.total_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between border-t border-[#ebebeb] pt-3">
                <span className="font-bold text-[#333]">Total</span>
                <span className="font-bold text-[#333]">${parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
