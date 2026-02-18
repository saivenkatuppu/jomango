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
}

interface ModalVariant {
  name: string;
  price: string;
  badge?: string;
  description?: string;
  stock: number;
}

interface ProductCardProps {
  title: string;
  subTitle: string;
  price: string;
  tagline: string;
  isBestSeller?: boolean;
  allOutOfStock?: boolean;
  onOrder: () => void;
  delay?: number;
}

const ProductCard = ({ title, subTitle, price, tagline, isBestSeller, allOutOfStock, onOrder, delay = 0 }: ProductCardProps) => {
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
            Select Variety
          </p>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-end mb-3">
          <h3 className="font-display text-2xl font-medium text-charcoal tracking-wide leading-none">{title}</h3>
          <div className="flex flex-col items-end leading-none">
            <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mb-0.5">Starts from</span>
            <span className="font-display text-xl font-medium text-[hsl(44,80%,40%)] tracking-tight opacity-90">{price}</span>
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
            onClick={allOutOfStock ? undefined : onOrder}
            disabled={allOutOfStock}
            className={`w-full py-3.5 font-medium text-sm rounded-2xl border-t transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${allOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200'
                : 'bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] text-[#FDFBF7] shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] border-white/5'
              }`}
          >
            <span className="relative z-10 tracking-widest uppercase text-xs">
              {allOutOfStock ? 'Currently Unavailable' : 'Secure Your Harvest'}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Group DB products by weight (box size) so each box size = one card with variants
function groupByWeight(products: DBProduct[]): {
  title: string;
  subTitle: string;
  price: string;
  tagline: string;
  isBestSeller: boolean;
  allOutOfStock: boolean;
  variants: ModalVariant[];
}[] {
  const weightMap: Record<number, DBProduct[]> = {};
  products.forEach((p) => {
    if (!weightMap[p.weight]) weightMap[p.weight] = [];
    weightMap[p.weight].push(p);
  });

  return Object.entries(weightMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([weight, items]) => {
      const inStockItems = items.filter((i) => i.stock > 0);
      const minPrice = Math.min(...(inStockItems.length > 0 ? inStockItems : items).map((i) => i.price));
      const mangoCount = Number(weight) === 3 ? "6–9" : Number(weight) === 5 ? "10–14" : `~${Math.round(Number(weight) * 2.5)}`;
      return {
        title: `${weight} KG Box`,
        subTitle: `${mangoCount} Mangoes • Naturally Ripened`,
        price: `₹${minPrice.toLocaleString("en-IN")}`,
        tagline:
          Number(weight) <= 3
            ? "Perfect for small families or personal indulgence."
            : "The ideal choice for sharing the sweetness.",
        isBestSeller: items.some((i) => i.badge?.toLowerCase().includes("best") || i.badge?.toLowerCase().includes("seller")),
        allOutOfStock: items.every((i) => i.stock === 0),
        variants: items.map((i) => ({
          name: `${i.variety} (${weight}KG)`,
          price: `₹${i.price.toLocaleString("en-IN")}`,
          badge: i.badge || undefined,
          description: i.description || undefined,
          stock: i.stock,
        })),
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

  const grouped = groupByWeight(products);

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
            Choose Your <span className="text-[hsl(44,80%,46%)] italic">Box Size</span>
          </motion.h2>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
            Select variety after choosing a box
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
                onOrder={() =>
                  setSelectedProduct({
                    name: product.title,
                    price: product.price,
                    variants: product.variants,
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
