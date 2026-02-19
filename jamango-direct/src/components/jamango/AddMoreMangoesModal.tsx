import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products } from '@/data/products';
import { toast } from 'sonner';

interface AddMoreMangoesModalProps {
    isOpen: boolean;
    onClose: () => void;
    addToCart: (item: any) => void;
}

export const AddMoreMangoesModal = ({ isOpen, onClose, addToCart }: AddMoreMangoesModalProps) => {

    const [apiProducts, setApiProducts] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (isOpen) {
            import("@/api/client").then(({ default: client }) => {
                client.get("/products")
                    .then(({ data }) => setApiProducts(data))
                    .catch((err) => console.error("Failed to load add-on products:", err));
            });
        }
    }, [isOpen]);

    // Group variants by Mango Name from API data
    const varieties = useMemo(() => {
        const map = new Map<string, any[]>();

        // If API data is empty, we fall back to nothing (or could fall back to static, but static has no stock)
        // Let's rely on API data for consistency.
        if (apiProducts.length === 0) return [];

        apiProducts.forEach(product => {
            // Check if product follows naming pattern "Name QuantityKG" e.g. "Banganapalli 3KG"
            // The DB product structure is flat: { name: "Banganapalli 3KG", variety: "Banganapalli", weight: 3, ... }

            const name = product.variety; // "Banganapalli"
            const weight = `${product.weight}KG`; // "3KG"

            if (!map.has(name)) {
                map.set(name, []);
            }

            map.get(name)?.push({
                weight,
                price: `₹${product.price}`,
                fullName: product.name,
                categoryTitle: `${product.weight} KG Box`,
                rawPrice: product.price,
                stock: product.stock,
                active: product.active
            });
        });

        // Sort weights
        map.forEach((options) => {
            options.sort((a, b) => {
                const weightA = parseInt(a.weight) || 0;
                const weightB = parseInt(b.weight) || 0;
                return weightA - weightB;
            });
        });

        return Array.from(map.entries());
    }, [apiProducts]);

    const handleAdd = (option: any) => {
        addToCart({
            name: option.categoryTitle,
            variant: option.fullName,
            price: option.rawPrice
        });
        toast.success(`Added ${option.fullName} to cart`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-charcoal/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white pointer-events-auto w-full max-w-2xl max-h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-[hsl(44,30%,90%)]">
                            {/* Header */}
                            <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between bg-[#FBF7F0]/50">
                                <div>
                                    <h2 className="font-display text-2xl text-charcoal">Add More Mangoes</h2>
                                    <p className="text-sm text-charcoal/60">Select varieties to add to your harvest</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-black/5 rounded-full transition-colors text-charcoal/60 hover:text-charcoal"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                                {varieties.map(([name, options]) => (
                                    <div key={name} className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full bg-[hsl(44,90%,50%)]"></div>
                                            <h3 className="font-display text-lg text-charcoal">{name}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                                            {options.map((option: any) => (
                                                <div
                                                    key={option.fullName}
                                                    className="flex items-center justify-between p-3 rounded-xl border border-stone-100 bg-stone-50/50 hover:bg-stone-50 hover:border-[hsl(44,80%,46%)]/30 transition-all group"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm text-charcoal flex items-center gap-1.5">
                                                            {option.weight}
                                                            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-white border border-stone-200 rounded text-charcoal/60">Box</span>
                                                        </span>
                                                        <span className="text-xs font-medium text-[hsl(44,90%,40%)] mt-0.5">{option.price}</span>
                                                        <div className="mt-1">
                                                            {option.stock === 0 ? (
                                                                <span className="text-[9px] font-bold text-red-500 uppercase">Out of Stock</span>
                                                            ) : (
                                                                <span className={`text-[9px] font-bold ${option.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                                                    {option.stock < 10 ? `Only ${option.stock} left` : `${option.stock} in stock`}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAdd(option)}
                                                        disabled={option.stock === 0}
                                                        className={`h-8 px-4 border transition-all shadow-sm font-medium text-xs rounded-lg ${option.stock === 0
                                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                            : "bg-white hover:bg-[hsl(44,90%,50%)] text-charcoal hover:text-white border-stone-200 hover:border-transparent"
                                                            }`}
                                                    >
                                                        {option.stock === 0 ? "Sold Out" : "Add +"}
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
                                <Button onClick={onClose} className="px-8 rounded-xl bg-charcoal text-white hover:bg-charcoal/90">
                                    Done
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
