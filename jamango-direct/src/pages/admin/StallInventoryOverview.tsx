import { useState, useEffect, useCallback } from "react";
import {
    Store, Package, TrendingUp, Filter, CalendarDays,
    IndianRupee, Activity, MapPin, RefreshCw, Box
} from "lucide-react";
import client from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const timeRanges = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "season", label: "Season" }
];

const StallInventoryOverview = () => {
    const { user } = useAuth();
    const isStaff = user?.role === "staff";

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [timeRange, setTimeRange] = useState("today");
    const [selectedStall, setSelectedStall] = useState<string>("all");

    const fetchInventoryData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await client.get(`/analytics/stall-inventory?timeRange=${timeRange}`);
            setData(res.data);
            if (selectedStall !== "all" && !res.data.stalls.find((s: any) => s._id === selectedStall)) {
                setSelectedStall("all");
            }
        } catch (error) {
            console.error("Failed to load stall inventory data", error);
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchInventoryData();
    }, [fetchInventoryData]);

    const displayStalls = data?.stalls.filter((s: any) => selectedStall === "all" || s._id === selectedStall) || [];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-r from-mango/20 to-mango/5 p-6 rounded-[2rem] shadow-sm border border-mango/20">
                <div>
                    <h1 className="text-3xl font-display font-black text-charcoal flex items-center gap-3">
                        <Store className="h-8 w-8 text-mango-deep" />
                        Stall Inventory & Performance
                    </h1>
                    <p className="text-muted-foreground font-body mt-2">Monitor stock movement and aggregate stall activity.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-charcoal/5 p-1.5 rounded-2xl">
                        {timeRanges.map(tr => (
                            <button
                                key={tr.value}
                                onClick={() => setTimeRange(tr.value)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${timeRange === tr.value ? 'bg-white text-charcoal shadow-sm' : 'text-muted-foreground hover:text-charcoal'}`}
                            >
                                {tr.label}
                            </button>
                        ))}
                    </div>
                    <Button onClick={fetchInventoryData} disabled={loading} variant="outline" className="h-10 rounded-xl px-4 flex items-center gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Optimize
                    </Button>
                </div>
            </div>

            {/* Top Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-3xl border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Package className="h-5 w-5" /></div>
                    </div>
                    <p className="text-4xl font-black text-charcoal">{data?.summary?.totalStockAvailable || 0}</p>
                    <p className="text-xs font-black text-blue-800/60 uppercase tracking-widest mt-2">Global Live Stock</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 rounded-3xl border border-orange-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><TrendingUp className="h-5 w-5" /></div>
                    </div>
                    <p className="text-4xl font-black text-charcoal">{data?.summary?.totalUnitsSold || 0}</p>
                    <p className="text-xs font-black text-orange-800/60 uppercase tracking-widest mt-2">Units Sold ({timeRanges.find(t => t.value === timeRange)?.label})</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-3xl border border-green-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><Store className="h-5 w-5" /></div>
                    </div>
                    <p className="text-4xl font-black text-charcoal">{data?.summary?.activeStallsWithInventory || 0}</p>
                    <p className="text-xs font-black text-green-800/60 uppercase tracking-widest mt-2">Active Stalls</p>
                </div>

                {!isStaff && (
                    <div className="bg-charcoal p-6 rounded-3xl shadow-sm text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 bg-white/10 text-mango rounded-xl flex items-center justify-center"><IndianRupee className="h-5 w-5" /></div>
                        </div>
                        <p className="text-4xl font-black">{formatCurrency(data?.summary?.totalRevenue || 0)}</p>
                        <p className="text-xs font-black text-white/50 uppercase tracking-widest mt-2">Gross Revenue</p>
                    </div>
                )}
            </div>

            {/* Filter by Stall */}
            <div className="flex items-center gap-4 py-4 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setSelectedStall("all")}
                    className={`shrink-0 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${selectedStall === 'all' ? 'bg-mango text-black shadow-md' : 'bg-white text-muted-foreground border border-charcoal/10 hover:bg-charcoal/5'}`}
                >
                    Overview Console
                </button>
                {data?.stalls?.map((stall: any) => (
                    <button
                        key={stall._id}
                        onClick={() => setSelectedStall(stall._id)}
                        className={`shrink-0 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${selectedStall === stall._id ? 'bg-charcoal text-white shadow-md' : 'bg-white text-muted-foreground border border-charcoal/10 hover:bg-charcoal/5'}`}
                    >
                        <MapPin className="h-3 w-3" /> {stall.stallName}
                    </button>
                ))}
            </div>

            {/* Trends Component */}
            {data && data.trends?.length > 0 && selectedStall === "all" && (
                <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-8 rounded-[2rem] border border-indigo-100/50 shadow-sm mb-8">
                    <h3 className="text-lg font-display font-black text-charcoal mb-6 flex items-center gap-2"><Activity className="h-5 w-5 text-indigo-500" /> Sales Velocity Trend</h3>
                    <div className="flex items-end gap-3 h-48">
                        {data.trends.map((t: any, i: number) => {
                            const maxVal = Math.max(...data.trends.map((d: any) => isStaff ? d.totalSold : (d.totalRevenue || 0)));
                            const currentVal = isStaff ? t.totalSold : (t.totalRevenue || 0);
                            const heightPercentage = Math.max((currentVal / (maxVal || 1)) * 100, 5);

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group relative h-full">
                                    <div className="w-full bg-blue-50/50 rounded-t-xl relative overflow-hidden transition-all duration-500 mb-1 flex-1">
                                        <div
                                            className="absolute bottom-0 left-0 w-full bg-mango-deep transition-all duration-700 rounded-t-xl group-hover:opacity-80"
                                            style={{ height: `${heightPercentage}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                                        {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>

                                    {/* Tooltip */}
                                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal text-white text-xs font-black py-2 px-4 rounded-xl whitespace-nowrap z-10 pointer-events-none shadow-xl shadow-black/20">
                                        {t.totalSold} Units {!isStaff && `• ${formatCurrency(t.totalRevenue || 0)}`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Stall Details Grid */}
            <div className="grid grid-cols-1 gap-6">
                {displayStalls.map((stall: any) => (
                    <div key={stall._id} className="bg-gradient-to-b from-stone-50 to-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden">
                        {/* Stall Header */}
                        <div className="p-8 border-b border-charcoal/5 bg-charcoal/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-2xl font-display font-black text-charcoal">{stall.stallName}</h2>
                                <p className="text-sm font-bold text-muted-foreground mt-1 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> {stall.location} <span className="text-charcoal/20 mx-2">•</span> ID: {stall.stallId}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Volume Sold</p>
                                    <p className="text-xl font-black text-charcoal">{stall.totalUnitsSold} Units</p>
                                </div>
                                <div className="w-px bg-charcoal/10" />
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Inv.</p>
                                    <p className="text-xl font-black text-charcoal">{stall.totalStockAvailable} Units</p>
                                </div>
                                {!isStaff && (
                                    <>
                                        <div className="w-px bg-charcoal/10" />
                                        <div className="text-right pl-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-mango">Gross</p>
                                            <p className="text-xl font-black text-charcoal">{formatCurrency(stall.totalRevenue || 0)}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Varieties Breakdown */}
                        <div className="p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Variety Movement</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {stall.varieties.map((v: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-yellow-50/30 border border-yellow-100 hover:border-mango/50 hover:shadow-md transition-all">
                                        <div className="h-12 w-12 bg-mango/20 rounded-xl flex items-center justify-center text-mango-deep font-black text-lg">
                                            {v.variety.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-charcoal text-sm">{v.variety}</h4>
                                                {!isStaff && <span className="text-xs font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-md">{formatCurrency(v.revenue || 0)}</span>}
                                            </div>
                                            <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                                                <span>Sold: <strong className="text-charcoal">{v.unitsSold}</strong></span>
                                                <span>Stock: <strong className={`${v.currentStock < 10 ? 'text-red-500' : 'text-charcoal'}`}>{v.currentStock}</strong></span>
                                                <span className="opacity-50">({v.priceUnit})</span>
                                            </div>
                                            {/* Contribution Bar */}
                                            <div className="mt-3 flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-charcoal rounded-full" style={{ width: `${v.contribution}%` }} />
                                                </div>
                                                <span className="text-[9px] font-black tracking-widest text-charcoal/40 w-8">{v.contribution}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {stall.varieties.length === 0 && (
                                    <div className="col-span-1 lg:col-span-2 p-8 text-center text-muted-foreground font-bold text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        No active inventory variations published for this stall.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {displayStalls.length === 0 && !loading && (
                    <div className="bg-white rounded-[2rem] p-20 text-center shadow-sm border border-charcoal/5">
                        <Box className="h-16 w-16 mx-auto text-charcoal/10 mb-4" />
                        <h3 className="text-xl font-display font-black text-charcoal mb-2">No Stall Data Available</h3>
                        <p className="text-muted-foreground">No matching inventory or sales records for this selection.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default StallInventoryOverview;
