import { useState, useEffect } from "react";
import {
    Users,
    PlusCircle,
    Smartphone,
    Package,
    Store,
    ShoppingBag,
    Mail,
    Leaf,
    RefreshCw,
    Edit3,
    Trash2,
    Plus,
    X,
    Check,
    Pencil,
} from "lucide-react";
import client from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const badgeOptions = [
    "Best Seller",
    "Most Popular",
    "Recommended",
    "Premium Quality",
    "Limited Stock",
    "Hot Deal",
    "Trending",
    "Seasonal Pick",
    "Editor's Choice"
];

const StallOwnerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [stallData, setStallData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'summary' | 'crm' | 'mangoes'>('summary');

    // Customer state
    const [customerForm, setCustomerForm] = useState({
        name: "",
        mobile: "",
        email: "",
        purchasedVariety: "",
        purchasedQuantity: "",
        consent: true,
        notes: ""
    });

    // Mango state
    const [mangoes, setMangoes] = useState<any[]>([]);
    const [globalTemplates, setGlobalTemplates] = useState<any[]>([]);
    const [adminProducts, setAdminProducts] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [mangoForm, setMangoForm] = useState({
        variety: "",
        ripeningType: "Natural",
        price: "",
        priceUnit: "per kg",
        quantity: "",
        qualityGrade: "A",
        status: "In Stock",
        mrp: "",
        showDiscount: false,
        discountLabel: "",
        description: "",
        showBadge: false,
        badgeType: "custom",
        badge: ""
    });
    const [editingMangoId, setEditingMangoId] = useState<string | null>(null);

    useEffect(() => {
        fetchStallContext();
    }, []);

    const fetchStallContext = async () => {
        try {
            setLoading(true);
            if (!user?.assignedStall) return;

            const stallRes = await client.get(`/stalls/${user.assignedStall}`);
            setStallData(stallRes.data);

            const [crmRes, mangoRes, templatesRes, productsRes] = await Promise.all([
                client.get("/crm/customers"),
                client.get("/stall-mangoes"),
                client.get("/stall-mangoes/templates"),
                client.get("/products")
            ]);

            const customers = crmRes.data;
            const myMangoes = mangoRes.data;
            const allProducts = productsRes.data;

            const today = new Date().toDateString();
            const todayCustomers = customers.filter((c: any) => new Date(c.createdAt).toDateString() === today);

            const totalStock = myMangoes.reduce((acc: number, m: any) => acc + (m.quantity || 0), 0);

            setStats({
                customerCount: customers.length,
                todayCustomers: todayCustomers.length,
                totalVarieties: myMangoes.length,
                availableStock: totalStock
            });

            setMangoes(myMangoes);
            setGlobalTemplates(templatesRes.data);
            setAdminProducts(allProducts);

        } catch (error) {
            toast.error("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post("/crm/customers", {
                ...customerForm,
                purchasedQuantity: customerForm.purchasedQuantity ? Number(customerForm.purchasedQuantity) : undefined,
                stallObjectId: stallData?._id,
                stallId: stallData?.stallId
            });
            toast.success("Customer added successfully!");
            setCustomerForm({ name: "", mobile: "", email: "", purchasedVariety: "", purchasedQuantity: "", consent: true, notes: "" });
            fetchStallContext();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add customer");
        }
    };

    const handleMangoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...mangoForm,
                price: Number(mangoForm.price),
                quantity: Number(mangoForm.quantity),
            };

            if (editingMangoId) {
                await client.put(`/stall-mangoes/${editingMangoId}`, payload);
                toast.success("Mango updated successfully!");
            } else {
                await client.post("/stall-mangoes", payload);
                toast.success("Mango added successfully!");
            }
            setShowForm(false);
            setMangoForm({
                variety: "", ripeningType: "Natural", price: "", priceUnit: "per kg", quantity: "", qualityGrade: "A", status: "In Stock",
                mrp: "", showDiscount: false, discountLabel: "", description: "", showBadge: false, badgeType: "custom", badge: ""
            });
            setEditingMangoId(null);
            fetchStallContext();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save mango");
        }
    };

    const openCreateMango = () => {
        setEditingMangoId(null);
        setMangoForm({
            variety: "", ripeningType: "Natural", price: "", priceUnit: "per kg", quantity: "", qualityGrade: "A", status: "In Stock",
            mrp: "", showDiscount: false, discountLabel: "", description: "", showBadge: false, badgeType: "custom", badge: ""
        });
        setShowForm(true);
    };

    const handleEditMango = (mango: any) => {
        setMangoForm({
            variety: mango.variety,
            ripeningType: mango.ripeningType,
            price: String(mango.price),
            priceUnit: mango.priceUnit,
            quantity: String(mango.quantity),
            qualityGrade: mango.qualityGrade,
            status: mango.status,
            mrp: mango.mrp ? String(mango.mrp) : "",
            showDiscount: mango.showDiscount || false,
            discountLabel: mango.discountLabel || "",
            description: mango.description || "",
            showBadge: mango.showBadge || false,
            badgeType: mango.badgeType || "custom",
            badge: mango.badge || ""
        });
        setEditingMangoId(mango._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDeleteMango = async (id: string) => {
        if (!confirm("Are you sure you want to remove this mango from your stall?")) return;
        try {
            await client.delete(`/stall-mangoes/${id}`);
            toast.success("Mango removed successfully");
            fetchStallContext();
        } catch (error) {
            toast.error("Failed to remove mango");
        }
    };

    if (loading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading Stall Hub...</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <div className="bg-gradient-to-br from-yellow-200 via-yellow-100 to-green-100 p-8 rounded-[2.5rem] text-black shadow-lg shadow-yellow-200/50 border border-yellow-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Leaf className="h-32 w-32 text-green-700" />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge className="bg-green-600 hover:bg-green-700 text-white border-none mb-3 px-3 py-1 font-bold tracking-widest text-[10px] uppercase shadow-sm">Official Stall Owner</Badge>
                            <h1 className="text-4xl font-display font-black mb-2 text-green-950">{stallData?.stallName}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-green-800 text-sm font-semibold">
                                <span className="flex items-center gap-1.5"><Store className="h-4 w-4" /> {stallData?.stallId}</span>
                                <span className="flex items-center gap-1.5"><Smartphone className="h-4 w-4" /> {stallData?.ownerMobile}</span>
                            </div>
                        </div>
                        <Badge variant="outline" className={`px-4 py-2 uppercase tracking-widest font-black ${stallData?.status === 'Active' ? 'border-green-600 text-green-700 bg-green-50' : 'border-red-600 text-red-700 bg-red-50'}`}>
                            {stallData?.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="flex border-b border-border mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'summary' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('mangoes')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'mangoes' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
                >
                    Stock Manager
                </button>
                <button
                    onClick={() => setActiveTab('crm')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'crm' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
                >
                    Customer Entry
                </button>
            </div>

            {activeTab === 'summary' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-charcoal/5 shadow-sm">
                        <Package className="h-6 w-6 text-mango mb-4" />
                        <p className="text-3xl font-black text-charcoal">{stats?.totalVarieties || 0}</p>
                        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mt-2">Mango Varieties</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-charcoal/5 shadow-sm">
                        <ShoppingBag className="h-6 w-6 text-blue-500 mb-4" />
                        <p className="text-3xl font-black text-blue-600">{stats?.availableStock || 0}</p>
                        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mt-2">Available Stock</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-charcoal/5 shadow-sm">
                        <Users className="h-6 w-6 text-green-500 mb-4" />
                        <p className="text-3xl font-black text-green-600">{stats?.customerCount || 0}</p>
                        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mt-2">Total Contacts Formed</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-charcoal/5 shadow-sm">
                        <PlusCircle className="h-6 w-6 text-orange-500 mb-4" />
                        <p className="text-3xl font-black text-orange-600">{stats?.todayCustomers || 0}</p>
                        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mt-2">Today's Contacts</p>
                    </div>
                </div>
            )}

            {activeTab === 'mangoes' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="font-display text-3xl font-semibold text-foreground">Stock Manager</h2>
                            <p className="font-body text-muted-foreground mt-1">Manage your stall's available mango varieties</p>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={openCreateMango} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add Product
                            </Button>
                        </div>
                    </div>

                    {showForm && (
                        <div className="mb-8 bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-display text-xl font-semibold">{editingMangoId ? "Edit Stock Entry" : "New Stock Entry"}</h2>
                                <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleMangoSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Variety Name</label>
                                        <select
                                            required
                                            className="w-full h-10 rounded-xl bg-white border border-input px-3 font-medium text-sm"
                                            value={mangoForm.variety}
                                            onChange={(e) => setMangoForm({ ...mangoForm, variety: e.target.value })}
                                            disabled={!!editingMangoId}
                                        >
                                            <option value="" disabled>Select variety...</option>
                                            {adminProducts.map(p => (
                                                <option key={p._id} value={p.variety}>{p.name} ({p.variety})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Selling Price ₹</label>
                                        <Input
                                            required
                                            type="number"
                                            placeholder="899"
                                            value={mangoForm.price}
                                            onChange={(e) => setMangoForm({ ...mangoForm, price: e.target.value })}
                                            className="h-10 rounded-xl font-bold bg-[#FEF3C7] text-yellow-900 border-yellow-400 focus:border-yellow-500 placeholder:text-yellow-700/50"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Price Unit</label>
                                        <select
                                            className="w-full h-10 rounded-xl bg-white border border-input px-3 font-medium text-sm"
                                            value={mangoForm.priceUnit}
                                            onChange={(e) => setMangoForm({ ...mangoForm, priceUnit: e.target.value })}
                                        >
                                            <option value="per kg">per kg</option>
                                            <option value="per box">per box</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Available Quantity (Stock)</label>
                                        <Input
                                            required
                                            type="number"
                                            placeholder="50"
                                            value={mangoForm.quantity}
                                            onChange={(e) => setMangoForm({ ...mangoForm, quantity: e.target.value })}
                                            className="h-10 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                                        <select
                                            className="w-full h-10 rounded-xl bg-white border border-input px-3 font-medium text-sm"
                                            value={mangoForm.status}
                                            onChange={(e) => setMangoForm({ ...mangoForm, status: e.target.value })}
                                        >
                                            <option value="In Stock">In Stock</option>
                                            <option value="Sold Out">Sold Out</option>
                                        </select>
                                    </div>

                                    {/* Locked Fields UI */}
                                    <div className="space-y-1 opacity-50 cursor-not-allowed">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ripening Type</label>
                                        <Input disabled value="Natural" className="h-10 rounded-xl cursor-not-allowed bg-muted" />
                                    </div>
                                    <div className="space-y-1 opacity-50 cursor-not-allowed">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quality Grade</label>
                                        <Input disabled value="A" className="h-10 rounded-xl cursor-not-allowed bg-muted" />
                                    </div>
                                    <div className="space-y-1 opacity-50 cursor-not-allowed hidden sm:block">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Stall ID</label>
                                        <Input disabled value={stallData?.stallId || "Auto"} className="h-10 rounded-xl cursor-not-allowed bg-[hsl(44,50%,95%)]" />
                                    </div>

                                </div>

                                {/* Pricing Section */}
                                <div className="bg-[#FEFCE8] p-4 rounded-xl space-y-4 border border-[hsl(44,80%,46%)]/30">
                                    <h3 className="font-semibold text-sm text-black uppercase tracking-wider">Pricing & Discounts</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1 relative">
                                            <label className="text-xs font-medium text-black uppercase tracking-wider">Base Price (MRP) ₹</label>
                                            <Input
                                                type="number"
                                                placeholder="1000"
                                                value={mangoForm.mrp}
                                                onChange={(e) => {
                                                    const newMrp = e.target.value;
                                                    let newDiscountLabel = mangoForm.discountLabel;
                                                    if (newMrp && mangoForm.price && Number(newMrp) > Number(mangoForm.price)) {
                                                        newDiscountLabel = String(Math.round(((Number(newMrp) - Number(mangoForm.price)) / Number(newMrp)) * 100));
                                                    }
                                                    setMangoForm((f) => ({ ...f, mrp: newMrp, discountLabel: newDiscountLabel }));
                                                }}
                                                className="h-10 rounded-xl bg-white border-yellow-200"
                                            />
                                            <p className="text-[10px] text-muted-foreground">Original price before discount.</p>
                                        </div>

                                        <div className="space-y-1 relative">
                                            <label className="text-xs font-medium text-black uppercase tracking-wider">Selling Price ₹</label>
                                            <Input
                                                type="number"
                                                placeholder="899"
                                                value={mangoForm.price}
                                                onChange={(e) => {
                                                    const newPrice = e.target.value;
                                                    let newDiscountLabel = mangoForm.discountLabel;
                                                    if (mangoForm.mrp && newPrice && Number(mangoForm.mrp) > Number(newPrice)) {
                                                        newDiscountLabel = String(Math.round(((Number(mangoForm.mrp) - Number(newPrice)) / Number(mangoForm.mrp)) * 100));
                                                    }
                                                    setMangoForm((f) => ({ ...f, price: newPrice, discountLabel: newDiscountLabel }));
                                                }}
                                                className="h-10 rounded-xl font-bold bg-[#FEF3C7] text-yellow-900 border-yellow-400 focus:border-yellow-500 placeholder:text-yellow-700/50"
                                            />
                                            <p className="text-[10px] text-muted-foreground">Customers will pay this amount.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-yellow-200">
                                            <Switch checked={mangoForm.showDiscount} onCheckedChange={(v) => setMangoForm((f) => ({ ...f, showDiscount: v }))} id="show-discount" />
                                            <label htmlFor="show-discount" className="text-sm font-medium cursor-pointer text-black">Show Discount Badge</label>
                                        </div>
                                    </div>

                                    {mangoForm.showDiscount && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-medium text-black uppercase tracking-wider">Discount Label</label>
                                                    {Number(mangoForm.mrp) > Number(mangoForm.price) && Number(mangoForm.mrp) > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const percent = Math.round(((Number(mangoForm.mrp) - Number(mangoForm.price)) / Number(mangoForm.mrp)) * 100);
                                                                setMangoForm(f => ({ ...f, discountLabel: String(percent) }));
                                                            }}
                                                            className="text-[10px] text-green-700 hover:underline font-medium cursor-pointer"
                                                        >
                                                            Auto-apply {Math.round(((Number(mangoForm.mrp) - Number(mangoForm.price)) / Number(mangoForm.mrp)) * 100)}% OFF
                                                        </button>
                                                    )}
                                                </div>
                                                <Input
                                                    placeholder="e.g. 30 (for 30% OFF), Special Price"
                                                    value={mangoForm.discountLabel}
                                                    onChange={(e) => setMangoForm((f) => ({ ...f, discountLabel: e.target.value }))}
                                                    className="h-10 rounded-xl bg-white border-yellow-200"
                                                />
                                                <div className="text-xs text-muted-foreground pt-1 flex items-center gap-2">
                                                    <span>Preview:</span>
                                                    {mangoForm.discountLabel ? (
                                                        <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                                            {/^\d+$/.test(mangoForm.discountLabel) ? `${mangoForm.discountLabel}% OFF` : mangoForm.discountLabel}
                                                        </span>
                                                    ) : (
                                                        <span className="italic opacity-50">No label</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-black uppercase tracking-wider">Description</label>
                                        <Input
                                            placeholder="Short description..."
                                            value={mangoForm.description}
                                            onChange={(e) => setMangoForm((f) => ({ ...f, description: e.target.value }))}
                                            className="h-10 rounded-xl border-border"
                                        />
                                    </div>

                                    {/* Product Badge Section */}
                                    <div className="space-y-4 border border-[hsl(44,80%,46%)]/30 bg-[#FEFCE8] p-4 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-sm text-black uppercase tracking-wider">Product Badge</h3>
                                            <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg border border-yellow-200">
                                                <label htmlFor="show-badge" className={`text-xs font-medium cursor-pointer transition-colors ${mangoForm.showBadge ? "text-black" : "text-muted-foreground"}`}>
                                                    {mangoForm.showBadge ? "Badge ON" : "Badge OFF"}
                                                </label>
                                                <Switch checked={mangoForm.showBadge} onCheckedChange={(v) => setMangoForm((f) => ({ ...f, showBadge: v }))} id="show-badge" />
                                            </div>
                                        </div>

                                        {mangoForm.showBadge && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
                                                <div className="flex p-1 bg-white border border-yellow-200 rounded-lg w-fit">
                                                    <button
                                                        type="button"
                                                        onClick={() => setMangoForm(f => ({ ...f, badgeType: 'preset' }))}
                                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mangoForm.badgeType === 'preset' ? "bg-[hsl(44,80%,46%)]/20 text-[#a38000] shadow-sm" : "text-muted-foreground hover:text-black"}`}
                                                    >
                                                        Select Preset
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setMangoForm(f => ({ ...f, badgeType: 'custom' }))}
                                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mangoForm.badgeType === 'custom' ? "bg-[hsl(44,80%,46%)]/20 text-[#a38000] shadow-sm" : "text-muted-foreground hover:text-black"}`}
                                                    >
                                                        Custom Text
                                                    </button>
                                                </div>

                                                {mangoForm.badgeType === 'preset' && (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                        {badgeOptions.map((opt) => (
                                                            <button
                                                                key={opt}
                                                                type="button"
                                                                onClick={() => setMangoForm(f => ({ ...f, badge: opt }))}
                                                                className={`text-xs py-2 px-3 rounded-lg border transition-all text-left truncate ${mangoForm.badge === opt
                                                                    ? "border-green-600 bg-green-50 text-green-700 font-bold"
                                                                    : "border-yellow-200 bg-white text-muted-foreground hover:border-[hsl(44,80%,46%)] hover:text-black"
                                                                    }`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {mangoForm.badgeType === 'custom' && (
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-medium text-black uppercase tracking-wider">Custom Badge Text</label>
                                                        <Input
                                                            placeholder="e.g. Farm Fresh"
                                                            value={mangoForm.badge}
                                                            onChange={(e) => setMangoForm((f) => ({ ...f, badge: e.target.value }))}
                                                            className="h-10 rounded-xl bg-white border-yellow-200"
                                                        />
                                                    </div>
                                                )}

                                                <div className="text-xs text-muted-foreground pt-2 border-t border-yellow-200 flex items-center gap-2">
                                                    <span>Preview:</span>
                                                    {mangoForm.badge ? (
                                                        <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                                            {mangoForm.badge}
                                                        </span>
                                                    ) : (
                                                        <span className="italic opacity-50">No text selected</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <Button type="submit" className="bg-[#cca300] hover:bg-[#b38f00] text-white rounded-full px-6 shadow-md transition-colors flex items-center gap-2">
                                        <Check className="h-4 w-4" />
                                        {editingMangoId ? 'Save Changes' : 'Create Product'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-full px-6 border-muted-foreground/20 hover:bg-muted font-medium text-foreground">
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-4">
                        {mangoes.length === 0 && (
                            <div className="p-12 text-center font-body text-muted-foreground">
                                No mangoes added to your stall yet.
                            </div>
                        )}
                        {mangoes.map(mango => (
                            <div key={mango._id} className="bg-card rounded-xl border border-border p-6 flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                                        <h3 className="font-display text-lg font-semibold text-foreground">{mango.variety}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-body ${mango.status === 'In Stock' ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground opacity-60 italic"}`}>
                                            {mango.status}
                                        </span>
                                    </div>
                                    <p className="font-body text-sm text-muted-foreground">Grade: {mango.qualityGrade} · {mango.ripeningType}</p>
                                    <div className="flex items-center gap-6 mt-2 font-body text-sm">
                                        <span className="text-foreground font-medium">₹{mango.price} {mango.priceUnit}</span>
                                        <span className={`${mango.quantity < 10 ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                                            {mango.quantity} in stock{mango.quantity < 10 && mango.quantity > 0 ? " ⚠️ Low" : mango.quantity === 0 ? " — Out of stock" : ""}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Button variant="outline" size="icon" onClick={() => handleEditMango(mango)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700 hover:border-red-300" onClick={() => handleDeleteMango(mango._id)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'crm' && (
                <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-charcoal/5">
                    <div className="bg-mango p-8 text-black relative flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-display font-bold">New Customer Entry</h2>
                            <p className="text-black/80 text-sm font-medium mt-1">Capture details to send discount offers via WhatsApp</p>
                        </div>
                        <div className="h-14 w-14 bg-black/10 rounded-2xl flex items-center justify-center">
                            <Users className="h-8 w-8 text-black" />
                        </div>
                    </div>

                    <form onSubmit={handleAddCustomer} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-charcoal/40 ml-1">Customer Name *</label>
                                <Input
                                    required
                                    placeholder="E.g. Rajesh Kumar"
                                    className="h-14 rounded-2xl bg-charcoal/5 border-none focus:ring-2 focus:ring-mango text-lg font-bold"
                                    value={customerForm.name}
                                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-charcoal/40 ml-1">Mobile Number *</label>
                                <Input
                                    required
                                    type="tel"
                                    placeholder="10 Digit Number"
                                    className="h-14 rounded-2xl bg-charcoal/5 border-none focus:ring-2 focus:ring-mango text-lg font-bold"
                                    value={customerForm.mobile}
                                    onChange={(e) => setCustomerForm({ ...customerForm, mobile: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-charcoal/40 ml-1">Email ID (Optional)</label>
                                <Input
                                    type="email"
                                    placeholder="rajesh@example.com"
                                    className="h-14 rounded-2xl bg-charcoal/5 border-none focus:ring-2 focus:ring-mango text-lg font-bold"
                                    value={customerForm.email}
                                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-charcoal/40 ml-1">Variety (Optional)</label>
                                    <div className="relative">
                                        <Input
                                            list="bought-varieties"
                                            placeholder="Variety"
                                            className="h-14 rounded-2xl bg-charcoal/5 border-none focus:ring-2 focus:ring-mango text-lg font-bold"
                                            value={customerForm.purchasedVariety}
                                            onChange={(e) => setCustomerForm({ ...customerForm, purchasedVariety: e.target.value })}
                                        />
                                        <datalist id="bought-varieties">
                                            {mangoes.map(m => <option key={m._id} value={m.variety} />)}
                                        </datalist>
                                    </div>
                                </div>
                                <div className="w-1/3 space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-charcoal/40 ml-1">Qty</label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        className="h-14 rounded-2xl bg-charcoal/5 border-none focus:ring-2 focus:ring-mango text-lg font-bold"
                                        value={customerForm.purchasedQuantity}
                                        onChange={(e) => setCustomerForm({ ...customerForm, purchasedQuantity: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200">
                            <label className="flex items-center gap-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="h-6 w-6 rounded-lg accent-green-600 border-green-600"
                                    checked={customerForm.consent}
                                    onChange={(e) => setCustomerForm({ ...customerForm, consent: e.target.checked })}
                                />
                                <div className="space-y-0.5">
                                    <p className="font-bold text-black">Get Consent for Updates</p>
                                    <p className="text-xs text-muted-foreground">Customer agrees to receive seasonal mango offers on WhatsApp/SMS</p>
                                </div>
                            </label>
                        </div>

                        <Button type="submit" className="w-full h-16 bg-[#cca300] hover:bg-[#b38f00] text-white rounded-2xl font-black text-xl shadow-xl shadow-yellow-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                            <PlusCircle className="h-6 w-6" /> Save Customer Record
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default StallOwnerDashboard;
