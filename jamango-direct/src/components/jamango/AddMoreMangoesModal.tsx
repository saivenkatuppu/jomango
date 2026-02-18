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

    // Group variants by Mango Name (e.g. "Alphonso", "Kesar")
    // ensuring we show options for 3KG and 5KG side-by-side
    const varieties = useMemo(() => {
        const map = new Map<string, any[]>();

        products.forEach(productCategory => {
            productCategory.variants.forEach(variant => {
                // Parse "Name (Weight)" format
                // e.g. "Banganapalli (3KG)" -> Name: Banganapalli, Weight: 3KG
                const match = variant.name.match(/^(.*?)\s*\((.*?)\)$/);

                if (match) {
                    const name = match[1];
                    const weight = match[2];

                    if (!map.has(name)) {
                        map.set(name, []);
                    }

                    map.get(name)?.push({
                        weight, // "3KG" or "5KG"
                        price: variant.price,
                        fullName: variant.name,
                        categoryTitle: productCategory.title, // "3 KG Box" or "5 KG Box"
                        rawPrice: parseInt(variant.price.replace(/[^0-9]/g, "") || "0")
                    });
                } else {
                    // Fallback for items that might not match pattern perfectly
                    // or handle them as standalone
                    if (!map.has(variant.name)) {
                        map.set(variant.name, []);
                    }
                    map.get(variant.name)?.push({
                        weight: "Standard",
                        price: variant.price,
                        fullName: variant.name,
                        categoryTitle: productCategory.title,
                        rawPrice: parseInt(variant.price.replace(/[^0-9]/g, "") || "0")
                    });
                }
            });
        });

        // Sort weights for consistency (3KG first, then 5KG)
        map.forEach((options) => {
            options.sort((a, b) => {
                const weightA = parseInt(a.weight) || 0;
                const weightB = parseInt(b.weight) || 0;
                return weightA - weightB;
            });
        });

        return Array.from(map.entries());
    }, []);

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
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAdd(option)}
                                                        className="h-8 px-4 bg-white hover:bg-[hsl(44,90%,50%)] text-charcoal hover:text-white border border-stone-200 hover:border-transparent transition-all shadow-sm font-medium text-xs rounded-lg"
                                                    >
                                                        Add +
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
