import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import client from "@/api/client";
import { Package, XCircle, Mail, Clock, CheckCircle, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/jamango/SiteHeader";
import SiteFooter from "@/components/jamango/SiteFooter";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const statusColors: any = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    "Out for delivery": "bg-purple-100 text-purple-800 border-purple-200",
    Delivered: "bg-green-100 text-green-800 border-green-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
};

const MyOrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await client.get("/orders/mine");
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("Could not load your orders.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#FBF7F0] flex flex-col font-body">
                <SiteHeader />
                <div className="flex-1 flex items-center justify-center p-4 pt-24 pb-24 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-1/3 left-10 w-64 h-64 bg-[hsl(44,80%,46%)]/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
                    <div className="absolute bottom-1/3 right-10 w-64 h-64 bg-[#4A5D23]/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>

                    <div className="relative z-10 bg-white/70 backdrop-blur-xl border border-[hsl(44,80%,46%)]/20 shadow-2xl rounded-[40px] p-10 md:p-14 max-w-lg w-full text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[hsl(44,80%,46%)]/10 mb-6 shadow-inner border border-[hsl(44,80%,46%)]/20">
                            <Lock className="w-10 h-10 text-[hsl(44,90%,40%)]" strokeWidth={1.5} />
                        </div>

                        <h2 className="font-display text-4xl font-bold text-charcoal mb-4 tracking-tight">
                            Access Restricted
                        </h2>

                        <div className="flex items-center justify-center gap-2 opacity-70 mb-6">
                            <div className="h-px w-8 bg-charcoal/20"></div>
                            <p className="text-xs font-bold tracking-[0.2em] uppercase text-charcoal">Customer Portal</p>
                            <div className="h-px w-8 bg-charcoal/20"></div>
                        </div>

                        <p className="text-charcoal/70 mb-10 leading-relaxed font-medium">
                            Please log in or create a Jamango account to view your past harvests, track active shipments, and manage your preferences.
                        </p>

                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={() => navigate("/login")}
                                className="w-full h-14 rounded-full bg-gradient-to-r from-[hsl(44,80%,46%)] to-[hsl(38,90%,55%)] hover:from-[hsl(44,90%,40%)] hover:to-[hsl(38,100%,50%)] text-white font-bold text-lg shadow-lg shadow-[hsl(44,80%,46%)]/30 transition-all hover:scale-[1.02]"
                            >
                                Log In
                            </Button>
                            <Button
                                onClick={() => navigate("/register")}
                                variant="outline"
                                className="w-full h-14 rounded-full border-2 border-[hsl(44,80%,46%)]/20 text-charcoal hover:bg-[hsl(44,80%,46%)]/5 font-bold text-lg transition-all"
                            >
                                Create an Account
                            </Button>
                        </div>
                    </div>
                </div>
                <SiteFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBF7F0] flex flex-col font-body">
            <SiteHeader />
            <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 pt-24 md:pt-32">
                <h1 className="text-3xl font-display font-bold text-charcoal mb-8">My Orders</h1>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin text-charcoal/40" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[hsl(44,80%,46%)]/10">
                        <Package className="h-16 w-16 mx-auto text-charcoal/20 mb-4" />
                        <h2 className="text-xl font-bold text-charcoal mb-2">No orders found</h2>
                        <p className="text-charcoal/60 mb-6">You have not placed any orders yet.</p>
                        <Button onClick={() => window.location.href = "/"} className="bg-[hsl(44,80%,46%)] hover:bg-[hsl(44,90%,40%)] text-white">
                            Start Shopping
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric", month: "long", year: "numeric",
                            });
                            const time = new Date(order.createdAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit", minute: "2-digit",
                            });

                            return (
                                <div key={order._id} className="bg-white rounded-2xl p-6 shadow-sm border border-[hsl(44,80%,46%)]/10">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                        <div className="flex items-center gap-3 mb-2 md:mb-0">
                                            <h3 className="font-mono font-bold text-lg text-charcoal">#{order._id.slice(-6).toUpperCase()}</h3>
                                            <Badge className={`${statusColors[order.status] || "bg-gray-100 text-gray-800"} px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border`}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-xl font-bold text-[hsl(44,90%,40%)]">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-charcoal/60 flex items-center gap-1.5 mb-6">
                                        <Clock className="h-3.5 w-3.5" /> {date} at {time}
                                    </p>

                                    <div className="flex justify-between items-center pt-4 border-t border-charcoal/5">
                                        <p className="text-sm font-medium text-charcoal/80">
                                            {order.items?.length} {order.items?.length === 1 ? 'Product' : 'Products'} Ordered
                                        </p>
                                        <Button
                                            onClick={() => navigate(`/my-orders/${order._id}`)}
                                            className="bg-[hsl(44,80%,46%)] hover:bg-[hsl(44,90%,40%)] text-white text-sm"
                                        >
                                            View Order
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <SiteFooter />
        </div>
    );
};

export default MyOrdersPage;
