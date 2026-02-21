import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import client from "@/api/client";
import { Package, XCircle, ArrowLeft, Clock, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";
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

const OrderDetailsPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user && orderId) {
            fetchOrderDetails();
        } else if (!user) {
            setLoading(false);
        }
    }, [user, orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const { data } = await client.get(`/orders/${orderId}`);
            setOrder(data);
        } catch (err: any) {
            console.error("Failed to fetch order:", err);
            setError(err.response?.data?.message || "Could not load order details.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;

        try {
            await client.put(`/orders/${orderId}/cancel`);
            toast.success("Your order has been cancelled successfully.", {
                description: "Inventory has been restored.",
            });
            fetchOrderDetails();
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
                <div className="flex-1 flex items-center justify-center p-4 pt-24 md:pt-32">
                    <p className="text-xl text-charcoal/60">Please log in to view your order details.</p>
                </div>
                <SiteFooter />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBF7F0] flex flex-col font-body">
                <SiteHeader />
                <div className="flex-1 flex justify-center py-24 pt-32">
                    <RefreshCw className="h-8 w-8 animate-spin text-charcoal/40" />
                </div>
                <SiteFooter />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-[#FBF7F0] flex flex-col font-body">
                <SiteHeader />
                <div className="flex-1 flex flex-col items-center justify-center p-4 pt-24 md:pt-32">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-charcoal mb-2">Order Not Found</h2>
                    <p className="text-charcoal/60 mb-6">{error || "The order you are looking for does not exist or you do not have permission to view it."}</p>
                    <Button onClick={() => navigate("/my-orders")} variant="outline">
                        Back to My Orders
                    </Button>
                </div>
                <SiteFooter />
            </div>
        );
    }

    const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
    });
    const time = new Date(order.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit",
    });
    const canCancel = order.status === "Pending" || order.status === "Confirmed";

    return (
        <div className="min-h-screen bg-[#FBF7F0] flex flex-col font-body">
            <SiteHeader />
            <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 pt-24 md:pt-32">

                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-charcoal mb-2">Order Details</h1>
                    <p className="text-charcoal/60">Your Jamango order summary</p>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-[hsl(44,80%,46%)]/10 space-y-10">

                    {/* Order Summary Section */}
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xs uppercase tracking-wider text-charcoal/50 font-bold mb-1">Order ID</h2>
                                <p className="font-mono font-bold text-xl text-charcoal">#{order._id.slice(-6).toUpperCase()}</p>
                            </div>
                            <div className="text-left md:text-right">
                                <Badge className={`${statusColors[order.status] || "bg-gray-100 text-gray-800"} px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wide border`}>
                                    {order.status}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-[#FBF7F0]/50 rounded-2xl border border-[hsl(44,30%,90%)]">
                            <div>
                                <h3 className="text-xs uppercase tracking-wider text-charcoal/50 font-bold mb-1">Order Date & Time</h3>
                                <p className="font-medium text-charcoal flex items-center gap-1.5 whitespace-nowrap"><Clock className="h-3.5 w-3.5" /> {date}</p>
                                <p className="text-sm text-charcoal/60">{time}</p>
                            </div>
                            <div>
                                <h3 className="text-xs uppercase tracking-wider text-charcoal/50 font-bold mb-1">Payment Method</h3>
                                <p className="font-medium text-charcoal">{order.paymentMode === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                            </div>
                            <div>
                                <h3 className="text-xs uppercase tracking-wider text-charcoal/50 font-bold mb-1">Payment Status</h3>
                                <p className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600 capitalize'}`}>
                                    {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs uppercase tracking-wider text-charcoal/50 font-bold mb-1">Order Total</h3>
                                <p className="font-bold text-xl text-[hsl(44,90%,40%)]">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-charcoal/5"></div>

                    {/* Products Ordered Section */}
                    <div>
                        <h2 className="text-lg font-bold text-charcoal mb-4">Products Ordered</h2>
                        <div className="space-y-4">
                            {order.items.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center bg-white border border-stone-100 p-4 rounded-xl group hover:border-[hsl(44,50%,80%)] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-sand/30 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-sand/60 transition-colors">
                                            <Package className="h-6 w-6 text-mango" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-charcoal">{item.name}</p>
                                            {item.variant && <p className="text-sm text-charcoal/60">{item.variant}</p>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-charcoal">Qty: {item.quantity}</p>
                                        {/* Optional: we could hide price as req stated "hide price if required later", but let's show it by default as standard e-commerce */}
                                        {item.price && <p className="text-sm text-charcoal/60 font-medium">₹{item.price * item.quantity}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-px w-full bg-charcoal/5"></div>

                    {/* Delivery Details Section */}
                    <div>
                        <h2 className="text-lg font-bold text-charcoal mb-4">Delivery Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                            <div className="space-y-3">
                                <div>
                                    <span className="text-charcoal/50 font-medium w-24 inline-block">Full Name</span>
                                    <span className="font-semibold text-charcoal">{order.customerName}</span>
                                </div>
                                <div>
                                    <span className="text-charcoal/50 font-medium w-24 inline-block">Phone</span>
                                    <span className="font-semibold text-charcoal">{order.customerPhone}</span>
                                </div>
                                <div>
                                    <span className="text-charcoal/50 font-medium w-24 inline-block">Email</span>
                                    <span className="font-semibold text-charcoal">{order.customerEmail}</span>
                                </div>
                            </div>
                            <div className="bg-stone-50 p-4 rounded-xl text-charcoal/80 leading-relaxed">
                                {order.shippingAddress?.address}<br />
                                {order.shippingAddress?.landmark && <>{order.shippingAddress.landmark}<br /></>}
                                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zip}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-8 flex flex-col sm:flex-row items-center gap-4 justify-between border-t border-charcoal/5">
                        <Button
                            variant="outline"
                            onClick={() => navigate("/")}
                            className="w-full sm:w-auto flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Button>

                        {canCancel && (
                            <Button
                                variant="destructive"
                                onClick={handleCancelOrder}
                                className="w-full sm:w-auto flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200 border"
                            >
                                <XCircle className="h-4 w-4" />
                                Cancel Order
                            </Button>
                        )}

                        {order.status === "Cancelled" && (
                            <p className="text-sm text-red-500 font-medium flex items-center gap-1.5 w-full sm:w-auto justify-center">
                                <CheckCircle className="h-4 w-4" /> Order Cancelled
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <SiteFooter />
        </div>
    );
};

export default OrderDetailsPage;
