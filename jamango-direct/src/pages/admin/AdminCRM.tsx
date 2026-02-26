import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Download,
    Mail,
    Phone,
    MessageSquare,
    Calendar,
    Layers,
    CheckCircle2,
    Filter
} from "lucide-react";
import client from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const AdminCRM = () => {
    const [stats, setStats] = useState<any>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedStallId, setSelectedStallId] = useState<string>("all");
    const [stallSearch, setStallSearch] = useState("");
    const [isStallModalOpen, setIsStallModalOpen] = useState(false);
    const [modalStallSearch, setModalStallSearch] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, customersRes] = await Promise.all([
                client.get("/crm/stats"),
                client.get("/crm/customers")
            ]);
            setStats(statsRes.data);
            setCustomers(customersRes.data);
        } catch (error: any) {
            console.error("Fetch CRM Error:", error.response?.data || error.message);
            toast.error("Failed to load CRM data");
        } finally {
            setLoading(false);
        }
    };

    const todayCount = customers.filter(c =>
        new Date(c.createdAt).toDateString() === new Date().toDateString()
    ).length;

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = (c.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (c.mobile || "").includes(search);
        const matchesStall = selectedStallId === "all" || c.stall?._id === selectedStallId;
        return matchesSearch && matchesStall;
    });

    const filteredStalls = stats?.stallWiseCounts?.filter((s: any) =>
        (s.stallName?.toLowerCase() || "").includes(stallSearch.toLowerCase())
    ) || [];

    const modalFilteredStalls = stats?.stallWiseCounts?.filter((s: any) =>
        (s.stallName?.toLowerCase() || "").includes(modalStallSearch.toLowerCase())
    ) || [];

    const downloadCSV = () => {
        const headers = ["Name", "Mobile", "Consent", "Stall", "Join Date", "Count Type"];
        const rows = customers.map(c => [
            c.name,
            c.mobile,
            c.consent ? "Yes" : "No",
            c.stall?.stallName || "N/A",
            new Date(c.createdAt).toLocaleDateString(),
            c.type
        ].join(","));

        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `jamango_customers_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-charcoal">Customer CRM</h1>
                    <p className="text-muted-foreground mt-1 text-sm tracking-wide">Monitor customer acquisition per stall</p>
                </div>
                <Button
                    onClick={downloadCSV}
                    variant="outline"
                    className="rounded-xl px-6 py-6 border-charcoal/10 hover:bg-yellow-50 text-[#cca300] font-bold flex items-center gap-2"
                >
                    <Download className="h-5 w-5" /> Download Database
                </Button>
            </div>

            {stats && (
                <div className="space-y-8">
                    {/* Summary Section - Scalable Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-charcoal/5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                                <Users className="h-32 w-32 text-charcoal" />
                            </div>
                            <p className="text-4xl font-black text-charcoal">{stats.totalCustomers}</p>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-2">Total Unique Customers</p>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-charcoal/5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                                <Layers className="h-32 w-32 text-charcoal" />
                            </div>
                            <p className="text-4xl font-black text-blue-600">{stats.stallWiseCounts.length}</p>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-2">Active Stalls</p>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-charcoal/5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                                <Calendar className="h-32 w-32 text-charcoal" />
                            </div>
                            <p className="text-4xl font-black text-green-600">+{todayCount}</p>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-2">Today's New Discovery</p>
                        </div>
                    </div>

                    {/* Highly Scalable Stall Filter */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-charcoal/5 shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h3 className="font-bold text-charcoal">Filter by Source Stall</h3>
                                <p className="text-xs text-muted-foreground">Select a specific stall or search through {stats.stallWiseCounts.length} active locations</p>
                            </div>
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/20" />
                                <Input
                                    placeholder="Search stall name..."
                                    className="pl-12 h-12 rounded-2xl bg-charcoal/5 border-none font-medium"
                                    value={stallSearch}
                                    onChange={(e) => setStallSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 items-center">
                            <Button
                                onClick={() => setSelectedStallId("all")}
                                variant={selectedStallId === "all" ? "mango" : "outline"}
                                className={`h-11 rounded-xl px-6 font-bold text-xs uppercase tracking-widest transition-all ${selectedStallId === "all"
                                    ? "shadow-lg shadow-yellow-200 border-none"
                                    : "border-charcoal/10 hover:bg-yellow-400 hover:text-black"
                                    }`}
                            >
                                All stalls
                            </Button>
                            {/* Show only top 6 or search results if actively searching */}
                            {(stallSearch ? filteredStalls : stats.stallWiseCounts.slice(0, 6)).map((s: any) => (
                                <Button
                                    key={s._id}
                                    onClick={() => setSelectedStallId(s._id)}
                                    variant={selectedStallId === s._id ? "mango" : "outline"}
                                    className={`h-11 rounded-xl px-6 font-bold text-xs uppercase tracking-widest transition-all ${selectedStallId === s._id
                                        ? "shadow-lg shadow-yellow-200 border-none"
                                        : "border-charcoal/10 hover:bg-yellow-400 hover:text-black"
                                        }`}
                                >
                                    {s.stallName || "Deleted Store"} ({s.count})
                                </Button>
                            ))}

                            {/* View All Button */}
                            <Dialog open={isStallModalOpen} onOpenChange={setIsStallModalOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="text-xs font-black uppercase tracking-widest text-primary hover:bg-yellow-400 hover:text-black px-4 py-2 transition-colors flex items-center gap-1.5 ml-2"
                                    >
                                        View all stores
                                        <Layers className="h-3 w-3" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden bg-white border-none rounded-[2.5rem]">
                                    <DialogHeader className="p-8 pb-4 border-b border-charcoal/5">
                                        <DialogTitle className="text-2xl font-black text-charcoal">All Partner Stores</DialogTitle>
                                        <p className="text-sm text-muted-foreground">Select a stall to filter your customer directory</p>
                                    </DialogHeader>
                                    <div className="p-8 pt-6 space-y-6 flex-1 overflow-hidden flex flex-col">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/20" />
                                            <Input
                                                placeholder="Search by stall name or location..."
                                                className="pl-12 h-14 rounded-2xl bg-charcoal/5 border-none font-bold text-lg"
                                                value={modalStallSearch}
                                                onChange={(e) => setModalStallSearch(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                            {modalFilteredStalls.map((s: any) => (
                                                <button
                                                    key={s._id}
                                                    onClick={() => {
                                                        setSelectedStallId(s._id);
                                                        setIsStallModalOpen(false);
                                                    }}
                                                    className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${selectedStallId === s._id
                                                        ? 'bg-mango/10 border-mango text-black shadow-sm'
                                                        : 'bg-white border-charcoal/5 hover:border-mango/30 hover:bg-charcoal/[0.02]'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4 text-left">
                                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg ${selectedStallId === s._id ? 'bg-mango text-black' : 'bg-charcoal/5 text-charcoal'}`}>
                                                            {s.stallName?.charAt(0) || "?"}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-lg">{s.stallName || "Deleted Store"}</p>
                                                            <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">{s.stallId || "Unknown ID"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="border-charcoal/10 font-bold px-3 py-1">
                                                            {s.count} Customers
                                                        </Badge>
                                                        {selectedStallId === s._id && (
                                                            <CheckCircle2 className="h-5 w-5 text-mango" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                            {modalFilteredStalls.length === 0 && (
                                                <div className="py-20 text-center space-y-3 opacity-40">
                                                    <Layers className="h-12 w-12 mx-auto text-charcoal/20" />
                                                    <p className="font-display font-medium text-xl">No stalls found matching your search</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[2rem] border border-charcoal/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-charcoal/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="font-bold text-lg text-charcoal flex items-center gap-2">
                        <Filter className="h-5 w-5 text-muted-foreground" />
                        Customer Directory
                    </h3>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find by name or mobile..."
                            className="pl-10 h-11 rounded-xl bg-charcoal/5 border-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-charcoal/5 text-left border-b border-charcoal/5">
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-charcoal/40">Customer</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-charcoal/40">Acquired At</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-charcoal/40">Consent</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-charcoal/40">Status</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-charcoal/40 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal/5">
                            {filteredCustomers.map((c) => (
                                <tr key={c._id} className="hover:bg-charcoal/[0.02] transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-charcoal">{c.name}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <Phone className="h-3 w-3" /> {c.mobile}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-medium">{c.stall?.stallName || 'Direct'}</div>
                                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {new Date(c.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {c.consent ? (
                                            <Badge className="bg-green-50 text-green-600 border-green-100 hover:bg-green-50 flex items-center gap-1 w-fit">
                                                <CheckCircle2 className="h-3 w-3" /> WhatsApp
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground opacity-50">None</Badge>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className={`text-[10px] uppercase font-black tracking-widest ${c.type === 'Premium' ? 'text-mango' : 'text-blue-400'}`}>
                                            {c.type}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button size="sm" variant="ghost" className="h-9 px-3 rounded-lg hover:bg-mango/5 text-mango">
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCRM;
