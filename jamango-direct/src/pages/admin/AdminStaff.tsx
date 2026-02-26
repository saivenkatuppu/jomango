import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, RefreshCw, UserCheck, ShieldAlert, Trash2, Edit2, KeyRound } from "lucide-react";
import client from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";

interface Staff {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    phone?: string;
}

const emptyForm = {
    name: "",
    email: "",
    password: "",
    phone: "",
};

const AdminStaff = () => {
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const { impersonate } = useAuth();

    const fetchStaffs = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await client.get("/users/staff");
            setStaffs(data);
        } catch (err: any) {
            console.error("Fetch Staff Error:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Failed to load staff list");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStaffs();
    }, [fetchStaffs]);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (staff: Staff) => {
        setEditingId(staff._id);
        setForm({
            name: staff.name,
            email: staff.email,
            password: "", // empty so it won't be updated unless typed
            phone: staff.phone || "",
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.email || (!editingId && !form.password)) {
            alert("Name, email and password are required.");
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                // Send password only if it's set
                const payload: any = { name: form.name, email: form.email, phone: form.phone };
                if (form.password) payload.password = form.password;
                const { data } = await client.put(`/users/staff/${editingId}`, payload);
                setStaffs((prev) => prev.map((s) => (s._id === data._id ? data : s)));
            } else {
                const { data } = await client.post("/users/staff", form);
                setStaffs((prev) => [data, ...prev]);
            }
            setShowForm(false);
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to save staff");
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (staff: Staff) => {
        const newStatus = staff.status === "active" ? "disabled" : "active";
        if (!confirm(`Are you sure you want to ${newStatus} this staff account?`)) return;

        try {
            const { data } = await client.put(`/users/staff/${staff._id}`, { status: newStatus });
            setStaffs((prev) => prev.map((s) => (s._id === data._id ? data : s)));
        } catch (err: any) {
            alert(err.response?.data?.message || "Status update failed");
        }
    };

    const handleDelete = async (staff: Staff) => {
        if (!confirm(`WARNING: Deleting ${staff.name} cannot be undone. Area you sure?`)) return;

        try {
            await client.delete(`/users/staff/${staff._id}`);
            setStaffs((prev) => prev.filter((s) => s._id !== staff._id));
        } catch (err: any) {
            alert(err.response?.data?.message || "Delete failed");
        }
    };

    const handleImpersonate = async (staff: Staff) => {
        if (staff.status === "disabled") {
            alert("Cannot impersonate a disabled account.");
            return;
        }
        if (confirm(`You will now access the dashboard as ${staff.name}. This is temporary and you can exit back to Admin at any time. Continue?`)) {
            try {
                await impersonate(staff._id);
                window.location.href = "/admin/dashboard";
            } catch (err: any) {
                alert(err.response?.data?.message || "Failed to impersonate");
            }
        }
    };

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-semibold text-foreground">Staff Management</h1>
                    <p className="font-body text-muted-foreground mt-1">
                        {loading ? "Loading..." : `${staffs.length} staff accounts`}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={fetchStaffs} disabled={loading} className="flex items-center gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button onClick={openCreate} className="bg-[hsl(44,80%,46%)] hover:bg-[hsl(44,90%,40%)] text-white font-bold transition-all shadow-md">
                        + Add Staff
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-body text-sm">
                    {error}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm sm:p-6 sm:justify-end sm:items-stretch overflow-y-auto">
                    <div className="bg-background rounded-2xl w-full max-w-2xl sm:max-w-md sm:w-[450px] sm:h-full sm:rounded-none sm:rounded-l-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-4 sm:slide-in-from-right-full duration-300">
                        <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between sticky top-0 z-10 w-full">
                            <h2 className="font-display text-xl font-bold text-foreground">
                                {editingId ? "Edit Staff" : "Add New Staff"}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto w-full flex-1 space-y-4 font-body">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="staff@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Password {editingId && <span className="text-xs text-muted-foreground font-normal">(Leave blank to keep current)</span>}</Label>
                                <Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingId ? "********" : "Enter a strong password"} />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone (Optional)</Label>
                                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-border bg-secondary/30 mt-auto sticky bottom-0 z-10 w-full flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
                            <Button type="button" onClick={handleSave} disabled={saving} className="bg-[hsl(44,80%,46%)] hover:bg-[hsl(44,90%,40%)] text-white">
                                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Staff"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Staff Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full p-12 text-center text-muted-foreground animate-pulse">
                        Loading staff accounts...
                    </div>
                ) : staffs.length === 0 ? (
                    <div className="col-span-full p-12 text-center text-muted-foreground bg-card rounded-xl border border-border">
                        No staff accounts created yet.
                    </div>
                ) : (
                    staffs.map((staff) => (
                        <div key={staff._id} className="bg-card rounded-xl border border-border overflow-hidden relative group">
                            {staff.status === "disabled" && (
                                <div className="absolute top-4 right-4 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-md">Disabled</div>
                            )}
                            {staff.status === "active" && (
                                <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md">Active</div>
                            )}

                            <div className={`p-6 ${staff.status === "disabled" ? "opacity-60" : ""}`}>
                                <div className="h-12 w-12 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-lg mb-4">
                                    {staff.name.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="font-display text-lg font-semibold text-foreground">{staff.name}</h3>
                                <p className="text-muted-foreground text-sm font-body mt-0.5">{staff.email}</p>
                                {staff.phone && <p className="text-muted-foreground text-xs font-body mt-1">📞 {staff.phone}</p>}

                                <div className="flex flex-wrap items-center gap-2 mt-6">
                                    <Button variant="outline" size="sm" onClick={() => openEdit(staff)} className="flex-1 shrink-0 h-8 font-body text-xs">
                                        <Edit2 className="w-3 h-3 mr-1.5" /> Edit
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => toggleStatus(staff)} className={`shrink-0 h-8 font-body text-xs ${staff.status === 'active' ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 w-[80px]' : 'text-green-600 hover:text-green-700 hover:bg-green-50 w-[80px]'}`}>
                                        {staff.status === "active" ? "Disable" : "Enable"}
                                    </Button>
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleImpersonate(staff)}
                                        disabled={staff.status === "disabled"}
                                        className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 focus:ring-yellow-500 font-body text-xs border border-yellow-300 shadow-sm"
                                    >
                                        <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Login as Staff
                                    </Button>
                                </div>

                            </div>
                            <div className="border-t border-border bg-secondary/20 p-3 flex justify-end">
                                <button onClick={() => handleDelete(staff)} className="text-muted-foreground hover:text-red-600 transition-colors text-xs font-medium flex items-center gap-1">
                                    <Trash2 className="w-3 h-3" /> Delete Account
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default AdminStaff;
