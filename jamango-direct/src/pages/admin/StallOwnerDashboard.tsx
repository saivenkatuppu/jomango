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
} from "lucide-react";
import client from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
    const [mangoForm, setMangoForm] = useState({
        variety: "",
        ripeningType: "Natural",
        price: "",
        priceUnit: "per kg",
        quantity: "",
        qualityGrade: "A",
        status: "In Stock"
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

            const [crmRes, mangoRes, templatesRes] = await Promise.all([
                client.get("/crm/customers"),
                client.get("/stall-mangoes"),
                client.get("/stall-mangoes/templates")
            ]);

            const customers = crmRes.data;
            const myMangoes = mangoRes.data;

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
                purchasedQuantity: customerForm.purchasedQuantity ? Number(customerForm.purchasedQuantity) : undefined
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
            setMangoForm({ variety: "", ripeningType: "Natural", price: "", priceUnit: "per kg", quantity: "", qualityGrade: "A", status: "In Stock" });
            setEditingMangoId(null);
            fetchStallContext();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save mango");
        }
    };

    const handleEditMango = (mango: any) => {
        setMangoForm({
            variety: mango.variety,
            ripeningType: mango.ripeningType,
            price: String(mango.price),
            priceUnit: mango.priceUnit,
            quantity: String(mango.quantity),
            qualityGrade: mango.qualityGrade,
            status: mango.status
        });
        setEditingMangoId(mango._id);
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
            <div className="bg-gradient-to-br from-charcoal to-black p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Store className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge className="bg-mango text-black border-none mb-3 px-3 py-1 font-black tracking-widest text-[10px] uppercase">Official Stall Owner</Badge>
                            <h1 className="text-4xl font-display font-bold mb-2">{stallData?.stallName}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm font-medium">
                                <span className="flex items-center gap-1.5"><Store className="h-4 w-4" /> {stallData?.stallId}</span>
                                <span className="flex items-center gap-1.5"><Smartphone className="h-4 w-4" /> {stallData?.ownerMobile}</span>
                            </div>
                        </div>
                        <Badge variant="outline" className={`px-4 py-2 border-white/20 uppercase tracking-widest font-black ${stallData?.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                            {stallData?.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="flex bg-white rounded-2xl shadow-sm border border-charcoal/5 p-2 gap-2 overflow-x-auto">
                <Button
                    variant={activeTab === 'summary' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('summary')}
                    className={`flex-1 min-w-[120px] rounded-xl font-bold ${activeTab === 'summary' ? 'bg-mango text-black hover:bg-mango-deep' : 'text-charcoal/60 hover:bg-charcoal/5'}`}
                >
                    Dashboard
                </Button>
                <Button
                    variant={activeTab === 'mangoes' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('mangoes')}
                    className={`flex-1 min-w-[120px] rounded-xl font-bold ${activeTab === 'mangoes' ? 'bg-mango text-black hover:bg-mango-deep' : 'text-charcoal/60 hover:bg-charcoal/5'}`}
                >
                    Stock Manager
                </Button>
                <Button
                    variant={activeTab === 'crm' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('crm')}
                    className={`flex-1 min-w-[120px] rounded-xl font-bold ${activeTab === 'crm' ? 'bg-mango text-black hover:bg-mango-deep' : 'text-charcoal/60 hover:bg-charcoal/5'}`}
                >
                    Customer Entry
                </Button>
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
                    <div className="bg-white rounded-[2rem] shadow-sm border border-charcoal/5 overflow-hidden">
                        <div className="bg-charcoal/5 p-6 border-b border-charcoal/5">
                            <h2 className="text-xl font-display font-bold text-charcoal">{editingMangoId ? 'Edit Mango Info' : 'Add New Mango Variety'}</h2>
                        </div>
                        <form onSubmit={handleMangoSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-charcoal/60">Variety Name</label>
                                    <div className="relative">
                                        <Input
                                            required
                                            list="global-varieties"
                                            placeholder="e.g. Alphonso"
                                            className="h-12 rounded-xl bg-charcoal/5 border-none font-bold"
                                            value={mangoForm.variety}
                                            onChange={(e) => setMangoForm({ ...mangoForm, variety: e.target.value })}
                                        />
                                        <datalist id="global-varieties">
                                            {globalTemplates.map(t => <option key={t._id} value={t.variety} />)}
                                        </datalist>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-charcoal/60">Ripening Type</label>
                                    <select
                                        className="w-full h-12 rounded-xl bg-charcoal/5 border-none px-3 font-bold text-sm"
                                        value={mangoForm.ripeningType}
                                        onChange={(e) => setMangoForm({ ...mangoForm, ripeningType: e.target.value })}
                                    >
                                        <option value="Natural">Natural</option>
                                        <option value="Carbide-Free">Carbide-Free</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-charcoal/60">Quality Grade</label>
                                    <select
                                        className="w-full h-12 rounded-xl bg-charcoal/5 border-none px-3 font-bold text-sm"
                                        value={mangoForm.qualityGrade}
                                        onChange={(e) => setMangoForm({ ...mangoForm, qualityGrade: e.target.value })}
                                    >
                                        <option value="A">A</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Export">Export</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-charcoal/60">Price</label>
                                    <Input
                                        required
                                        type="number"
                                        placeholder="0"
                                        className="h-12 rounded-xl bg-charcoal/5 border-none font-bold"
                                        value={mangoForm.price}
                                        onChange={(e) => setMangoForm({ ...mangoForm, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-charcoal/60">Price Unit</label>
                                    <select
                                        className="w-full h-12 rounded-xl bg-charcoal/5 border-none px-3 font-bold text-sm"
                                        value={mangoForm.priceUnit}
                                        onChange={(e) => setMangoForm({ ...mangoForm, priceUnit: e.target.value })}
                                    >
                                        <option value="per kg">per kg</option>
                                        <option value="per box">per box</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-charcoal/60">Available Quantity</label>
                                    <Input
                                        required
                                        type="number"
                                        placeholder="Current stock"
                                        className="h-12 rounded-xl bg-charcoal/5 border-none font-bold"
                                        value={mangoForm.quantity}
                                        onChange={(e) => setMangoForm({ ...mangoForm, quantity: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-charcoal/60">Status</label>
                                    <select
                                        className="w-full h-12 rounded-xl bg-charcoal/5 border-none px-3 font-bold text-sm"
                                        value={mangoForm.status}
                                        onChange={(e) => setMangoForm({ ...mangoForm, status: e.target.value })}
                                    >
                                        <option value="In Stock">In Stock</option>
                                        <option value="Sold Out">Sold Out</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-2">
                                {editingMangoId && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => { setEditingMangoId(null); setMangoForm({ variety: "", ripeningType: "Natural", price: "", priceUnit: "per kg", quantity: "", qualityGrade: "A", status: "In Stock" }); }}
                                        className="rounded-xl h-12"
                                    >
                                        Cancel
                                    </Button>
                                )}
                                <Button type="submit" className="flex-1 h-12 bg-charcoal hover:bg-black text-mango rounded-xl font-black shadow-lg">
                                    {editingMangoId ? 'Update Stock Entry' : 'Add to Stock List'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-charcoal/5 overflow-hidden">
                        <div className="p-6 border-b border-charcoal/5 bg-charcoal text-white flex justify-between items-center">
                            <h2 className="text-lg font-display font-bold text-mango">Current Stall Inventory</h2>
                            <Badge variant="outline" className="border-white/20">{mangoes.length} Varieties</Badge>
                        </div>
                        <div className="divide-y divide-charcoal/5">
                            {mangoes.map(mango => (
                                <div key={mango._id} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-charcoal/[0.02]">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-charcoal">{mango.variety}</h3>
                                            <Badge variant="outline" className="text-[10px] uppercase bg-charcoal/5">{mango.qualityGrade}</Badge>
                                            <Badge className={`text-[10px] uppercase font-black tracking-widest ${mango.status === 'In Stock' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}`}>
                                                {mango.status}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-charcoal/60 flex items-center gap-3">
                                            <span className="flex items-center gap-1"><Leaf className="h-3.5 w-3.5" />{mango.ripeningType}</span>
                                            <span>₹{mango.price} {mango.priceUnit}</span>
                                            <span className="font-bold text-charcoal">Stock: {mango.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEditMango(mango)} className="rounded-lg h-9 w-9 p-0 border-charcoal/10 hover:bg-charcoal/5 text-charcoal">
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDeleteMango(mango._id)} className="rounded-lg h-9 w-9 p-0 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {mangoes.length === 0 && (
                                <div className="p-12 text-center text-muted-foreground">No mangoes added to your stall yet!</div>
                            )}
                        </div>
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

                        <div className="bg-mango/5 p-6 rounded-2xl border border-mango/10">
                            <label className="flex items-center gap-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="h-6 w-6 rounded-lg accent-mango border-mango"
                                    checked={customerForm.consent}
                                    onChange={(e) => setCustomerForm({ ...customerForm, consent: e.target.checked })}
                                />
                                <div className="space-y-0.5">
                                    <p className="font-bold text-charcoal">Get Consent for Updates</p>
                                    <p className="text-xs text-charcoal/60">Customer agrees to receive seasonal mango offers on WhatsApp/SMS</p>
                                </div>
                            </label>
                        </div>

                        <Button type="submit" className="w-full h-16 bg-mango hover:bg-mango-deep text-black rounded-2xl font-black text-xl shadow-xl shadow-mango/20 transition-all active:scale-[0.98] flex items-center gap-3">
                            <PlusCircle className="h-6 w-6" /> Save Customer Record
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default StallOwnerDashboard;
