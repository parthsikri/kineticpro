"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  User, 
  Search, 
  Edit, 
  Loader2, 
  X, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Key,
  LogOut
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  // Form states for editing
  const [editTier, setEditTier] = useState("free");
  const [editStatus, setEditStatus] = useState("inactive");
  const [editCredits, setEditCredits] = useState(1);
  const [editExpiry, setEditExpiry] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      
      if (res.status === 403) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to load users." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "An error occurred fetching users." });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditTier(user.subscriptionTier || "free");
    setEditStatus(user.subscriptionStatus || "inactive");
    setEditCredits(user.credits ?? 1);
    setEditIsAdmin(!!user.isAdmin);
    
    if (user.subscriptionExpiresAt) {
      // Format as YYYY-MM-DD for date input
      const date = new Date(user.subscriptionExpiresAt);
      const formatted = date.toISOString().split("T")[0];
      setEditExpiry(formatted);
    } else {
      setEditExpiry("");
    }
    setMessage({ type: "", text: "" });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSaveLoading(true);
      setMessage({ type: "", text: "" });
      
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          subscriptionTier: editTier,
          subscriptionStatus: editStatus,
          credits: editCredits,
          subscriptionExpiresAt: editExpiry || null,
          isAdmin: editIsAdmin,
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: `User ${data.user.email} updated successfully!` });
        // Update user in local state list
        setUsers(prev => prev.map(u => u.id === data.user.id ? { ...u, ...data.user } : u));
        setTimeout(() => setEditingUser(null), 1000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update user." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "An error occurred while saving." });
    } finally {
      setSaveLoading(false);
    }
  };

  if (unauthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 max-w-md mx-auto text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-red-950/20 border border-red-500/20 flex items-center justify-center text-red-450">
          <Shield className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-muted">You do not have administrative permissions to access this page.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Admin Directory</h1>
            <p className="text-sm text-muted">Manage members, update plans, and assign administrative access.</p>
          </div>
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search users by email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="premium-textarea pl-9 py-2.5 w-full text-sm"
            />
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-black/40 border border-white/10 hover:border-red-500/30 hover:bg-red-950/10 text-muted hover:text-red-400 transition-all rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-50 h-[46px]"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{logoutLoading ? "..." : "Log Out"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-gold animate-spin" />
          <p className="text-sm text-muted uppercase tracking-widest font-light">Loading User Registry...</p>
        </div>
      ) : (
        <div className="bg-charcoal border border-border rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-black/20 text-[10px] uppercase tracking-wider font-semibold text-muted">
                  <th className="p-4 pl-6">Email / Joined</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Tier</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Credits</th>
                  <th className="p-4 pr-6 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted">
                      No matching users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const hasActiveSub = u.subscriptionStatus === "active";
                    const isElite = hasActiveSub && u.subscriptionTier === "elite";
                    const isPro = hasActiveSub && !isElite;
                    const formattedDate = u.subscriptionExpiresAt
                      ? new Date(u.subscriptionExpiresAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })
                      : "—";

                    return (
                      <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 pl-6">
                          <div className="font-medium text-white">{u.email}</div>
                          <div className="text-xs text-muted mt-0.5">
                            Joined {new Date(u.createdAt).toLocaleDateString("en-IN")}
                          </div>
                        </td>
                        <td className="p-4">
                          {u.isAdmin ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-red-400 bg-red-400/10 border border-red-400/30 px-2 py-0.5 rounded-full">
                              <Shield className="w-2.5 h-2.5" /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-muted bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                              <User className="w-2.5 h-2.5" /> User
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-semibold ${
                            isElite ? "text-purple-400" : isPro ? "text-gold" : "text-muted"
                          }`}>
                            {isElite ? "Elite" : isPro ? "Pro" : "Free"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            u.subscriptionStatus === "active" 
                              ? "bg-green-500" 
                              : u.subscriptionStatus === "expired" 
                              ? "bg-red-500" 
                              : "bg-zinc-600"
                          }`} />
                          <span className="capitalize text-zinc-300">{u.subscriptionStatus || "inactive"}</span>
                        </td>
                        <td className="p-4 text-zinc-300">
                          {formattedDate}
                        </td>
                        <td className="p-4">
                          <div className="text-zinc-300">
                            {hasActiveSub ? (
                              <span className="text-xs">
                                Used: <strong className="text-white">{u.proCreditsUsed}</strong>
                              </span>
                            ) : (
                              <span className="text-xs">
                                Free: <strong className="text-white">{u.credits}</strong>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="p-2 text-muted hover:text-gold hover:bg-gold/10 rounded-lg transition-all inline-flex items-center gap-1.5 text-xs border border-transparent hover:border-gold/20"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal Overlay */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-charcoal border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative border-gold/10">
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/10">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gold" />
                <h3 className="font-semibold text-white">Modify User Access</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingUser(null)} 
                className="text-muted hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="text-sm border-b border-white/5 pb-3">
                <span className="text-muted uppercase text-[10px] tracking-wider block font-semibold mb-0.5">Target Email</span>
                <span className="text-off-white font-medium break-all">{editingUser.email}</span>
              </div>

              {/* Message Display inside modal */}
              {message.text && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                  message.type === "success" 
                    ? "bg-green-950/20 border-green-500/20 text-green-400" 
                    : "bg-red-950/20 border-red-500/20 text-red-400"
                }`}>
                  {message.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Admin Flag */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="space-y-0.5">
                  <label className="text-sm font-semibold text-white block">Administrator Access</label>
                  <span className="text-xs text-muted block">Grant full dashboard database rights</span>
                </div>
                <input 
                  type="checkbox"
                  checked={editIsAdmin}
                  onChange={(e) => setEditIsAdmin(e.target.checked)}
                  disabled={editingUser.email === "apnaipuwallah@gmail.com"} // Cannot strip primary owner admin status
                  className="w-5 h-5 accent-gold cursor-pointer rounded border-border"
                />
              </div>

              {/* Subscription Tier */}
              <div className="space-y-2">
                <label className="premium-label block">Membership Tier</label>
                <select 
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value)}
                  className="premium-textarea py-2.5 w-full text-sm font-medium"
                >
                  <option value="free">Free Tier</option>
                  <option value="pro">Kinetic Pro</option>
                  <option value="elite">Kinetic Elite</option>
                </select>
              </div>

              {/* Subscription Status */}
              <div className="space-y-2">
                <label className="premium-label block">Account Status</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="premium-textarea py-2.5 w-full text-sm font-medium"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                  <option value="past_due">Past Due</option>
                </select>
              </div>

              {/* Free Credits */}
              <div className="space-y-2">
                <label className="premium-label block">Free Generation Credits</label>
                <input 
                  type="number"
                  min="0"
                  max="1000"
                  value={editCredits}
                  onChange={(e) => setEditCredits(parseInt(e.target.value) || 0)}
                  className="premium-textarea py-2.5 w-full text-sm"
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <label className="premium-label flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted" /> Expiration Date
                </label>
                <input 
                  type="date"
                  value={editExpiry}
                  onChange={(e) => setEditExpiry(e.target.value)}
                  className="premium-textarea py-2.5 w-full text-sm"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saveLoading}
                className="premium-btn w-full py-3.5 text-xs font-bold tracking-widest uppercase mt-4 flex items-center justify-center gap-2"
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Save Preferences
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
