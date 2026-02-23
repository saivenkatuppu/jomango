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

const AdminCRM = () => {
    const [stats, setStats] = useState<any>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

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
        } catch (error) {
            toast.error("Failed to load CRM data");
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.mobile.includes(search)
    );

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
                    className="rounded-xl px-6 py-6 border-charcoal/10 hover:bg-mango/5 text-mango font-bold flex items-center gap-2"
                >
                    <Download className="h-5 w-5" /> Download Database
                </Button>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-charcoal/5 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="h-5 w-5 text-mango" />
                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground">Global</Badge>
                        </div>
                        <p className="text-3xl font-bold text-charcoal">{stats.totalCustomers}</p>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Total Unique Customers</p>
                    </div>

                    {stats.stallWiseCounts.map((s: any) => (
                        <div key={s._id} className="bg-white p-6 rounded-3xl border border-charcoal/5 shadow-sm hover:border-mango/20 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <Layers className="h-5 w-5 text-blue-500" />
                                <Badge variant="outline" className="text-[10px] uppercase font-bold text-blue-400">Stall</Badge>
                            </div>
                            <p className="text-3xl font-bold text-charcoal">{s.count}</p>
                            <p className="text-xs text-muted-foreground mt-1 font-medium truncate">{s.stallName}</p>
                        </div>
                    ))}
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
