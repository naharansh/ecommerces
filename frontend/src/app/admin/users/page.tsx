"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { adminAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Search, Shield, ShieldOff, Edit2, X } from "lucide-react";
import { PageLoader, SpinnerSm } from "@/components/Loader";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_verified: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const { isAuthenticated: auth, user: u } = useAuthStore.getState();
    if (!auth) { router.replace("/login"); return; }
    if (u && u.role !== "admin") { router.replace("/"); return; }
    loadUsers();
  }, [mounted, isAuthenticated, currentUser, router]);

  const loadUsers = async () => {
    try {
      const { data } = await adminAPI.getUsers({ limit: "100" });
      setUsers(data?.data || data || []);
    } catch { toast.error("Failed to load users."); }
    finally { setLoading(false); }
  };

  const handleRoleToggle = async (uid: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    if (!confirm(`Change user role to "${newRole}"?`)) return;
    setUpdating(uid);
    try {
      await adminAPI.updateUserRole(uid, newRole);
      toast.success("User role updated.");
      loadUsers();
    } catch { toast.error("Failed to update role."); }
    finally { setUpdating(null); }
  };

  const openEdit = (u: User) => {
    setEditForm({ name: u.name, email: u.email, phone: u.phone || "" });
    setEditingUser(u);
  };

  const handleEditSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await adminAPI.updateUser(editingUser.id, editForm);
      toast.success("User updated.");
      setEditingUser(null);
      loadUsers();
    } catch { toast.error("Failed to update user."); }
    finally { setSaving(false); }
  };

  if (!mounted || !isAuthenticated) return null;
  if (!currentUser) return <PageLoader text="Verifying access..." />;
  if (currentUser.role !== "admin") return null;
  if (loading) return <PageLoader text="Loading users..." />;

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#333]">Users</h1>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-[#ebebeb] rounded-sm pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#c96] transition-colors" />
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-[#fafafa] text-[#666] text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Verified</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-[#999]">No users found.</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} className="border-t border-[#ebebeb] hover:bg-[#fafafa] transition-colors">
                <td className="px-4 py-3 font-medium text-[#333]">{u.name}</td>
                <td className="px-4 py-3 text-[#666]">{u.email}</td>
                <td className="px-4 py-3 text-[#666]">{u.phone || "—"}</td>
                <td className="px-4 py-3">
                  {u.role === "admin"
                    ? <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-xs font-medium">Admin</span>
                    : <span className="text-[#666] bg-[#f5f5f5] px-2 py-0.5 rounded text-xs">{u.role}</span>}
                </td>
                <td className="px-4 py-3">
                  {u.is_verified
                    ? <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs">Yes</span>
                    : <span className="text-[#999] bg-[#f5f5f5] px-2 py-0.5 rounded text-xs">No</span>}
                </td>
                <td className="px-4 py-3 text-[#666] text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(u)} className="p-1.5 text-[#666] hover:text-[#c96] transition-colors" title="Edit user"><Edit2 size={15} /></button>
                    {u.id !== currentUser.id && (
                      <button onClick={() => handleRoleToggle(u.id, u.role)} disabled={updating === u.id}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-[#ebebeb] rounded-sm hover:bg-[#fafafa] disabled:opacity-50 transition-colors">
                        {updating === u.id ? <SpinnerSm /> : u.role === "admin" ? <ShieldOff size={13} /> : <Shield size={13} />}
                        {u.role === "admin" ? "Demote" : "Promote"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingUser(null)}>
          <div className="bg-white rounded-sm w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#ebebeb]">
              <h2 className="text-lg font-bold text-[#333]">Edit User</h2>
              <button onClick={() => setEditingUser(null)} className="p-1 text-[#999] hover:text-[#333]"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Name</label>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Phone</label>
                <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full border border-[#ebebeb] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c96]" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-[#ebebeb]">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm text-[#666] border border-[#ebebeb] rounded-sm hover:bg-[#fafafa] transition-colors">Cancel</button>
              <button onClick={handleEditSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#c96] rounded-sm hover:bg-[#c96]/90 disabled:opacity-50 transition-colors">
                {saving ? <><SpinnerSm /> Saving...</> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
