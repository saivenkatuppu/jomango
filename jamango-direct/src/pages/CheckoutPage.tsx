import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, ShoppingBag, ShieldCheck, Plus, ChevronDown, ChevronUp, ArrowLeft, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import client from "@/api/client";
import { products } from "@/data/products";

const CartItemRow = ({ item, updateQuantity, removeFromCart }: any) => {
    return (
        <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-charcoal">{item.name}</h3>
                    {item.variant && <p className="text-sm text-charcoal/60">{item.variant}</p>}
                    <div className="flex items-center gap-2">
                        <p className="text-[hsl(44,80%,46%)] font-bold">₹{item.price}</p>
                        {item.discountLabel && (
                            <span className="bg-[hsl(44,80%,46%)]/10 text-[hsl(44,80%,46%)] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {item.discountLabel}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-white rounded-md transition-colors"
                        >
                            -
                        </button>
                        <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-white rounded-md transition-colors"
                        >
                            +
                        </button>
                    </div>
                    <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-600 p-2"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

import { AddMoreMangoesModal } from "@/components/jamango/AddMoreMangoesModal";

const CheckoutPage = () => {
    const { cart, removeFromCart, updateQuantity, total, clearCart, addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(false);
    const [codLoading, setCodLoading] = useState(false);
    const [isAddMoreOpen, setIsAddMoreOpen] = useState(false);
    const [shippingCost, setShippingCost] = useState<number | null>(null);
    const [shippingLoading, setShippingLoading] = useState(false);

    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem("savedCheckoutDetails");
        const parsed = saved ? JSON.parse(saved) : null;
        return {
            name: user?.name || parsed?.name || "",
            email: user?.email || parsed?.email || "",
            phone: user?.phone || parsed?.phone || "",
            address: parsed?.address || "",
            landmark: parsed?.landmark || "",
            city: parsed?.city || "",
            state: parsed?.state || "",
            zip: parsed?.zip || "",
            country: parsed?.country || "India",
            orderNotes: "",
        };
    });

    const [saveDetails, setSaveDetails] = useState(() => !!localStorage.getItem("savedCheckoutDetails"));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Calculate dynamic shipping cost
    useEffect(() => {
        const fetchShippingCost = async () => {
            if (formData.zip && formData.zip.length === 6 && cart.length > 0) {
                setShippingLoading(true);
                try {
                    const res = await client.post("/orders/shipping-rate", {
                        pincode: formData.zip,
                        items: cart
                    });
                    setShippingCost(res.data.shippingCost);
                } catch (error) {
                    console.error("Failed to fetch shipping rate", error);
                    setShippingCost(150); // Fallback standard rate
                } finally {
                    setShippingLoading(false);
                }
            } else {
                setShippingCost(null);
            }
        };

        const timeoutId = setTimeout(fetchShippingCost, 1000); // 1s debounce
        return () => clearTimeout(timeoutId);
    }, [formData.zip, cart]);

    const grandTotal = total + (shippingCost || 0);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zip || !formData.country) {
            toast.error("⚠️ Please fill all required fields before proceeding.");
            return;
        }

        if (saveDetails) {
            localStorage.setItem("savedCheckoutDetails", JSON.stringify({
                name: formData.name, email: formData.email, phone: formData.phone,
                address: formData.address, landmark: formData.landmark, city: formData.city,
                state: formData.state, zip: formData.zip, country: formData.country,
            }));
        } else {
            localStorage.removeItem("savedCheckoutDetails");
        }

        setLoading(true);

        try {
            const res = await loadRazorpay();

            if (!res) {
                toast.error("Razorpay SDK failed to load. Are you online?");
                setLoading(false);
                return;
            }

            // 1. Create Order on Backend
            const { data: order } = await client.post("/payments/order", {
                amount: grandTotal, // Updated to use grand total including shipping
            });

            // 2. Initialize Razorpay Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
                amount: order.amount,
                currency: order.currency,
                name: "JAMANGO PureCraft",
                description: "Premium Mango Order",
                image: "/logo.jpeg",
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await client.post("/payments/verify", {
                            // Razorpay signature fields
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            // Order details — persisted to MongoDB on successful verification
                            customerName: formData.name,
                            customerEmail: formData.email,
                            customerPhone: formData.phone,
                            shippingAddress: {
                                address: formData.address,
                                landmark: formData.landmark,
                                city: formData.city,
                                state: formData.state,
                                zip: formData.zip,
                                zipCode: formData.zip,
                                country: formData.country,
                            },
                            orderNotes: formData.orderNotes,
                            items: cart.map((item) => ({
                                name: item.name,
                                variant: item.variant || "",
                                price: item.price,
                                quantity: item.quantity,
                            })),
                            totalAmount: grandTotal,
                            shippingFee: shippingCost || 0,
                        });

                        if (verifyRes.data.success) {
                            const details = {
                                id: verifyRes.data.order?._id || response.razorpay_order_id,
                                date: new Date().toLocaleDateString('en-IN'),
                                time: new Date().toLocaleTimeString('en-IN'),
                                items: [...cart],
                                address: `${formData.address}, ${formData.city} - ${formData.zip}`,
                                total: grandTotal,
                                paymentMode: 'online'
                            };
                            clearCart();
                            navigate('/order-success', { state: { orderDetails: details } });
                        }
                    } catch (error) {
                        toast.error("Payment Verification Failed");
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },
                notes: {
                    address: `${formData.address}, ${formData.city} - ${formData.zip}`,
                },
                theme: {
                    color: "#D97706", // Jamango Gold/Amber
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || error.message || "Could not initiate payment.";
            toast.error("Checkout Failed", { description: message });
        } finally {
            setLoading(false);
        }
    };

    const handleCOD = async () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }
        if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zip || !formData.country) {
            toast.error("⚠️ Please fill all required fields before proceeding.");
            return;
        }

        if (saveDetails) {
            localStorage.setItem("savedCheckoutDetails", JSON.stringify({
                name: formData.name, email: formData.email, phone: formData.phone,
                address: formData.address, landmark: formData.landmark, city: formData.city,
                state: formData.state, zip: formData.zip, country: formData.country,
            }));
        } else {
            localStorage.removeItem("savedCheckoutDetails");
        }

        setCodLoading(true);
        try {
            const res = await client.post("/orders", {
                customerName: formData.name,
                customerEmail: formData.email,
                customerPhone: formData.phone,
                shippingAddress: {
                    address: formData.address,
                    landmark: formData.landmark,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip,
                    zipCode: formData.zip,
                    country: formData.country,
                },
                orderNotes: formData.orderNotes,
                items: cart.map((item) => ({
                    name: item.name,
                    variant: item.variant || "",
                    price: item.price,
                    quantity: item.quantity,
                })),
                totalAmount: total,
                paymentMode: "cod",
            });

            const details = {
                id: res.data._id || `ORD-${Date.now().toString().slice(-6)}`,
                date: new Date().toLocaleDateString('en-IN'),
                time: new Date().toLocaleTimeString('en-IN'),
                items: [...cart],
                address: `${formData.address}, ${formData.city} - ${formData.zip}`,
                total: total,
                paymentMode: 'cod'
            };
            clearCart();
            navigate('/order-success', { state: { orderDetails: details } });
        } catch (error: any) {
            toast.error("Order Failed", {
                description: error.response?.data?.message || "Could not place COD order.",
            });
        } finally {
            setCodLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#FBF7F0] flex flex-col items-center justify-center p-4">
                <ShoppingBag className="h-16 w-16 text-charcoal/20 mb-4" />
                <h2 className="text-2xl font-display text-charcoal mb-2">Your cart is empty</h2>
                <Button onClick={() => navigate("/")} variant="outline">
                    Return to Shop
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBF7F0]">
            {/* Premium Sticky Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="sticky top-0 z-50 bg-[#FBF7F0]/80 backdrop-blur-md border-b border-[hsl(44,80%,46%)]/10 shadow-sm"
            >
                <div className="max-w-6xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <button
                        onClick={() => navigate("/")}
                        className="group flex items-center gap-2 text-charcoal/70 hover:text-charcoal transition-colors px-3 py-1.5 rounded-full hover:bg-white/50"
                    >
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform border border-stone-200/50">
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        <span className="font-medium text-sm tracking-wide">Back to Shop</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <img src="/logo.jpeg" alt="Jamango" className="h-10 w-10 rounded-full border-2 border-white shadow-md" />
                        <span className="font-display font-bold text-xl text-charcoal hidden sm:block tracking-wide">CHECKOUT</span>
                    </div>

                    <div className="flex items-center gap-2 text-green-700 bg-green-50/80 px-4 py-1.5 rounded-full border border-green-200/50 backdrop-blur-sm shadow-sm">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">100% Secure</span>
                        <span className="text-xs font-bold uppercase tracking-widest sm:hidden">Secure</span>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

                    {/* Left Column: Cart & Details */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="space-y-8"
                    >
                        {/* Cart Selection */}
                        <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[hsl(44,30%,90%)] relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[hsl(44,90%,50%)] to-[hsl(35,90%,50%)] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />

                            <h2 className="font-display text-2xl text-charcoal mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[hsl(44,90%,50%)] text-white flex items-center justify-center text-sm font-bold shadow-md">1</span>
                                Your Harvest
                            </h2>
                            <div className="space-y-6">
                                {cart.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + (index * 0.1) }}
                                    >
                                        <CartItemRow
                                            item={item}
                                            updateQuantity={updateQuantity}
                                            removeFromCart={removeFromCart}
                                            addToCart={addToCart}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {/* NEW: Add More Mangoes Button */}
                            <div className="mt-6 pt-6 border-t border-dashed border-stone-200">
                                <Button
                                    onClick={() => setIsAddMoreOpen(true)}
                                    variant="outline"
                                    className="w-full h-12 rounded-xl border-[hsl(44,80%,46%)]/30 text-[hsl(44,90%,40%)] hover:bg-[hsl(44,90%,50%)]/5 hover:border-[hsl(44,80%,46%)] transition-all font-medium flex items-center justify-center gap-2 group"
                                >
                                    <div className="bg-[hsl(44,90%,50%)]/10 p-1 rounded-full group-hover:bg-[hsl(44,90%,50%)] transition-colors">
                                        <Plus className="h-4 w-4 text-[hsl(44,90%,40%)] group-hover:text-white transition-colors" />
                                    </div>
                                    Add More Mangoes
                                </Button>
                            </div>
                        </div>

                        {/* Shipping Form */}
                        <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[hsl(44,30%,90%)] relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[hsl(44,90%,50%)] to-[hsl(35,90%,50%)] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />

                            <h2 className="font-display text-2xl text-charcoal mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[hsl(44,90%,50%)] text-white flex items-center justify-center text-sm font-bold shadow-md">2</span>
                                Shipping Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-wider text-charcoal/60 font-semibold pl-1">Full Name *</Label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        className="h-12 rounded-xl border-stone-200 focus:border-[hsl(44,90%,45%)] focus:ring-[hsl(44,90%,45%)] bg-stone-50/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-wider text-charcoal/60 font-semibold pl-1">Phone Number *</Label>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+91 98765 43210"
                                        className="h-12 rounded-xl border-stone-200 focus:border-[hsl(44,90%,45%)] focus:ring-[hsl(44,90%,45%)] bg-stone-50/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs uppercase tracking-wider text-charcoal/60 font-semibold pl-1">Email Address *</Label>
                                    <Input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="you@email.com"
                                        className="h-12 rounded-xl border-stone-200 focus:border-[hsl(44,90%,45%)] focus:ring-[hsl(44,90%,45%)] bg-stone-50/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs uppercase tracking-wider text-charcoal/60 font-semibold pl-1">Delivery Address *</Label>
                                    <Input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Flat, House no., Building, Apartment, Area"
                                        className="h-12 rounded-xl border-stone-200 focus:border-[hsl(44,90%,45%)] focus:ring-[hsl(44,90%,45%)] bg-stone-50/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs uppercase tracking-wider text-charcoal/60 font-semibold pl-1">Landmark (Optional)</Label>
                                    <Input
                                        name="landmark"
                                        value={formData.landmark}
                                        onChange={handleInputChange}
                                        placeholder="Near a known location"
                                        className="h-12 rounded-xl border-stone-200 focus:border-[hsl(44,90%,45%)] focus:ring-[hsl(44,90%,45%)] bg-stone-50/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-wider text-charcoal/60 font-semibold pl-1">City *</Label>
                                    <Input
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="City / Town"
                                        className="h-12 rounded-xl border-stone-200 focus:border-[hsl(44,90%,45%)] focus:ring-[hsl(44,90%,45%)] bg-stone-50/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-wider text-charcoal/60 font-semibold pl-1">State *</Label>
                                    <Input
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        placeholder="State / Province"
                                        className="h-12 rounded-xl border-stone-200 focus:border-[hsl(44,90%,45%)] focus:ring-[hsl(44,90%,45%)] bg-stone-50/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-wider text-charcoal/60 font-semibold pl-1">ZIP / Postal Code *</Label>
                                    <Input
                                        name="zip"
                                        value={formData.zip}
                                        onChange={handleInputChange}
                                        placeholder="000000"
                                        className="h-12 rounded-xl border-stone-200 focus:border-[hsl(44,90%,45%)] focus:ring-[hsl(44,90%,45%)] bg-stone-50/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-wider text-charcoal/60 font-semibold pl-1">Country *</Label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={(e: any) => handleInputChange(e)}
                                        className="flex h-12 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(44,90%,45%)] focus:ring-1 focus:ring-[hsl(44,90%,45%)] disabled:cursor-not-allowed disabled:opacity-50"
                                        required
                                    >
                                        <option value="India">India</option>
                                        <option value="United States">United States</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Australia">Australia</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs uppercase tracking-wider text-charcoal/60 font-semibold pl-1">Order Notes (Optional)</Label>
                                    <textarea
                                        name="orderNotes"
                                        value={formData.orderNotes}
                                        onChange={(e: any) => handleInputChange(e)}
                                        placeholder="Special delivery instructions..."
                                        className="flex min-h-[80px] w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(44,90%,45%)] focus:ring-1 focus:ring-[hsl(44,90%,45%)] disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>

                                <div className="flex items-center space-x-2 md:col-span-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="saveDetails"
                                        checked={saveDetails}
                                        onChange={(e) => setSaveDetails(e.target.checked)}
                                        className="h-4 w-4 rounded border-stone-300 text-[hsl(44,90%,45%)] focus:ring-[hsl(44,90%,45%)] cursor-pointer"
                                    />
                                    <label
                                        htmlFor="saveDetails"
                                        className="text-sm font-medium leading-none cursor-pointer text-charcoal/70 user-select-none"
                                    >
                                        Save my details for faster checkout
                                    </label>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <div className="bg-white p-8 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[hsl(44,80%,46%)]/10 sticky top-28 bg-[url('/bg-pattern.png')] bg-repeat opacity-95">
                            <h2 className="font-display text-2xl text-charcoal mb-8">Order Summary</h2>

                            <div className="space-y-4 mb-8 bg-[#FBF7F0]/50 p-6 rounded-2xl border border-[hsl(44,30%,90%)]">
                                <div className="flex justify-between text-charcoal/70 text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-charcoal">₹{total}</span>
                                </div>
                                <div className="flex justify-between text-charcoal/70 text-sm">
                                    <span>Shipping</span>
                                    {shippingLoading ? (
                                        <span className="text-gray-400 font-medium">Calculating...</span>
                                    ) : shippingCost === null ? (
                                        <span className="text-gray-400 font-medium">Enter Pincode</span>
                                    ) : (
                                        <span className="text-charcoal font-medium flex items-center gap-1">
                                            ₹{shippingCost}
                                        </span>
                                    )}
                                </div>
                                <div className="h-px bg-charcoal/5 my-2 border-t border-dashed border-charcoal/20"></div>
                                <div className="flex justify-between text-xl font-bold text-[hsl(44,90%,40%)]">
                                    <span>Total Amount</span>
                                    <span>₹{grandTotal}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handlePayment}
                                disabled={loading}
                                className="group w-full h-16 bg-gradient-to-r from-[hsl(44,90%,45%)] to-[hsl(38,90%,50%)] hover:from-[hsl(44,90%,40%)] hover:to-[hsl(38,90%,45%)] text-white text-lg font-bold rounded-2xl shadow-lg shadow-[hsl(44,80%,46%)]/30 hover:shadow-xl hover:shadow-[hsl(44,80%,46%)]/50 transition-all transform hover:-translate-y-1 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
                                <span className="relative z-20 flex items-center justify-center gap-3">
                                    {loading ? (
                                        "Processing Securely..."
                                    ) : (
                                        <>
                                            Pay ₹{grandTotal}
                                            <ShieldCheck className="w-5 h-5 opacity-80" />
                                        </>
                                    )}
                                </span>
                            </Button>



                            <div className="mt-6 flex flex-col items-center gap-3 text-center">
                                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-charcoal/50 font-medium uppercase tracking-widest bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100">
                                    <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600" />
                                    <span>256-Bit SSL Secured Payment</span>
                                </div>
                                <p className="text-[10px] text-charcoal/40 max-w-xs leading-relaxed">
                                    We use Razorpay for secure payments. Your card details are never stored on our servers.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modals */}
            <AddMoreMangoesModal
                isOpen={isAddMoreOpen}
                onClose={() => setIsAddMoreOpen(false)}
                addToCart={addToCart}
            />
        </div>
    );
};

export default CheckoutPage;
