"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { categoryAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Plus, Edit2, Trash2, X, Search } from "lucide-react";
import { PageLoader, SpinnerSm } from "@/components/Loader";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  is_active: boolean;
  sort_order: number;
  children?: Category[];
  created_at: string;
}

interface CategoryForm {
  name: string;
  description: string;
  parent_id: string;
  is_active: boolean;
  sort_order: string;
}

const emptyForm: CategoryForm = {
  name: "", description: "", parent_id: "", is_active: true, sort_order: "0",
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const { isAuthenticated: auth, user: u } = useAuthStore.getState();
    if (!auth) { router.replace("/login"); return; }
    if (u && u.role !== "admin") { router.replace("/"); return; }
    loadCategories();
  }, [mounted, isAuthenticated, user, router]);

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data || []);
    } catch { toast.error("Failed to load categories."); }
    finally { setLoading(false); }
  };

  const parentOptions = categories.filter((c) => !c.parent_id);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      description: cat.description || "",
      parent_id: cat.parent_id?.toString() || "",
      is_active: cat.is_active,
      sort_order: cat.sort_order.toString(),
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Category name is required."); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        description: form.description || undefined,
        is_active: form.is_active,
        sort_order: parseInt(form.sort_order) || 0,
      };
      if (form.parent_id) payload.parent_id = parseInt(form.parent_id);

      if (editingId) {
        await categoryAPI.update(editingId, payload);
        toast.success("Category updated.");
      } else {
        await categoryAPI.create(payload);
        toast.success("Category created.");
      }
      setShowForm(false);
      loadCategories();
    } catch { toast.error("Failed to save category."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? Sub-categories will be unlinked.`)) return;
    try {
      await categoryAPI.remove(id);
      toast.success("Category deleted.");
      loadCategories();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to delete category.";
      toast.error(msg);
    }
  };

  if (!mounted || !isAuthenticated) return null;
  if (!user) return <PageLoader text="Verifying access..." />;
  if (user.role !== "admin") return null;
  if (loading) return <PageLoader text="Loading categories..." />;

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#333]">Categories</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#c96] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#c96]/90 transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
        <input type="text" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-[#ebebeb] rounded-sm pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#c96] transition-colors" />
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-[#fafafa] text-[#666] text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Parent</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-[#999]">No categories found.</td></tr>
            ) : filtered.map((cat) => {
              const parent = categories.find((c) => c.id === cat.parent_id);
              return (
                <tr key={cat.id} className="border-t border-[#ebebeb] hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#333]">{cat.name}</td>
                  <td className="px-4 py-3 text-[#666]">{cat.slug}</td>
                  <td className="px-4 py-3 text-[#666]">{parent?.name || "—"}</td>
                  <td className="px-4 py-3 text-[#666]">{cat.sort_order}</td>
                  <td className="px-4 py-3">
                    {cat.is_active
                      ? <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs">Active</span>
                      : <span className="text-[#999] bg-[#f5f5f5] px-2 py-0.5 rounded text-xs">Inactive</span>}
                    {(cat.children?.length ?? 0) > 0 && <span className="ml-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">{cat.children!.length} sub</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(cat)} className="p-1.5 text-[#666] hover:text-[#c96] transition-colors" title="Edit"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-[#666] hover:text-red-500 transition-colors ml-1" title="Delete"><Trash2 size={15} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-sm w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#ebebeb]">
              <h2 className="text-lg font-bold text-[#333]">{editingId ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-[#999] hover:text-[#333]"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1">Parent Category</label>
                  <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]">
                    <option value="">None (top level)</option>
                    {parentOptions.filter((p) => p.id !== editingId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-[#c96]" />
                Active
              </label>
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
