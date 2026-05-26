"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { adminAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { PageLoader, SpinnerSm } from "@/components/Loader";

interface Coupon {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_order_amount: string;
  max_discount: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string;
  created_at: string;
}

interface CouponForm {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_order_amount: string;
  max_discount: string;
  usage_limit: string;
  is_active: boolean;
  expires_at: string;
}

const emptyForm: CouponForm = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  min_order_amount: "0",
  max_discount: "",
  usage_limit: "",
  is_active: true,
  expires_at: "",
};

export default function AdminCouponsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const { isAuthenticated: auth, user: u } = useAuthStore.getState();
    if (!auth) { router.replace("/login"); return; }
    if (u && u.role !== "admin") { router.replace("/"); return; }
    loadCoupons();
  }, [mounted, isAuthenticated, user, router]);

  const loadCoupons = async () => {
    try {
      const { data } = await adminAPI.getCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_amount: coupon.min_order_amount.toString(),
      max_discount: coupon.max_discount?.toString() || "",
      usage_limit: coupon.usage_limit?.toString() || "",
      is_active: coupon.is_active,
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : "",
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.discount_value || !form.expires_at) {
      toast.error("Code, discount value, and expiry are required.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_order_amount: parseFloat(form.min_order_amount) || 0,
        is_active: form.is_active,
        expires_at: form.expires_at,
      };
      if (form.max_discount) payload.max_discount = parseFloat(form.max_discount);
      if (form.usage_limit) payload.usage_limit = parseInt(form.usage_limit);

      if (editingId) {
        await adminAPI.updateCoupon(editingId, payload);
        toast.success("Coupon updated.");
      } else {
        await adminAPI.createCoupon(payload);
        toast.success("Coupon created.");
      }
      setShowForm(false);
      loadCoupons();
    } catch {
      toast.error("Failed to save coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await adminAPI.deleteCoupon(id);
      toast.success("Coupon deleted.");
      loadCoupons();
    } catch {
      toast.error("Failed to delete coupon.");
    }
  };

  if (!mounted || !isAuthenticated) return null;
  if (!user) return <PageLoader text="Verifying access..." />;
  if (user.role !== "admin") return null;
  if (loading) return <PageLoader text="Loading coupons..." />;

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#333]">Coupons</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#c96] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#c96]/90 transition-colors">
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-[#fafafa] text-[#666] text-left">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Min Order</th>
              <th className="px-4 py-3 font-medium">Used</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-[#999]">No coupons found.</td></tr>
            ) : coupons.map((coupon) => (
              <tr key={coupon.id} className="border-t border-[#ebebeb] hover:bg-[#fafafa] transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-[#333] uppercase">{coupon.code}</td>
                <td className="px-4 py-3 text-[#666] capitalize">{coupon.discount_type}</td>
                <td className="px-4 py-3 text-[#333]">
                  {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                </td>
                <td className="px-4 py-3 text-[#666]">${parseFloat(coupon.min_order_amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-[#666]">
                  {coupon.used_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                </td>
                <td className="px-4 py-3 text-[#666]">
                  {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${coupon.is_active ? "bg-green-50 text-green-700" : "bg-[#f5f5f5] text-[#999]"}`}>
                    {coupon.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(coupon)} className="p-1.5 text-[#666] hover:text-[#c96] transition-colors" title="Edit"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(coupon.id, coupon.code)} className="p-1.5 text-[#666] hover:text-red-500 transition-colors ml-1" title="Delete"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-sm w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#ebebeb]">
              <h2 className="text-lg font-bold text-[#333]">{editingId ? "Edit Coupon" : "Add Coupon"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-[#999] hover:text-[#333]"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Code *</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. SUMMER20" className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96] uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1">Type *</label>
                  <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as "percentage" | "fixed" })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1">Value *</label>
                  <input type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1">Min Order Amount</label>
                  <input type="number" step="0.01" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1">Max Discount (for %)</label>
                  <input type="number" step="0.01" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1">Usage Limit</label>
                  <input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="Unlimited" className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1">Expiry Date *</label>
                  <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-[#c96]" />
                <label htmlFor="is_active" className="text-sm text-[#333]">Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-[#ebebeb]">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[#666] border border-[#ebebeb] rounded-sm hover:bg-[#f5f5f5] transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#c96] rounded-sm hover:bg-[#c96]/90 disabled:opacity-50 transition-colors">
                {saving ? <><SpinnerSm /> Saving...</> : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
