import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/jamango/SiteFooter";
import SiteHeader from "@/components/jamango/SiteHeader";

const OrderSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderDetails } = location.state || {};

    if (!orderDetails) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-[#FBF7F0] flex flex-col font-body">
            <SiteHeader />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-xl w-full text-center border border-[hsl(44,80%,46%)]/20 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                    {/* Subtle Mango Pattern Background */}
                    <div className="absolute top-0 right-0 -mr-12 -mt-12 opacity-5 pointer-events-none">
                        <svg viewBox="0 0 24 24" width="200" height="200" fill="currentColor"><path d="M12.5 2C12.5 2 11.5 5 8.5 6C5.5 7 2 9 2 13.5C2 18.2 5.8 22 10.5 22C15.2 22 19 19.5 20.5 15.5C22 11.5 21 6.5 17 4.5C14.5 3.2 12.5 2 12.5 2Z" /></svg>
                    </div>

                    <div className="flex justify-center mb-6 relative z-10">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-charcoal mb-3 relative z-10 tracking-tight">Thank you for ordering from Jamango.</h1>
                    <p className="text-charcoal/70 font-medium mb-8 relative z-10">Your order has been successfully placed. We'll start preparing your fresh mangoes.</p>

                    <div className="bg-sand/30 rounded-2xl p-6 text-left space-y-4 mb-8 relative z-10 border border-sand">
                        <div className="flex justify-between items-center border-b border-charcoal/10 pb-4">
                            <div>
                                <span className="text-xs uppercase tracking-wider text-charcoal/50 font-bold block mb-1">Order ID</span>
                                <span className="font-mono font-medium text-charcoal">{orderDetails.id}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs uppercase tracking-wider text-charcoal/50 font-bold block mb-1">Total</span>
                                <span className="font-bold text-lg text-charcoal">₹{orderDetails.total?.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-charcoal/10">
                            <div>
                                <span className="text-xs uppercase tracking-wider text-charcoal/50 font-bold block mb-1">Date & Time</span>
                                <span className="font-medium text-charcoal block">{orderDetails.date}</span>
                                <span className="text-sm text-charcoal/70">{orderDetails.time}</span>
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-wider text-charcoal/50 font-bold block mb-1">Payment method</span>
                                <span className="font-medium text-charcoal flex items-center gap-1">
                                    {orderDetails.paymentMode === 'cod' ? "Cash on Delivery" : "Paid Online"}
                                </span>
                                <span className="text-sm">Status: <span className={orderDetails.paymentMode === 'online' ? "text-green-600 font-semibold" : "text-yellow-600 font-semibold"}>{orderDetails.paymentMode === 'cod' ? 'Pending' : 'Paid'}</span></span>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs uppercase tracking-wider text-charcoal/50 font-bold block mb-2">Delivery Address</span>
                            <span className="font-medium text-charcoal text-sm leading-relaxed block max-w-sm">{orderDetails.address}</span>
                        </div>

                        <div className="pt-2">
                            <span className="text-xs uppercase tracking-wider text-charcoal/50 font-bold block mb-3">Items Ordered</span>
                            <div className="space-y-3">
                                {orderDetails.items.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="h-10 w-10 bg-white rounded-lg border border-charcoal/10 flex items-center justify-center shrink-0">
                                                <Package className="h-5 w-5 text-mango" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-charcoal text-sm leading-none pt-1">{item.name}</p>
                                                {item.variant && <p className="text-xs text-charcoal/60 mt-1">{item.variant}</p>}
                                            </div>
                                        </div>
                                        <span className="font-bold text-charcoal text-sm pt-1">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/my-orders')}
                            className="flex-1 h-14 rounded-full border-2 border-[hsl(44,80%,46%)] text-[hsl(44,80%,46%)] hover:bg-[hsl(44,80%,46%)]/10 font-bold text-lg transition-all"
                        >
                            View My Orders
                        </Button>
                        <Button
                            onClick={() => navigate('/')}
                            className="flex-1 h-14 rounded-full bg-[hsl(44,80%,46%)] hover:bg-[hsl(44,90%,40%)] text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                        >
                            Continue Shopping <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
            <SiteFooter />
        </div>
    );
};

export default OrderSuccessPage;
