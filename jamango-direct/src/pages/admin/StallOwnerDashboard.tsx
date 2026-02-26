import { useState, useEffect } from "react";
import {
    Users,
    PlusCircle,
    Smartphone,
    Package,
    Store,
    ShoppingBag,
    RefreshCw,
    Trash2,
    Plus,
    X,
    Check,
    Pencil,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    LayoutDashboard,
    AlertCircle,
    History,
    CheckCircle2,
    Eye,
    Calendar,
    Search,
    MessageSquare,
    Phone,
    PlusSquare,
    MapPin,
    Leaf,
    Lock,
    ShieldAlert
} from "lucide-react";
import client from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
    const { user, isImpersonating, stopImpersonating } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [stallData, setStallData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'summary' | 'crm' | 'mangoes' | 'customer_list'>('summary');

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
    const [customers, setCustomers] = useState<any[]>([]);
    const [globalTemplates, setGlobalTemplates] = useState<any[]>([]);
    const [adminProducts, setAdminProducts] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [searchCRM, setSearchCRM] = useState("");
    const [mangoForm, setMangoForm] = useState({
        variety: "",
        ripeningType: "Natural",
        price: "",
        priceUnit: "per kg",
        weight: 3,
        quantity: "",
        qualityGrade: "A",
        status: "In Stock",
        mrp: "",
        showDiscount: false,
        discountLabel: "",
        description: "",
        showBadge: false,
        badgeType: "custom",
        badge: "",
        image: ""
    });
    const [editingMangoId, setEditingMangoId] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

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

            const customerList = crmRes.data;
            const myMangoes = mangoRes.data;
            const allProducts = productsRes.data;

            const today = new Date().toDateString();
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = yesterdayDate.toDateString();

            const todayCustomers = customerList.filter((c: any) => new Date(c.createdAt).toDateString() === today);
            const yesterdayCustomers = customerList.filter((c: any) => new Date(c.createdAt).toDateString() === yesterdayStr);

            const totalStock = myMangoes.reduce((acc: number, m: any) => acc + (m.quantity || 0), 0);

            setStats({
                customerCount: customerList.length,
                todayCustomers: todayCustomers.length,
                customerTrend: todayCustomers.length - yesterdayCustomers.length,
                totalVarieties: myMangoes.length,
                availableStock: totalStock,
                lowStockCount: myMangoes.filter((m: any) => m.quantity < 10 && m.quantity > 0).length
            });

            setCustomers(customerList);
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
                variety: "", ripeningType: "Natural", price: "", priceUnit: "per kg", weight: 3, quantity: "", qualityGrade: "A", status: "In Stock",
                mrp: "", showDiscount: false, discountLabel: "", description: "", showBadge: false, badgeType: "custom", badge: "", image: ""
            });
            setEditingMangoId(null);
            fetchStallContext();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save mango");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("image", file);
        try {
            setUploadingImage(true);
            const res = await client.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
            setMangoForm(f => ({ ...f, image: res.data }));
        } catch (err) {
            toast.error("Image upload failed");
        } finally {
            setUploadingImage(false);
        }
    };

    const openCreateMango = () => {
        setEditingMangoId(null);
        setActiveTab('mangoes');
        setMangoForm({
            variety: "", ripeningType: "Natural", price: "", priceUnit: "per kg", weight: 3, quantity: "", qualityGrade: "A", status: "In Stock",
            mrp: "", showDiscount: false, discountLabel: "", description: "", showBadge: false, badgeType: "custom", badge: "", image: ""
        });
        setShowForm(true);
        window.scrollTo({ top: 400, behavior: "smooth" });
    };

    const handleEditMango = (mango: any) => {
        setMangoForm({
            variety: mango.variety,
            ripeningType: mango.ripeningType,
            price: String(mango.price),
            priceUnit: mango.priceUnit,
            weight: mango.weight || 3,
            quantity: String(mango.quantity),
            qualityGrade: mango.qualityGrade,
            status: mango.status,
            mrp: mango.mrp ? String(mango.mrp) : "",
            showDiscount: mango.showDiscount || false,
            discountLabel: mango.discountLabel || "",
            description: mango.description || "",
            showBadge: mango.showBadge || false,
            badgeType: mango.badgeType || "custom",
            badge: mango.badge || "",
            image: mango.image || ""
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

    const getStockStatus = (mango: any) => {
        if (mango.status === 'Sold Out' || Number(mango.quantity) <= 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-50 border-red-200' };
        if (Number(mango.quantity) < 20) return { label: 'Low Stock', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
        return { label: 'In Stock', color: 'text-green-700 bg-green-50 border-green-200' };
    };

    if (loading) return <div className="p-12 text-center text-muted-foreground animate-pulse font-display">Preparing your Hub...</div>;

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchCRM.toLowerCase()) ||
        c.mobile.includes(searchCRM)
    );

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20 px-4 sm:px-0">
            {/* Locked Stall Warning Banner */}
            {stallData?.isLocked && (
                <div className="bg-amber-600 text-white px-6 py-4 rounded-[1.5rem] flex items-center justify-between shadow-lg shadow-amber-600/20 animate-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-display font-black text-lg leading-none uppercase tracking-tight">Stall is Locked</p>
                            <p className="text-xs font-medium text-white/80 mt-1">Administrator has set your stall to Read-Only mode. Editing is restricted.</p>
                        </div>
                    </div>
                    <ShieldAlert className="h-8 w-8 opacity-20" />
                </div>
            )}

            {/* 1. Stall Header Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-charcoal/5 border border-charcoal/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110 duration-500">
                    <Store className="h-40 w-40 text-mango" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-display font-black text-charcoal">{stallData?.stallName}</h1>
                            <Badge className={`${stallData?.status === 'Active' ? 'bg-green-500' : 'bg-red-500'} text-white border-none px-2 py-0.5 text-[10px] font-black uppercase tracking-widest`}>
                                {stallData?.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground tracking-wide">
                            <span className="flex items-center gap-1.5"><Store className="h-3.5 w-3.5 text-mango" /> {stallData?.stallId}</span>
                            <span className="flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5 text-mango" /> {stallData?.ownerMobile}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-mango" /> {stallData?.location}</span>
                        </div>

                        {/* 1c. Performance Indicator */}
                        <div className="pt-4 flex items-center gap-2">
                            {stats?.lowStockCount > 0 && (
                                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600 flex items-center gap-1.5 animate-pulse">
                                    <AlertCircle className="h-3 w-3" /> {stats?.lowStockCount} items Low Stock
                                </Badge>
                            )}
                            <Badge variant="outline" className="border-green-100 bg-green-50 text-green-700 font-bold">
                                Today's Growth: {stats?.todayCustomers || 0} Customers
                            </Badge>
                        </div>
                    </div>

                    {/* 1a. Quick Actions */}
                    <div className="flex flex-wrap gap-3">
                        {isImpersonating && (
                            <Button
                                onClick={() => {
                                    stopImpersonating();
                                    navigate("/admin/stalls");
                                }}
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white rounded-2xl gap-2 h-10 px-4 font-bold transition-all shadow-md shadow-red-600/20"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Return to Admin
                            </Button>
                        )}
                        <Button
                            onClick={openCreateMango}
                            disabled={!stallData || stallData.isLocked}
                            size="sm"
                            className="bg-[#2D4F1E] hover:bg-[#1E3A14] disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-2xl gap-2 h-10 px-4 font-medium transition-all"
                        >
                            <PlusSquare className="h-3.5 w-3.5" />
                            <span>{stallData?.isLocked ? 'Locked' : 'Add Inventory'}</span>
                        </Button>
                        <Button
                            onClick={() => setActiveTab('crm')}
                            disabled={!stallData}
                            size="sm"
                            className="bg-white hover:bg-charcoal disabled:bg-gray-100 disabled:text-gray-400 text-charcoal hover:text-white rounded-2xl gap-2 h-10 px-5 font-bold shadow-md shadow-charcoal/5 transition-all border border-charcoal/10"
                        >
                            <Users className="h-4 w-4" />
                            <span>New Customer</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs - Navigation & UX Flow */}
            <div className="flex p-1.5 bg-charcoal/5 rounded-2xl w-full max-w-md mx-auto sticky top-4 z-40 backdrop-blur-md border border-white/40 shadow-sm">
                {(['summary', 'mangoes', 'customer_list'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === tab
                            ? 'bg-white text-charcoal shadow-md scale-100'
                            : 'text-muted-foreground hover:text-charcoal scale-95'
                            }`}
                    >
                        {tab === 'summary' && <LayoutDashboard className="h-3.5 w-3.5" />}
                        {tab === 'mangoes' && <Package className="h-3.5 w-3.5" />}
                        {tab === 'customer_list' && <Users className="h-3.5 w-3.5" />}
                        {tab === 'summary' ? 'Overview' : tab === 'mangoes' ? 'Stock' : 'CRM'}
                    </button>
                ))}
            </div>

            {/* 2. Dashboard Metrics Cards */}
            {activeTab === 'summary' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-charcoal/5 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-10 w-10 bg-mango/10 rounded-xl flex items-center justify-center text-mango">
                                    <Leaf className="h-5 w-5" />
                                </div>
                                <Badge variant="outline" className="border-charcoal/5 text-[9px] font-black uppercase opacity-40 group-hover:opacity-100">Live</Badge>
                            </div>
                            <p className="text-4xl font-black text-charcoal">{stats?.totalVarieties || 0}</p>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mt-2">Active Varieties</p>
                        </div>

                        <div
                            onClick={() => setActiveTab('mangoes')}
                            className="bg-white p-6 rounded-3xl border border-charcoal/5 shadow-sm hover:shadow-md hover:bg-yellow-400 transition-all duration-300 cursor-pointer group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                    <ShoppingBag className="h-5 w-5" />
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </div>
                            <p className="text-4xl font-black text-blue-600">{stats?.availableStock || 0}</p>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mt-2">Available Stock</p>
                            {/* 2a. Trend Indicator */}
                            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                <History className="h-3 w-3" /> Updated just now
                            </div>
                        </div>

                        <div
                            onClick={() => setActiveTab('customer_list')}
                            className="bg-white p-6 rounded-3xl border border-charcoal/5 shadow-sm hover:shadow-md hover:bg-yellow-400 transition-all duration-300 cursor-pointer group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                                    <Users className="h-5 w-5" />
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </div>
                            <p className="text-4xl font-black text-green-600">{stats?.customerCount || 0}</p>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mt-2">Total Contacts</p>
                        </div>

                        <div
                            onClick={() => setActiveTab('customer_list')}
                            className="bg-white p-6 rounded-3xl border border-charcoal/5 shadow-sm hover:shadow-md hover:bg-yellow-400 transition-all duration-300 cursor-pointer group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                {stats?.customerTrend > 0 ? (
                                    <Badge className="bg-green-500 text-white border-none py-0 px-1.5 text-[9px] font-black">+{stats?.customerTrend}</Badge>
                                ) : stats?.customerTrend < 0 ? (
                                    <Badge className="bg-red-500 text-white border-none py-0 px-1.5 text-[9px] font-black">{stats?.customerTrend}</Badge>
                                ) : null}
                            </div>
                            <p className="text-4xl font-black text-orange-600">{stats?.todayCustomers || 0}</p>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mt-2">Today's Leads</p>
                            {/* 2a. Trend Context */}
                            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-green-600">
                                <TrendingUp className="h-3 w-3" /> Growing your base
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Stock Manager Section */}
            {activeTab === 'mangoes' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-display font-black text-charcoal">Inventory Console</h2>
                        <Button
                            onClick={openCreateMango}
                            disabled={stallData?.isLocked}
                            className="bg-[#2D4F1E] hover:bg-[#1E3A14] text-white font-medium rounded-2xl px-6 h-12 shadow-lg shadow-green-900/5 transition-all disabled:opacity-50"
                        >
                            <Plus className="h-5 w-5 mr-2" /> {stallData?.isLocked ? 'Inventory Locked' : 'Add Mango Stock'}
                        </Button>
                    </div>

                    {showForm && !stallData?.isLocked && (
                        <div className="p-8 bg-white rounded-[2rem] border-2 border-charcoal/5 shadow-2xl relative animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-display font-bold text-charcoal">{editingMangoId ? "Edit Variety" : "List New Variety"}</h3>
                                    <p className="text-sm text-muted-foreground">Keep your stock data fresh for the season</p>
                                </div>
                                <button onClick={() => setShowForm(false)} className="h-10 w-10 bg-charcoal/5 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleMangoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-charcoal/40 ml-1">Mango Variety</label>
                                        <select
                                            required
                                            className="w-full h-14 rounded-2xl bg-gray-100 border border-gray-200 px-4 font-bold text-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                                            value={mangoForm.variety}
                                            onChange={(e) => setMangoForm({ ...mangoForm, variety: e.target.value })}
                                            disabled={!!editingMangoId}
                                        >
                                            <option value="" disabled>Choose Variety...</option>
                                            {adminProducts.map(p => (
                                                <option key={p._id} value={p.variety}>{p.variety}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-charcoal/40 ml-1">Variety Image</label>
                                        <div className="flex gap-2 items-center">
                                            <Input 
                                               type="file" 
                                               accept="image/*" 
                                               onChange={handleImageUpload} 
                                               disabled={uploadingImage} 
                                               className="h-10 rounded-xl bg-white flex-1 relative file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-mango/20 file:text-mango-deep hover:file:bg-mango/40 transition-all cursor-pointer" 
                                            />
                                            {uploadingImage && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
                                        </div>
                                        {mangoForm.image && <div className="text-[10px] text-green-600 flex items-center gap-1 mt-1 font-bold"><Check className="h-3 w-3" /> Image Uploaded</div>}
                                    </div>

                                    <div className={`grid ${mangoForm.priceUnit === 'per box' ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-charcoal/40 ml-1">Price per {mangoForm.priceUnit === 'per box' ? `${mangoForm.weight}KG Box` : 'KG'}</label>
                                            <Input
                                                required
                                                type="number"
                                                className="h-14 rounded-2xl bg-gray-100 border border-gray-200 font-black text-xl px-4"
                                                value={mangoForm.price}
                                                onChange={(e) => setMangoForm({ ...mangoForm, price: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-charcoal/40 ml-1">Selling Unit</label>
                                            <select
                                                className="w-full h-14 rounded-2xl bg-gray-100 border border-gray-200 px-4 font-bold"
                                                value={mangoForm.priceUnit}
                                                onChange={(e) => setMangoForm({ ...mangoForm, priceUnit: e.target.value })}
                                            >
                                                <option value="per kg">per KG</option>
                                                <option value="per box">per Box</option>
                                            </select>
                                        </div>
                                        {mangoForm.priceUnit === 'per box' && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-charcoal/40 ml-1">Box Weight</label>
                                                <select
                                                    className="w-full h-14 rounded-2xl bg-gray-100 border border-gray-200 px-4 font-bold"
                                                    value={mangoForm.weight}
                                                    onChange={(e) => setMangoForm({ ...mangoForm, weight: Number(e.target.value) })}
                                                >
                                                    <option value={3}>3 KG</option>
                                                    <option value={5}>5 KG</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-charcoal/40 ml-1 flex justify-between">
                                            Available Stock
                                            <Badge variant="outline" className="text-[9px] border-charcoal/10 font-black">Units</Badge>
                                        </label>
                                        <Input
                                            required
                                            type="number"
                                            placeholder="Current count"
                                            className="h-14 rounded-2xl bg-gray-100 border border-gray-200 font-black text-xl px-4"
                                            value={mangoForm.quantity}
                                            onChange={(e) => setMangoForm({ ...mangoForm, quantity: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-charcoal/40 ml-1">Public Display Status</label>
                                        <div className="flex p-1 bg-gray-100 border border-gray-200 rounded-2xl">
                                            {['In Stock', 'Sold Out'].map(st => (
                                                <button
                                                    key={st}
                                                    type="button"
                                                    onClick={() => setMangoForm({ ...mangoForm, status: st })}
                                                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mangoForm.status === st ? 'bg-white text-charcoal shadow-sm' : 'text-muted-foreground'
                                                        }`}
                                                >
                                                    {st}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 pt-4 border-t border-charcoal/5 flex gap-4">
                                    <Button type="submit" className="flex-1 h-14 bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-yellow-500/20 transition-all">
                                        {editingMangoId ? 'Sync Updates' : 'Publish to Stall'}
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="h-14 px-8 rounded-2xl font-bold text-muted-foreground hover:bg-yellow-400 hover:text-black transition-all">
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mangoes.map(mango => {
                            const status = getStockStatus(mango);
                            return (
                                <div key={mango._id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-charcoal/5 group hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-14 w-14 bg-mango rounded-2xl flex items-center justify-center text-black font-black text-xl shadow-inner">
                                            {mango.variety.charAt(0)}
                                        </div>
                                        {/* 3a. Stock Health Indicator */}
                                        <Badge className={`${status.color} border-none font-black text-[9px] uppercase tracking-widest py-1 px-3`}>
                                            {status.label}
                                        </Badge>
                                    </div>

                                    <h3 className="text-xl font-display font-black text-charcoal mb-1">{mango.variety}</h3>
                                    <p className="text-xs font-bold text-muted-foreground mb-4 opacity-60">Naturally Ripened · Grade A</p>

                                    <div className="space-y-3 pt-4 border-t border-charcoal/5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-charcoal/40 tracking-widest">Pricing</span>
                                            <span className="text-lg font-black text-charcoal">₹{mango.price} <small className="text-[10px] font-normal opacity-50">{mango.priceUnit}</small></span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-charcoal/40 tracking-widest">Inventory</span>
                                            <span className={`text-sm font-black ${mango.quantity < 20 ? 'text-orange-500' : 'text-charcoal'}`}>{mango.quantity} In Hand</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-6">
                                        <Button
                                            onClick={() => handleEditMango(mango)}
                                            disabled={stallData?.isLocked}
                                            variant="ghost"
                                            className="flex-1 h-12 bg-gray-100 text-charcoal hover:bg-yellow-400 hover:text-black rounded-xl gap-2 font-bold transition-all disabled:opacity-30"
                                        >
                                            <Pencil className="h-4 w-4" /> {stallData?.isLocked ? 'Read Only' : 'Edit'}
                                        </Button>
                                        {!stallData?.isLocked && (
                                            <button onClick={() => handleDeleteMango(mango._id)} className="h-12 w-12 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 4. Customer Entry Form */}
            {activeTab === 'crm' && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500 max-w-2xl mx-auto space-y-8">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-charcoal/10">
                        <div className="bg-mango p-10 text-black relative">
                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                <Users className="h-32 w-32" />
                            </div>
                            <h2 className="text-4xl font-display font-black relative z-10">Fresh Lead.</h2>
                            <p className="font-bold text-black/60 relative z-10">Record visits to build your WhatsApp community</p>
                        </div>

                        <form onSubmit={handleAddCustomer} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-charcoal/40 ml-1">Customer Identity</label>
                                    <Input
                                        required
                                        placeholder="Full Name"
                                        className="h-16 rounded-2xl bg-charcoal/5 border-none text-xl font-bold focus:ring-2 focus:ring-mango px-6"
                                        value={customerForm.name}
                                        onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-charcoal/40 ml-1">Mobile Access</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-charcoal/20" />
                                        <Input
                                            required
                                            type="tel"
                                            placeholder="10 Digit WhatsApp"
                                            className="h-16 rounded-2xl bg-charcoal/5 border-none text-xl font-bold focus:ring-2 focus:ring-mango pl-16 px-6"
                                            value={customerForm.mobile}
                                            onChange={(e) => setCustomerForm({ ...customerForm, mobile: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-charcoal/40 ml-1">Variety Picked</label>
                                        <Input
                                            list="bought-varieties"
                                            placeholder="Variety"
                                            className="h-14 rounded-2xl bg-charcoal/5 border-none font-bold"
                                            value={customerForm.purchasedVariety}
                                            onChange={(e) => setCustomerForm({ ...customerForm, purchasedVariety: e.target.value })}
                                        />
                                        <datalist id="bought-varieties">
                                            {mangoes.map(m => <option key={m._id} value={m.variety} />)}
                                        </datalist>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-charcoal/40 ml-1">Baskets/Qty</label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className="h-14 rounded-2xl bg-charcoal/5 border-none font-bold"
                                            value={customerForm.purchasedQuantity}
                                            onChange={(e) => setCustomerForm({ ...customerForm, purchasedQuantity: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex items-center gap-4">
                                <Switch checked={customerForm.consent} onCheckedChange={(v) => setCustomerForm({ ...customerForm, consent: v })} id="consent" />
                                <label htmlFor="consent" className="cursor-pointer">
                                    <p className="font-display font-bold text-green-900 leading-tight">Send WhatsApp Offer next week?</p>
                                    <p className="text-[10px] text-green-700/60 uppercase tracking-widest font-black">Opt-in for seasonal deals</p>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 bg-charcoal text-white hover:bg-black rounded-2xl font-bold text-lg shadow-xl shadow-charcoal/10 transition-all active:scale-95 disabled:bg-gray-300"
                            >
                                Save Discovery
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* 4. Customer List / Directory View */}
            {activeTab === 'customer_list' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-charcoal/5 shadow-xl overflow-hidden">
                        <div className="p-8 border-b border-charcoal/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-charcoal/[0.02]">
                            <div>
                                <h2 className="text-3xl font-display font-black text-charcoal">Customer Directory</h2>
                                <p className="text-muted-foreground font-medium text-sm mt-1">{customers.length} people discovered your stall</p>
                            </div>
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/20" />
                                <Input
                                    placeholder="Find by name or number..."
                                    className="pl-14 h-14 rounded-2xl bg-white border-charcoal/10 text-sm font-bold shadow-inner"
                                    value={searchCRM}
                                    onChange={(e) => setSearchCRM(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-charcoal/5 text-left border-b border-charcoal/10">
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-charcoal/30">Customer</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-charcoal/30">Preference</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-charcoal/30">Communication</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-charcoal/30">Discovery Date</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-charcoal/30 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-charcoal/5">
                                    {filteredCustomers.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-20 text-center text-muted-foreground font-display text-xl opacity-40">No entries matched your search</td>
                                        </tr>
                                    )}
                                    {filteredCustomers.map(c => (
                                        <tr key={c._id} className="hover:bg-charcoal/[0.02] transition-colors">
                                            <td className="p-6">
                                                <div className="font-black text-charcoal text-lg">{c.name}</div>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mt-1">
                                                    <Phone className="h-3 w-3 text-mango" /> {c.mobile}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <Badge className="bg-mango/20 text-black border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest">
                                                    {c.purchasedVariety || 'Browsing'}
                                                </Badge>
                                                {c.purchasedQuantity > 0 && <span className="ml-2 text-xs font-black opacity-30">×{c.purchasedQuantity}</span>}
                                            </td>
                                            <td className="p-6">
                                                {c.consent ? (
                                                    <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
                                                        <CheckCircle2 className="h-4 w-4" /> Opted In
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] uppercase tracking-widest font-black text-muted-foreground opacity-40">Privacy First</div>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                <div className="text-xs font-black text-charcoal/60 uppercase tracking-tighter">
                                                    {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <button className="h-10 w-10 bg-charcoal/5 hover:bg-mango text-charcoal hover:scale-110 rounded-xl transition-all inline-flex items-center justify-center">
                                                    <MessageSquare className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. Permissions & Safety / Trust Signals */}
            <div className="text-center pt-8 border-t border-charcoal/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" /> Authorized access only • All data isolated to {stallData?.stallName}
                </p>
                <div className="flex items-center justify-center gap-6 mt-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    <span className="text-[10px] font-black tracking-tighter">JAMANGO®</span>
                    <span className="text-[10px] font-black tracking-tighter text-mango">ORCHARD OPS™</span>
                </div>
            </div>
        </div>
    );
};

export default StallOwnerDashboard;
