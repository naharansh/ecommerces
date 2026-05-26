"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { productAPI, categoryAPI, adminAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Plus, Edit2, Trash2, X, Search } from "lucide-react";
import { PageLoader, SpinnerSm } from "@/components/Loader";

interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  compare_price: string | null;
  stock_qty: number;
  sku: string | null;
  is_featured: boolean;
  is_active: boolean;
  category_id: number | null;
  category?: { id: number; name: string } | null;
  images?: ProductImage[];
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

interface ProductForm {
  name: string;
  price: string;
  compare_price: string;
  cost_price: string;
  stock_qty: string;
  sku: string;
  description: string;
  category_id: string;
  is_featured: boolean;
  is_active: boolean;
  weight: string;
  image_url: string;
}

const emptyForm: ProductForm = {
  name: "", price: "", compare_price: "", cost_price: "",
  stock_qty: "0", sku: "", description: "", category_id: "",
  is_featured: false, is_active: true, weight: "", image_url: "",
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const { isAuthenticated: auth, user: u } = useAuthStore.getState();
    if (!auth) { router.replace("/login"); return; }
    if (u && u.role !== "admin") { router.replace("/"); return; }
    loadData();
  }, [mounted, isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        adminAPI.getProducts({ limit: "100" }),
        categoryAPI.getAll(),
      ]);
      setProducts(prodRes.data.data || prodRes.data || []);
      setCategories(catRes.data || []);
    } catch { toast.error("Failed to load data."); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    const primaryImg = product.images?.find((img) => img.is_primary);
    setForm({
      name: product.name,
      price: product.price.toString(),
      compare_price: product.compare_price?.toString() || "",
      cost_price: "",
      stock_qty: product.stock_qty.toString(),
      sku: product.sku || "",
      description: "",
      category_id: product.category_id?.toString() || "",
      is_featured: product.is_featured,
      is_active: product.is_active,
      weight: "",
      image_url: primaryImg?.image_url || "",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Name and price are required.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        price: parseFloat(form.price),
        stock_qty: parseInt(form.stock_qty) || 0,
        sku: form.sku || undefined,
        description: form.description || undefined,
        is_featured: form.is_featured,
        is_active: form.is_active,
      };
      if (form.compare_price) payload.compare_price = parseFloat(form.compare_price);
      if (form.category_id) payload.category_id = parseInt(form.category_id);
      if (form.weight) payload.weight = parseFloat(form.weight);
      if (form.image_url) payload.image_url = form.image_url;

      if (editingId) {
        await productAPI.update(editingId.toString(), payload);
        toast.success("Product updated.");
      } else {
        await productAPI.create(payload);
        toast.success("Product created.");
      }
      setShowForm(false);
      loadData();
    } catch { toast.error("Failed to save product."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await productAPI.remove(id.toString());
      toast.success("Product deleted.");
      loadData();
    } catch { toast.error("Failed to delete product."); }
  };

  if (!mounted || !isAuthenticated) return null;
  if (!user) return <PageLoader text="Verifying access..." />;
  if (user.role !== "admin") return null;
  if (loading) return <PageLoader text="Loading products..." />;

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#333]">Products</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#c96] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#c96]/90 transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-[#ebebeb] rounded-sm pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#c96] transition-colors" />
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-[#fafafa] text-[#666] text-left">
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-[#999]">No products found.</td></tr>
            ) : filtered.map((product) => {
              const primaryImg = product.images?.find((img) => img.is_primary);
              return (
              <tr key={product.id} className="border-t border-[#ebebeb] hover:bg-[#fafafa] transition-colors">
                <td className="px-4 py-3">
                  {primaryImg ? (
                    <img src={primaryImg.image_url} alt="" className="w-10 h-10 object-cover rounded-sm" />
                  ) : (
                    <div className="w-10 h-10 bg-[#f4f4f4] rounded-sm" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-[#333]">{product.name}</td>
                <td className="px-4 py-3 text-[#666]">{product.sku || "—"}</td>
                <td className="px-4 py-3 text-[#333]">${parseFloat(product.price).toFixed(2)}</td>
                <td className="px-4 py-3">{product.stock_qty > 0 ? <span className="text-green-700">{product.stock_qty}</span> : <span className="text-red-500">Out of stock</span>}</td>
                <td className="px-4 py-3 text-[#666]">{product.category?.name || "—"}</td>
                <td className="px-4 py-3">
                  {product.is_active
                    ? <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs">Active</span>
                    : <span className="text-[#999] bg-[#f5f5f5] px-2 py-0.5 rounded text-xs">Inactive</span>}
                  {product.is_featured && <span className="ml-1 text-[#c96] bg-[#fef6ee] px-2 py-0.5 rounded text-xs">Featured</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(product)} className="p-1.5 text-[#666] hover:text-[#c96] transition-colors" title="Edit"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(product.id, product.name)} className="p-1.5 text-[#666] hover:text-red-500 transition-colors ml-1" title="Delete"><Trash2 size={15} /></button>
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-sm w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#ebebeb]">
              <h2 className="text-lg font-bold text-[#333]">{editingId ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-[#999] hover:text-[#333]"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1">Price *</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1">Compare Price</label>
                  <input type="number" step="0.01" value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1">Stock Qty</label>
                  <input type="number" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1">SKU</label>
                  <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Category</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]">
                  <option value="">None</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Main Image URL</label>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://example.com/image.jpg" className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
                {form.image_url && (
                  <img src={form.image_url} alt="" className="mt-2 w-20 h-20 object-cover rounded-sm border border-[#ebebeb]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-[#c96]" />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-[#c96]" />
                  Featured
                </label>
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
