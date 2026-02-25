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

interface ModalVariant {
  name: string;
  price: string;
  badge?: string;
  description?: string;
  stock: number;
  mrp?: string;
  showDiscount?: boolean;
  discountLabel?: string;
  showBadge?: boolean;
  badgeType?: string;
  weight?: number;
}

interface ProductCardProps {
  title: string;
  subTitle: string;
  tagline: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  badge?: string;
  allOutOfStock?: boolean;
  variants: ModalVariant[];
  onOrder: (variant: ModalVariant) => void;
  delay?: number;
}

const ProductCard = ({ title, subTitle, tagline, isBestSeller, isNew, badge, allOutOfStock, variants, onOrder, delay = 0 }: ProductCardProps) => {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  useEffect(() => {
    if (variants && variants.length > 0) {
      const inStock = variants.find(v => v.stock > 0);
      setSelectedVariant(inStock || variants[0]);
    }
  }, [variants]);

  if (!selectedVariant) return null;

  const currentOutOfStock = selectedVariant.stock === 0;
  const showDiscount = selectedVariant.showDiscount;
  const discountLabel = selectedVariant.discountLabel;
  const price = selectedVariant.price;
  const mrp = selectedVariant.mrp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`bg-[#FDFBF7] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 border flex flex-col h-full relative group mx-auto w-full max-w-sm ${allOutOfStock ? 'border-red-200 opacity-75' : 'border-[hsl(44,30%,90%)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1'}`}
    >
      {/* Sold Out overlay */}
      {allOutOfStock && (
        <div className="absolute top-4 right-4 bg-red-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-sm z-20 uppercase tracking-[0.15em]">
          Sold Out
        </div>
      )}
      {!allOutOfStock && isBestSeller && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-[hsl(44,90%,40%)] text-[9px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-[hsl(44,90%,40%)]/10 z-20 uppercase tracking-[0.15em]">
          Best Seller
        </div>
      )}
      {!allOutOfStock && isNew && !isBestSeller && (
        <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-sm z-20 uppercase tracking-[0.15em]">
          New Arrival
        </div>
      )}
      {!allOutOfStock && !isBestSeller && !isNew && badge && (
        <div className="absolute top-4 right-4 bg-green-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-sm z-20 uppercase tracking-[0.15em]">
          {badge}
        </div>
      )}
      {!allOutOfStock && isNew && isBestSeller && (
        <div className="absolute top-12 right-4 bg-emerald-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-sm z-20 uppercase tracking-[0.15em]">
          New Arrival
        </div>
      )}

      {/* Discount Badge on Card Image if enabled */}
      {!allOutOfStock && showDiscount && discountLabel && (
        <div className="absolute top-4 left-4 bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm z-20 uppercase tracking-widest">
          {/^\d+$/.test(discountLabel) ? `${discountLabel}% OFF` : discountLabel}
        </div>
      )}

      <div className="aspect-[16/10] overflow-hidden relative">
        <div className="absolute inset-0 bg-stone-100/50 mix-blend-multiply z-10" />
        <img
          src={mangoBoxImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out grayscale-[10%] group-hover:grayscale-0"
          loading="lazy"
        />
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40 shadow-sm z-20">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-charcoal/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(44,90%,50%)]"></span>
            Premium Harvest
          </p>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-2xl font-medium text-charcoal tracking-wide leading-none">{title}</h3>
              {variants.length > 0 && (
                <div className="flex bg-stone-100/80 rounded-lg p-0.5 border border-stone-200/50">
                  {variants.map(v => (
                    <button
                      key={v.name}
                      onClick={(e) => { e.stopPropagation(); setSelectedVariant(v); }}
                      className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider transition-all ${selectedVariant.name === v.name
                          ? 'bg-white text-charcoal shadow-sm scale-100'
                          : 'text-stone-400 hover:text-charcoal scale-95'
                        }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end leading-none ml-2 shrink-0">
            <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mb-0.5">Price</span>
            <div className="flex items-center gap-2">
              {showDiscount && mrp && (
                <span className="text-xs text-stone-400 line-through decoration-stone-400/50">{mrp}</span>
              )}
              <span className={`font-display text-xl font-medium tracking-tight ${showDiscount ? 'text-red-600' : 'text-charcoal'}`}>
                {price}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm font-light text-charcoal/70 mb-4 tracking-wide leading-relaxed">{subTitle}</p>
        <p className="text-xs text-stone-500 font-normal italic mb-8 leading-relaxed opacity-80">"{tagline}"</p>

        <div className="mt-auto space-y-5">
          <div className="w-full flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-widest text-stone-400/90">
            <div className="flex items-center gap-1.5">
              <Sun className="h-3 w-3 text-[hsl(44,90%,45%)]" />
              <span>Harvested Daily</span>
            </div>
            <div className="h-px bg-stone-200/60 flex-grow rounded-full"></div>
            <div className="flex items-center gap-1.5">
              <span>Ships in 24h</span>
              <Clock className="h-3 w-3 text-[hsl(44,90%,45%)]" />
            </div>
          </div>

          <button
            onClick={currentOutOfStock ? undefined : () => onOrder(selectedVariant)}
            disabled={currentOutOfStock}
            className={`w-full py-3.5 font-bold tracking-widest text-sm rounded-2xl border transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden uppercase ${currentOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
              : 'bg-[hsl(44,85%,55%)] hover:bg-[hsl(44,90%,50%)] text-charcoal shadow-[0_4px_12px_rgba(255,180,0,0.2)] hover:shadow-[0_8px_16px_rgba(255,180,0,0.3)] border-[hsl(44,90%,50%)]'
              }`}
          >
            <span className="relative z-10">
              {currentOutOfStock ? 'Currently Unavailable' : 'Order Now'}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

function groupByVariety(products: DBProduct[]): {
  title: string;
  subTitle: string;
  tagline: string;
  isBestSeller: boolean;
  isNew: boolean;
  badge?: string;
  allOutOfStock: boolean;
  variants: ModalVariant[];
}[] {
  const varietyMap: Record<string, DBProduct[]> = {};
  products.forEach((p) => {
    if (!varietyMap[p.variety]) varietyMap[p.variety] = [];
    varietyMap[p.variety].push(p);
  });

  return Object.entries(varietyMap).map(([variety, items]) => {
    items.sort((a, b) => a.weight - b.weight);

    const isBestSeller = items.some((i) => i.showBadge && (i.badge?.toLowerCase().includes("best") || i.badge?.toLowerCase().includes("seller")));
    const isNew = items.some((i) => i.showBadge && i.badge?.toLowerCase().includes("new"));
    const badgeItem = items.find(i => i.showBadge && i.badge);
    const allOutOfStock = items.every(i => i.stock === 0);

    const baseTagline = "Farm fresh mangoes delivered to your doorstep.";

    return {
      title: variety,
      subTitle: "Naturally Ripened • Grade A",
      tagline: items[0].description || baseTagline,
      isBestSeller,
      isNew,
      badge: badgeItem ? badgeItem.badge : undefined,
      allOutOfStock,
      variants: items.map(i => ({
        name: `${i.weight}kg`,
        price: `₹${i.price.toLocaleString("en-IN")}`,
        mrp: i.mrp ? `₹${i.mrp.toLocaleString("en-IN")}` : undefined,
        weight: i.weight,
        stock: i.stock,
        showDiscount: i.showDiscount,
        discountLabel: i.discountLabel,
        badge: i.showBadge ? i.badge : undefined,
        showBadge: i.showBadge,
        badgeType: i.badgeType,
        description: i.description,
      }))
    };
  });
}

const ProductCards = () => {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<{
    name: string;
    price: string;
    variants?: ModalVariant[];
  } | null>(null);

  useEffect(() => {
    client
      .get("/products")
      .then(({ data }) => setProducts(data))
      .catch((err) => console.error("Failed to load products:", err))
      .finally(() => setLoading(false));
  }, []);

  const grouped = groupByVariety(products);

  return (
    <section id="products" className="section-padding bg-[#FBF7F0] relative">
      <div className="max-w-7xl mx-auto relative z-10 px-6">

        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl text-charcoal mb-4"
          >
            Choose Your <span className="text-[hsl(44,80%,46%)] italic">Variety</span>
          </motion.h2>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
            Select size options below
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
            {[0, 1].map((i) => (
              <div key={i} className="bg-[#FDFBF7] rounded-[32px] border border-[hsl(44,30%,90%)] overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-stone-200" />
                <div className="p-8 space-y-4">
                  <div className="h-6 bg-stone-200 rounded w-1/2" />
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-12 bg-stone-200 rounded-2xl mt-8" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No products yet */}
        {!loading && grouped.length === 0 && (
          <div className="text-center py-16 text-charcoal/50 font-body">
            <p className="text-lg">Products coming soon.</p>
            <p className="text-sm mt-2">Check back shortly or order via WhatsApp.</p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && grouped.length > 0 && (
          <div className={`grid gap-8 md:gap-12 max-w-4xl mx-auto justify-center ${grouped.length === 1 ? "md:grid-cols-1 max-w-sm" : "md:grid-cols-2"}`}>
            {grouped.map((product, index) => (
              <ProductCard
                key={product.title}
                {...product}
                delay={index * 0.1}
                onOrder={(variant) =>
                  setSelectedProduct({
                    name: `${product.title} (${variant.name})`,
                    price: variant.price,
                    variants: [],
                  })
                }
              />
            ))}
          </div>
        )}

      </div>

      <OrderModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        productName={selectedProduct?.name}
        productPrice={selectedProduct?.price}
        variants={selectedProduct?.variants}
      />
    </section>
  );
};

export default ProductCards;
