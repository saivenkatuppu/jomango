import { useState, useEffect } from "react";
import {
    Plus,
    Store,
    MapPin,
    User as UserIcon,
    Phone,
    Calendar,
    CheckCircle2,
    XCircle,
    Download,
    Search,
    Trash2,
    Edit3,
    ArrowRight
} from "lucide-react";
import client from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AdminStalls = () => {
    const navigate = useNavigate();
    const [stalls, setStalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStall, setEditingStall] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({
        stallName: "",
        stallId: "",
        ownerName: "",
        ownerMobile: "",
        ownerEmail: "",
        password: "", // Added password field
        location: "",
        address: "",
        stallType: "Temporary",
        operatingDates: { from: "", to: "" }
    });

    useEffect(() => {
        fetchStalls();
    }, []);

    const fetchStalls = async () => {
        try {
            setLoading(true);
            const { data } = await client.get("/stalls");
            setStalls(data);
        } catch (error) {
            toast.error("Failed to fetch stalls");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (stall: any) => {
        setEditingStall(stall);
        setFormData({
            stallName: stall.stallName,
            stallId: stall.stallId,
            ownerName: stall.ownerName,
            ownerMobile: stall.ownerMobile,
            ownerEmail: stall.ownerEmail || "",
            password: "", // Keep password empty on edit
            location: stall.location,
            address: stall.address,
            stallType: stall.stallType,
            operatingDates: stall.operatingDates || { from: "", to: "" }
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this stall? This will also remove the owner's access account.")) return;
        try {
            await client.delete(`/stalls/${id}`);
            toast.success("Stall deleted successfully");
            fetchStalls();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Delete failed");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStall) {
                await client.put(`/stalls/${editingStall._id}`, formData);
                toast.success("Stall updated successfully!");
            } else {
                const { data } = await client.post("/stalls", formData);
                toast.success("Stall created successfully!");
                alert(`Stall Created Successfully!\n\nID: ${data.stall.stallId}\nLogin Mobile: ${data.credentials.username}\nLogin Password: ${data.credentials.password}\n\nPlease share these credentials securely with the stall owner.`);
            }
            setShowAddModal(false);
            setEditingStall(null);
            fetchStalls();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Operation failed";
            toast.error("Database Error", {
                description: msg,
            });
        }
    };

    const resetForm = () => {
        setShowAddModal(false);
        setEditingStall(null);
        setFormData({
            stallName: "",
            stallId: "",
            ownerName: "",
            ownerMobile: "",
            ownerEmail: "",
            password: "",
            location: "",
            address: "",
            stallType: "Temporary",
            operatingDates: { from: "", to: "" }
        });
    };

    const filteredStalls = stalls.filter(s =>
        s.stallName.toLowerCase().includes(search.toLowerCase()) ||
        s.stallId.toLowerCase().includes(search.toLowerCase()) ||
        s.location.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-charcoal">Stall Management</h1>
                    <p className="text-muted-foreground mt-1 text-sm tracking-wide">Manage offline orchard stalls and owners</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowAddModal(true); }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl px-6 py-6 shadow-lg shadow-yellow-200 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" /> Add New Stall
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search stalls by name, ID or location..."
                        className="pl-10 h-12 rounded-xl bg-white border-charcoal/10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="h-64 bg-white/50 animate-pulse rounded-2xl border border-charcoal/5" />)
                ) : filteredStalls.map((stall) => (
                    <div key={stall._id} className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal/5 hover:shadow-xl hover:shadow-charcoal/5 transition-all group overflow-hidden relative">
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-12 w-12 bg-mango/10 rounded-2xl flex items-center justify-center text-mango">
                                <Store className="h-6 w-6" />
                            </div>
                            <div className="flex gap-2">
                                <Badge className={stall.status === 'Active' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-red-100 text-red-700'}>
                                    {stall.status}
                                </Badge>
                                <button
                                    onClick={() => handleDelete(stall._id)}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Stall"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-charcoal mb-1">{stall.stallName}</h3>
                        <p className="text-xs font-mono text-muted-foreground mb-4 uppercase tracking-tighter">{stall.stallId}</p>

                        <div className="space-y-3 pt-4 border-t border-charcoal/5">
                            <div className="flex items-center gap-3 text-sm text-charcoal/70">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{stall.ownerName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-charcoal/70">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{stall.ownerMobile}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-charcoal/70">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{stall.location}</span>
                            </div>
                            {stall.operatingDates?.from && (
                                <div className="flex items-center gap-3 text-sm text-charcoal/70">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{new Date(stall.operatingDates.from).toLocaleDateString()} - {new Date(stall.operatingDates.to).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 flex items-center gap-2 border-t border-charcoal/5">
                            <Button
                                onClick={() => handleEdit(stall)}
                                className="flex-1 rounded-xl h-10 text-xs font-bold bg-yellow-100 hover:bg-yellow-200 active:bg-yellow-300 text-black flex items-center justify-center gap-2 border-none shadow-none transition-colors"
                            >
                                <Edit3 className="h-3.5 w-3.5" /> Edit Details
                            </Button>
                            <Button
                                onClick={() => navigate("/admin/crm")}
                                className="flex-1 rounded-xl h-10 text-xs font-bold bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-black flex items-center justify-center gap-2 border-none shadow-none transition-colors"
                            >
                                <ArrowRight className="h-3.5 w-3.5" /> View CRM
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-charcoal/60 backdrop-blur-sm overflow-y-auto pt-12 md:pt-20">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 border border-charcoal/10 mb-20">
                        <div className="p-8 border-b border-charcoal/5 bg-yellow-50 relative">
                            {/* Decorative line at the very top to ensure clean edge */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-100/50" />
                            <h2 className="text-2xl font-display font-bold text-charcoal">{editingStall ? "Edit Stall" : "Create New Stall"}</h2>
                            <p className="text-muted-foreground text-sm tracking-wide mt-1">{editingStall ? "Update stall details" : "Setup a new offline location and owner account"}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60 ml-1">Stall Name</label>
                                    <Input
                                        required
                                        placeholder="e.g. Pune Highway Stall 1"
                                        className="h-12 rounded-xl"
                                        value={formData.stallName}
                                        onChange={(e) => setFormData({ ...formData, stallName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60 ml-1">Stall ID (Fixed)</label>
                                    <Input
                                        required
                                        disabled={!!editingStall}
                                        placeholder="e.g. ST-KOL-01"
                                        className={`h-12 rounded-xl font-mono uppercase ${editingStall ? 'bg-charcoal/5' : ''}`}
                                        value={formData.stallId}
                                        onChange={(e) => setFormData({ ...formData, stallId: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60 ml-1">Owner Name</label>
                                    <Input
                                        required
                                        placeholder="Full Name"
                                        className="h-12 rounded-xl"
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60 ml-1">Owner Mobile</label>
                                    <Input
                                        required
                                        disabled={!!editingStall}
                                        placeholder="Used for Login"
                                        className={`h-12 rounded-xl ${editingStall ? 'bg-charcoal/5' : ''}`}
                                        value={formData.ownerMobile}
                                        onChange={(e) => setFormData({ ...formData, ownerMobile: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60 ml-1">
                                        {editingStall ? "Change Login Password (Optional)" : "Set Login Password"}
                                    </label>
                                    <Input
                                        required={!editingStall}
                                        type="text"
                                        placeholder={editingStall ? "Keep empty to stay same" : "Create a password for owner login"}
                                        className="h-12 rounded-xl"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60 ml-1">City / Area</label>
                                    <Input
                                        required
                                        placeholder="e.g. Ratnagiri"
                                        className="h-12 rounded-xl"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60 ml-1">Stall Type</label>
                                    <select
                                        className="w-full h-12 rounded-xl border border-charcoal/10 bg-white px-3 font-body text-sm"
                                        value={formData.stallType}
                                        onChange={(e) => setFormData({ ...formData, stallType: e.target.value })}
                                    >
                                        <option value="Temporary">Temporary</option>
                                        <option value="Permanent">Permanent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60 ml-1">Full Address</label>
                                <textarea
                                    required
                                    className="w-full min-h-[100px] rounded-xl border border-charcoal/10 bg-white p-3 font-body text-sm focus:outline-none focus:ring-1 focus:ring-mango"
                                    placeholder="Detailed navigation instructions..."
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1 rounded-xl h-12 font-bold text-charcoal"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl h-12 font-bold shadow-lg shadow-yellow-100"
                                >
                                    {editingStall ? "Update Stall" : "Create Stall"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStalls;
