import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Clock } from "lucide-react";
import mangoBoxImage from "@/assets/mango-box.jpg";
import OrderModal from "@/components/jamango/OrderModal";
import client from "@/api/client";

interface DBProduct {
  _id: string;
  name: string;
  variety: string;
  weight: number;
  price: number;
  stock: number;
  active: boolean;
  badge: string;
  description: string;
  mrp?: number;
  showDiscount?: boolean;
  discountLabel?: string;
  showBadge?: boolean;
  badgeType?: string;
}



interface ProductCardProps {
  title: string;
  subTitle: string;
  tagline: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  badge?: string;
  outOfStock: boolean;
  price: string;
  mrp?: string;
  weight: number;
  showDiscount?: boolean;
  discountLabel?: string;
  onOrder: () => void;
  delay?: number;
}

const ProductCard = ({
  title,
  subTitle,
  tagline,
  isBestSeller,
  isNew,
  badge,
  outOfStock,
  price,
  mrp,
  weight,
  showDiscount,
  discountLabel,
  onOrder,
  delay = 0
}: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`bg-[#FDFBF7] rounded-[40px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 border flex flex-col h-full relative group mx-auto w-full max-w-sm ${outOfStock ? 'border-red-100 opacity-80' : 'border-[hsl(44,30%,90%)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1'}`}
    >
      {/* Badges */}
      <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
        {!outOfStock && showDiscount && discountLabel && (
          <div className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-widest">
            {/^\d+$/.test(discountLabel) ? `${discountLabel}% OFF` : discountLabel}
          </div>
        )}
      </div>

      <div className="absolute top-5 right-5 z-20 flex flex-col gap-2 items-end">
        {outOfStock ? (
          <div className="bg-red-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-[0.15em]">
            Sold Out
          </div>
        ) : (
          <>
            {isBestSeller && (
              <div className="bg-white/95 backdrop-blur-sm text-[hsl(44,90%,40%)] text-[9px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-[hsl(44,90%,40%)]/10 uppercase tracking-[0.15em]">
                Best Seller
              </div>
            )}
            {isNew && (
              <div className="bg-emerald-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-[0.15em]">
                New Arrival
              </div>
            )}
            {!isBestSeller && !isNew && badge && (
              <div className="bg-charcoal text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-[0.15em]">
                {badge}
              </div>
            )}
          </>
        )}
      </div>

      <div className="aspect-[16/11] overflow-hidden relative">
        <div className="absolute inset-0 bg-stone-100/40 mix-blend-multiply z-10" />
        <img
          src={mangoBoxImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
          loading="lazy"
        />
        <div className="absolute bottom-4 left-5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40 shadow-sm z-20">
          <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(44,90%,50%)] animate-pulse"></span>
            {weight} KG Box
          </p>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-2xl font-medium text-charcoal tracking-wide">{title}</h3>
            <p className="text-sm font-medium text-[hsl(44,90%,40%)] tracking-wide">{subTitle}</p>
          </div>
          <div className="flex flex-col items-end leading-none">
            <div className="flex items-center gap-2">
              {showDiscount && mrp && (
                <span className="text-xs text-stone-400 line-through decoration-stone-400/50">{mrp}</span>
              )}
              <span className={`font-display text-2xl font-medium tracking-tight ${showDiscount ? 'text-red-600' : 'text-charcoal'}`}>
                {price}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm font-light text-stone-500 mb-8 tracking-wide leading-relaxed italic opacity-90 line-clamp-3">"{tagline}"</p>

        <div className="mt-auto space-y-5">
          <div className="w-full h-px bg-stone-200/60 rounded-full"></div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              <Sun className="h-3.5 w-3.5 text-[hsl(44,90%,45%)]" />
              <span>Premium Harvest</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              <span>24h Dispatch</span>
              <Clock className="h-3.5 w-3.5 text-[hsl(44,90%,45%)]" />
            </div>
          </div>

          <button
            onClick={outOfStock ? undefined : onOrder}
            disabled={outOfStock}
            className={`w-full py-4 font-bold tracking-[0.2em] text-xs rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden uppercase ${outOfStock
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
              : 'bg-charcoal text-[#FBF7F0] hover:bg-black shadow-lg hover:-translate-y-0.5'
              }`}
          >
            <span>
              {outOfStock ? 'Completely Sold Out' : 'Add to Orchard Cart'}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};



