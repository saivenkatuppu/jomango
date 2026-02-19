import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName?: string;
    productPrice?: string;
    variants?: {
        name: string;
        price: string;
        badge?: string;
        description?: string;
        stock?: number;
    }[];
}

const OrderModal = ({ isOpen, onClose, productName = "Premium Mango Box", productPrice, variants }: OrderModalProps) => {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [selectedVariant, setSelectedVariant] = useState<{ name: string; price: string } | null>(null);

    // Reset variant when modal opens/closes or product changes
    useEffect(() => {
        if (isOpen) {
            setSelectedVariant(null);
        }
    }, [isOpen, productName]);

    const handleWhatsAppOrder = () => {
        const finalProduct = selectedVariant ? `${productName} (${selectedVariant.name})` : productName;
        const finalPrice = selectedVariant ? selectedVariant.price : productPrice;

        const message = `Hi, I'd like to order the *${finalProduct}*${finalPrice ? ` for ${finalPrice}` : ""}. Is it available?`;
        window.open(`https://wa.me/919999999999?text=${encodeURIComponent(message)}`, "_blank");
        onClose();
    };

    const handleWebsiteOrder = () => {
        const name = productName;
        const variant = selectedVariant ? selectedVariant.name : undefined;
        // Parse price: "₹1,599" -> 1599
        const priceString = selectedVariant ? selectedVariant.price : productPrice;
        const price = parseInt(priceString?.replace(/[^0-9]/g, "") || "0");

        if (price === 0) {
            console.error("Invalid price parsed");
            return;
        }

        addToCart({
            name,
            variant,
            price
        });

        onClose();
        navigate("/checkout");
    };

    const hasVariants = variants && variants.length > 0;
    const isReadyToOrder = !hasVariants || selectedVariant;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#FBF7F0] border-[hsl(44,80%,46%)]/20 shadow-2xl p-0 overflow-hidden rounded-[32px] max-h-[90vh] overflow-y-auto">

                {/* Header Section */}
                <div className="bg-[#F8F4EC] p-6 md:p-8 text-center relative overflow-hidden border-b border-[hsl(44,80%,46%)]/10">
                    <div className="absolute inset-0 bg-heritage-pattern opacity-40 mx-auto" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[hsl(44,80%,46%)] to-transparent opacity-50" />

                    <div className="relative z-10 flex flex-col items-center">
                        <DialogTitle className="font-display text-3xl md:text-4xl text-charcoal mb-2 tracking-tight">
                            Start Your Harvest
                        </DialogTitle>
                        <DialogDescription className="text-charcoal/70 font-body text-base md:text-lg leading-relaxed max-w-[90%] mx-auto">
                            You've selected the <br />
                            <span className="font-medium text-[hsl(44,80%,46%)] text-xl">
                                {productName}
                            </span>
                        </DialogDescription>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">

                    {/* Variant Selector */}
                    {hasVariants && (
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-charcoal/80 uppercase tracking-wider block">
                                Choose Your Mango Variety:
                            </label>
                            <div className="grid gap-3">
                                {variants!.map((variant) => {
                                    const outOfStock = (variant.stock ?? 1) === 0;
                                    const isSelected = selectedVariant?.name === variant.name;
                                    return (
                                        <button
                                            key={variant.name}
                                            onClick={() => !outOfStock && setSelectedVariant(variant)}
                                            disabled={outOfStock}
                                            className={`w-full flex items-start justify-between p-4 rounded-xl border transition-all duration-200 group ${outOfStock
                                                ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                                                : isSelected
                                                    ? 'bg-[hsl(44,80%,46%)]/10 border-[hsl(44,80%,46%)] shadow-sm'
                                                    : 'bg-white border-border/50 hover:border-[hsl(44,80%,46%)]/50 hover:bg-gray-50/50'
                                                }`}
                                        >
                                            <div className="flex flex-col items-start gap-1 text-left">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`font-display font-semibold text-lg leading-tight ${outOfStock ? 'text-gray-400' : isSelected ? 'text-[hsl(44,80%,46%)]' : 'text-charcoal group-hover:text-charcoal/90'
                                                        }`}>
                                                        {variant.name}
                                                    </span>
                                                    {outOfStock && (
                                                        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                    {!outOfStock && variant.badge && (
                                                        <span className="bg-[hsl(44,80%,46%)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                                            {variant.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                {variant.description && (
                                                    <span className="text-xs text-charcoal/60 font-medium italic leading-snug max-w-[260px]">
                                                        {variant.description}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`font-body font-bold text-lg ${outOfStock ? 'text-gray-400' : isSelected ? 'text-[hsl(44,80%,46%)]' : 'text-charcoal'
                                                    }`}>
                                                    {variant.price}
                                                </span>
                                                {!outOfStock && (
                                                    <span className={`text-[10px] font-medium uppercase tracking-wide ${(variant.stock ?? 0) < 10 ? 'text-red-500' : 'text-green-600'
                                                        }`}>
                                                        {(variant.stock ?? 0) < 10 ? `Only ${variant.stock} left` : `${variant.stock} in stock`}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className={`space-y-6 transition-opacity duration-300 ${!isReadyToOrder ? "opacity-50 pointer-events-none grayscale" : "opacity-100"}`}>

                        {/* Option 1: Website */}
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                onClick={handleWebsiteOrder}
                                className="w-full h-auto py-5 bg-gradient-to-br from-charcoal to-black hover:bg-charcoal/90 text-white flex items-center justify-between group rounded-2xl shadow-lg border border-white/5 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-full bg-white/5 skew-x-12 group-hover:translate-x-4 transition-transform duration-500" />
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 shadow-inner">
                                        <ShoppingBag className="h-7 w-7 text-white/90" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-xl leading-none mb-1.5 font-display tracking-wide">Website Checkout</span>
                                        <span className="block text-xs font-medium tracking-wider text-white/60 group-hover:text-white/80 transition-colors">SECURE CARD PAYMENT</span>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-white/70" />
                            </Button>
                        </motion.div>

                        {/* Divider */}
                        <div className="relative flex items-center py-1">
                            <div className="flex-grow border-t border-[hsl(44,80%,46%)]/20"></div>
                            <span className="flex-shrink-0 mx-4 text-[hsl(44,80%,46%)] font-display italic text-lg opacity-70">or</span>
                            <div className="flex-grow border-t border-[hsl(44,80%,46%)]/20"></div>
                        </div>

                        {/* Option 2: WhatsApp */}
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                onClick={handleWhatsAppOrder}
                                className="w-full h-auto py-5 bg-gradient-to-br from-[#25D366] to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0e7064] text-white flex items-center justify-between group rounded-2xl shadow-lg shadow-[#25D366]/25 border border-white/10 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10" />
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm shadow-inner">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-7 w-7 fill-current text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-xl leading-none mb-1.5 font-display tracking-wide">WhatsApp Order</span>
                                        <span className="block text-xs font-medium tracking-wider text-white/90">BEST FOR PERSONAL CARE</span>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </motion.div>
                    </div>

                    {/* Trust Footer */}
                    <div className="pt-2 flex items-center justify-center gap-2 text-charcoal/40 text-[10px] uppercase font-bold tracking-widest">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>House of Munagala Guarantee</span>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default OrderModal;
