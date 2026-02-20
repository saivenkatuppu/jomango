import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import client from "@/api/client";
import { Package, XCircle, Mail, Clock, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/jamango/SiteHeader";
import SiteFooter from "@/components/jamango/SiteFooter";
import { toast } from "sonner";

const statusColors: any = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    "Out for delivery": "bg-purple-100 text-purple-800 border-purple-200",
    Delivered: "bg-green-100 text-green-800 border-green-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
};

const MyOrdersPage = () => {
    const { user } = useAuth();
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

    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;

        try {
            await client.put(`/orders/${orderId}/cancel`);
            toast.success("Your order has been cancelled successfully.", {
                description: "Inventory has been restored.",
            });
            fetchOrders();
        } catch (error: any) {
            toast.error("Cancellation Failed", {
                description: error.response?.data?.message || "Could not cancel order.",
            });
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#FBF7F0] flex flex-col font-body">
                <SiteHeader />
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-xl text-charcoal/60">Please log in to view your orders.</p>
                </div>
                <SiteFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBF7F0] flex flex-col font-body">
            <SiteHeader />
            <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
                <h1 className="text-3xl font-display font-bold text-charcoal mb-8">My Orders</h1>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin text-charcoal/40" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[hsl(44,80%,46%)]/10">
                        <Package className="h-16 w-16 mx-auto text-charcoal/20 mb-4" />
                        <h2 className="text-xl font-bold text-charcoal mb-2">No orders found</h2>
                        <p className="text-charcoal/60 mb-6">Looks like you haven't placed any orders yet.</p>
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
                            const canCancel = order.status === "Pending" || order.status === "Confirmed";

                            const mailtoLink = `mailto:admin@jamango.in?subject=Order Inquiry - ${order._id}&body=Order ID: ${order._id}%0D%0ACustomer Name: ${order.customerName}%0D%0AEmail: ${order.customerEmail}%0D%0APhone: ${order.customerPhone}%0D%0AOrder Date: ${date}%0D%0A%0D%0AHello Jamango Team,%0D%0A%0D%0A`;

                            return (
                                <div key={order._id} className="bg-white rounded-2xl p-6 shadow-sm border border-[hsl(44,80%,46%)]/10">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-charcoal/5 gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-mono font-bold text-lg text-charcoal">#{order._id.slice(-6).toUpperCase()}</h3>
                                                <Badge className={`${statusColors[order.status] || "bg-gray-100 text-gray-800"} px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border`}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-charcoal/60 flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" /> {date} at {time}
                                            </p>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-sm text-charcoal/60 uppercase tracking-wider font-bold mb-1">Order Total</p>
                                            <p className="text-xl font-bold text-charcoal">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        {order.items.map((item: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 bg-sand/30 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-sand/50 transition-colors">
                                                        <Package className="h-6 w-6 text-mango" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-charcoal">{item.name}</p>
                                                        {item.variant && <p className="text-sm text-charcoal/60">{item.variant}</p>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-charcoal text-sm">Qty: {item.quantity}</p>
                                                    {item.price && <p className="text-sm text-charcoal/60">₹{item.price * item.quantity}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-charcoal/5">
                                        <a href={mailtoLink} className="inline-flex">
                                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Contact Jamango
                                            </Button>
                                        </a>

                                        {canCancel && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleCancelOrder(order._id)}
                                                className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200 border"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Cancel Order
                                            </Button>
                                        )}

                                        {order.status === "Cancelled" && (
                                            <p className="text-sm text-red-500 font-medium ml-auto flex items-center gap-1">
                                                <CheckCircle className="h-4 w-4" /> Cancelled & Inventory restored
                                            </p>
                                        )}
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