const ProductCards = () => {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState<number>(5); // Default to 5kg
  const [selectedProduct, setSelectedProduct] = useState<{
    name: string;
    price: string;
  } | null>(null);

  useEffect(() => {
    client
      .get("/products")
      .then(({ data }) => setProducts(data))
      .catch((err) => console.error("Failed to load products:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter products by selected weight
  const filteredProducts = products.filter(p => p.active && p.weight === selectedWeight);
  const availableWeights = Array.from(new Set(products.map(p => p.weight))).sort((a, b) => a - b);

  return (
    <section id="products" className="section-padding bg-[#FBF7F0] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(44,100%,94%)] rounded-full blur-[100px] -mr-48 -mt-48 opacity-60" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[hsl(80,45%,94%)] rounded-full blur-[100px] -ml-48 -mb-48 opacity-60" />

      <div className="max-w-7xl mx-auto relative z-10 px-6">

        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(44,100%,90%)] border border-[hsl(44,100%,80%)] text-[hsl(44,90%,30%)] text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(44,90%,40%)] animate-pulse" />
            Seasonal Selection
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-6xl text-charcoal leading-[1.1]"
          >
            Reserve Your <span className="text-[hsl(44,80%,46%)] italic font-semibold">Orchard Box</span>
          </motion.h2>

          <p className="max-w-xl mx-auto text-stone-500 font-light text-base md:text-lg tracking-wide">
            Experience the gold standard of Devgad & Ratnagiri mangoes. Harvested at peak ripeness and shipped directly.
          </p>
        </div>

        {/* STEP 1: Weight Selection */}
        <div className="flex flex-col items-center mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[hsl(44,30%,85%)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-400">Step 1: Choose Box Size</span>
            <div className="w-8 h-px bg-[hsl(44,30%,85%)]" />
          </div>

          <div className="inline-flex items-center p-1.5 bg-stone-100/80 backdrop-blur-sm rounded-[24px] border border-stone-200/60 shadow-inner">
            {availableWeights.length > 0 ? (
              availableWeights.map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWeight(w)}
                  className={`group relative px-10 py-4 rounded-[18px] transition-all duration-500 overflow-hidden ${selectedWeight === w
                    ? 'bg-white shadow-xl shadow-charcoal/5'
                    : 'hover:bg-white/40'
                    }`}
                >
                  <div className={`relative z-10 flex flex-col items-center transition-transform duration-500 ${selectedWeight === w ? 'scale-105' : 'scale-100 opacity-60'}`}>
                    <span className={`text-2xl font-display font-medium leading-none ${selectedWeight === w ? 'text-charcoal' : 'text-stone-400'}`}>
                      {w} KG
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 ${selectedWeight === w ? 'text-[hsl(44,90%,40%)]' : 'text-stone-300'}`}>
                      Standard Box
                    </span>
                  </div>
                  {selectedWeight === w && (
                    <motion.div
                      layoutId="activeWeight"
                      className="absolute inset-0 bg-white"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))
            ) : (
              <div className="px-10 py-3 text-stone-400 font-medium italic text-sm">Sizes Loading...</div>
            )}
          </div>
        </div>

        {/* STEP 2: Variety Gallery */}
        <div className="space-y-12">
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="w-8 h-px bg-[hsl(44,30%,85%)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-400">Step 2: select Mango Variety</span>
            <div className="w-8 h-px bg-[hsl(44,30%,85%)]" />
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-[#FDFBF7] rounded-[40px] border border-[hsl(44,30%,90%)] overflow-hidden animate-pulse min-h-[500px]" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-stone-50/50 rounded-[40px] border border-stone-200/40">
              <Sun className="h-12 w-12 text-stone-200 mx-auto mb-4" />
              <p className="text-xl font-display text-stone-400">No {selectedWeight} KG boxes available right now.</p>
              <p className="text-sm text-stone-400 mt-2 font-light">Please try another box size or check back tomorrow.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto justify-center">
              {filteredProducts.map((p, index) => (
                <ProductCard
                  key={p._id}
                  title={p.variety}
                  subTitle="Naturally Ripened • Grade A"
                  tagline={p.description || "Farm fresh mangoes delivered to your doorstep."}
                  isBestSeller={p.showBadge && (p.badge?.toLowerCase().includes("best") || p.badge?.toLowerCase().includes("seller"))}
                  isNew={p.showBadge && p.badge?.toLowerCase().includes("new")}
                  badge={p.showBadge ? p.badge : undefined}
                  outOfStock={p.stock === 0}
                  price={`₹${p.price.toLocaleString("en-IN")}`}
                  mrp={p.mrp ? `₹${p.mrp.toLocaleString("en-IN")}` : undefined}
                  weight={p.weight}
                  showDiscount={p.showDiscount}
                  discountLabel={p.discountLabel}
                  delay={index * 0.1}
                  onOrder={() =>
                    setSelectedProduct({
                      name: `${p.variety} (${p.weight}kg)`,
                      price: `₹${p.price.toLocaleString("en-IN")}`,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>

      </div>

      <OrderModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        productName={selectedProduct?.name}
        productPrice={selectedProduct?.price}
      />
    </section>
  );
};

export default ProductCards;
