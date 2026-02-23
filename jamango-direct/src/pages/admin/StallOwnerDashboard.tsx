import { useState, useEffect } from "react";
import {
    Users,
    PlusCircle,
    Smartphone,
    CheckCircle2,
    Package,
    TrendingUp,
    Store,
    ShoppingBag
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
    const [customerForm, setCustomerForm] = useState({
        name: "",
        mobile: "",
        consent: true,
        notes: ""
    });

    useEffect(() => {
        fetchStallContext();
    }, []);

    const fetchStallContext = async () => {
        try {
            setLoading(true);
            if (!user?.assignedStall) return;
            const stallRes = await client.get(`/stalls/${user.assignedStall}`);
            setStallData(stallRes.data);

            const crmRes = await client.get("/crm/customers");
            setStats({
                customerCount: crmRes.data.length,
                todaySales: 0 // to be hooked to orders later
            });
        } catch (error) {
            toast.error("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post("/crm/customers", customerForm);
            toast.success("Customer added successfully!");
            setCustomerForm({ name: "", mobile: "", consent: true, notes: "" });
            fetchStallContext();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add customer");
        }
    };

    if (loading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading Stall Hub...</div>;

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
            <div className="bg-gradient-to-br from-charcoal to-black p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden ring-4 ring-white">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Store className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                    <Badge className="bg-mango text-black border-none mb-3 px-3 py-1 font-black tracking-widest text-[10px] uppercase">Official Stall Owner</Badge>
                    <h1 className="text-4xl font-display font-bold mb-2">{stallData?.stallName}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Store className="h-4 w-4" /> {stallData?.stallId}</span>
                        <span className="flex items-center gap-1.5"><Smartphone className="h-4 w-4" /> {stallData?.ownerMobile}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-charcoal/5 shadow-sm text-center">
                    <p className="text-3xl font-black text-charcoal">{stats?.customerCount || 0}</p>
                    <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mt-2">Total Contacts Acquired</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-charcoal/5 shadow-sm text-center">
                    <p className="text-3xl font-black text-green-600">0</p>
                    <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mt-2">Boxes Sold Today</p>
                </div>
            </div>

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
                            <label className="text-xs font-black uppercase tracking-widest text-charcoal/40 ml-1">Customer Name</label>
                            <Input
                                required
                                placeholder="E.g. Rajesh Kumar"
                                className="h-14 rounded-2xl bg-charcoal/5 border-none focus:ring-2 focus:ring-mango text-lg font-bold"
                                value={customerForm.name}
                                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-charcoal/40 ml-1">Mobile Number</label>
                            <Input
                                required
                                type="tel"
                                placeholder="10 Digit Number"
                                className="h-14 rounded-2xl bg-charcoal/5 border-none focus:ring-2 focus:ring-mango text-lg font-bold"
                                value={customerForm.mobile}
                                onChange={(e) => setCustomerForm({ ...customerForm, mobile: e.target.value })}
                            />
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

            <div className="bg-charcoal/95 p-8 rounded-[2.5rem] text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-mango" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Update Mango Stock</h3>
                        <p className="text-white/40 text-xs">Manage availability for this stall</p>
                    </div>
                </div>
                <Button variant="outline" className="rounded-xl px-6 h-12 border-white/20 hover:bg-white/10 text-white font-bold">
                    Quick Inventory
                </Button>
            </div>
        </div>
    );
};

export default StallOwnerDashboard;
