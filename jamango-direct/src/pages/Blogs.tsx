import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SiteHeader from "@/components/jamango/SiteHeader";
import SiteFooter from "@/components/jamango/SiteFooter";
import { X, Calendar, Clock, ArrowRight } from "lucide-react";

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    date: string;
    image: string;
    readTime: string;
    content: string[];
}

const blogPosts: BlogPost[] = [
    {
        id: 1,
        title: "Why Carbide-Free Mangoes Are Better for You",
        excerpt: "Discover the health benefits of naturally ripened mangoes vs. chemically treated ones.",
        date: "May 15, 2026",
        image: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=1000&auto=format&fit=crop",
        readTime: "4 min read",
        content: [
            "In the rush to get mangoes to market early, many traders resort to using Calcium Carbide, a chemical ripening agent. While this makes the fruit turn yellow quickly, it doesn't allow the natural sugars and flavors to develop. More importantly, Calcium Carbide often contains traces of arsenic and phosphorus, which can be harmful to your health.",
            "At JAMANGO, we believe in doing things the right way, even if it takes longer. Our mangoes are 100% carbide-free and naturally ripened in grass or hay. This traditional method allows the fruit to mature at its own pace, developing the full, rich sweetness and aroma that Alphonso and Banganapalli mangoes are famous for.",
            "When you eat a naturally ripened mango, you're not just getting better taste—you're getting better nutrition. Natural ripening preserves the vitamin content and antioxidants, ensuring that what you eat is as healthy as it is delicious.",
            "So next time you buy a mango, ask yourself: is this real gold, or just fool's gold? With JAMANGO, you never have to guess. We guarantee pure, natural goodness in every box."
        ]
    },
    {
        id: 2,
        title: "The Journey from Farm to Your Doorstep",
        excerpt: "See how we carefully harvest, pack, and ship your mangoes within 24 hours.",
        date: "May 10, 2026",
        image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?q=80&w=1000&auto=format&fit=crop",
        readTime: "3 min read",
        content: [
            "Ever wondered how a mango gets from our tree to your table? It's a journey of precision and care. It starts before sunrise, when our skilled harvesters inspect the trees. They pick only the fruits that have reached full maturity—the stage just before ripening begins.",
            "Once picked, the mangoes are carefully washed to remove sap, which can blemish the skin. They are then gently patted dry and sorted by size and weight. This is where we separate the premium export-quality fruit from the rest.",
            "Packing is an art in itself. We use eco-friendly corrugated boxes with honeycomb separators to ensure that no two mangoes touch each other. This prevents bruising during transit. Each box allows for airflow, which is crucial for the fruit to breathe as it travels.",
            "Within 24 hours of harvest, your box is sealed and dispatched. We partner with premium logistics providers to ensure overnight delivery to major cities. When you open a JAMANGO box, you're experiencing freshness that supermarket mangoes simply can't match."
        ]
    },
    {
        id: 3,
        title: "Understanding Mango Varieties: Banganapalli vs. Alphonso",
        excerpt: "A guide to the distinct tastes, textures, and aromas of India's favorite mangoes.",
        date: "May 5, 2026",
        image: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?q=80&w=1000&auto=format&fit=crop",
        readTime: "6 min read",
        content: [
            "India is home to hundreds of mango varieties, but two names reign supreme: the Alphonso (Hapus) and the Banganapalli. While both are delicious, they offer very different experiences for the mango connoisseur.",
            "The **Alphonso**, often called the King of Mangoes, hails from the Konkan coast. It is small to medium in size, with a distinct oblique shape and orange-yellow skin. Its flesh is saffron-colored, fiber-free, and incredibly creamy. The taste is a perfect balance of rich sweetness and a hint of tartness, with a powerful, floral aroma that fills the room.",
            "The **Banganapalli**, the Pride of Andhra, is much larger. It has a bright yellow, spotless skin and is oval-shaped. The flesh is firm, meaty, and sweet, with very little fiber. It's known for its mild, pleasant aroma and is perfect for slicing into big, juicy chunks.",
            "Which one is better? It's a matter of personal preference. If you love intense, creamy richness, go for Alphonso. If you prefer a larger, meatier fruit that's sweet and satisfying, Banganapalli is your choice. Or better yet—why not try both?"
        ]
    }
];

const Blogs = () => {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    return (
        <div className="min-h-screen flex flex-col bg-[#FBF7F0]">
            <SiteHeader />

            <main className="flex-grow pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <span className="text-[hsl(44,90%,50%)] font-bold tracking-widest uppercase text-sm mb-3 block">
                        Latest Stories
                    </span>
                    <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-4">
                        The Mango Chronicles
                    </h1>
                    <div className="w-24 h-1 bg-[hsl(44,90%,50%)] mx-auto rounded-full opacity-80" />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col h-full cursor-pointer"
                            onClick={() => setSelectedPost(post)}
                        >
                            <div className="aspect-[4/3] overflow-hidden relative">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                            </div>

                            <div className="p-6 md:p-8 flex flex-col flex-grow">
                                <div className="flex items-center gap-3 text-xs font-medium text-stone-500 mb-4 uppercase tracking-wider">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                                    <span className="w-1 h-1 bg-stone-300 rounded-full" />
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                                </div>

                                <h3 className="font-display text-2xl text-charcoal mb-3 group-hover:text-[hsl(44,80%,46%)] transition-colors leading-tight">
                                    {post.title}
                                </h3>

                                <p className="text-stone-600 font-body leading-relaxed mb-6 flex-grow line-clamp-3">
                                    {post.excerpt}
                                </p>

                                <button className="text-[hsl(44,80%,46%)] font-bold text-sm uppercase tracking-widest self-start group-hover:underline decoration-2 underline-offset-4 flex items-center gap-2">
                                    Read Article <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            <SiteFooter />

            {/* Article Modal */}
            <AnimatePresence>
                {selectedPost && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPost(null)}
                            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl relative z-10 scrollbar-hide"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur hover:bg-stone-100 rounded-full transition-colors z-20 border border-stone-200"
                            >
                                <X className="w-6 h-6 text-charcoal" />
                            </button>

                            {/* Hero Image */}
                            <div className="h-64 md:h-80 w-full relative">
                                <img
                                    src={selectedPost.image}
                                    alt={selectedPost.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-6 left-6 md:left-10 text-white">
                                    <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider mb-2 opacity-90">
                                        <span>{selectedPost.date}</span>
                                        <span className="w-1 h-1 bg-white/50 rounded-full" />
                                        <span>{selectedPost.readTime}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 md:p-12">
                                <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-8 leading-tight">
                                    {selectedPost.title}
                                </h2>

                                <div className="space-y-6 text-stone-600 font-body text-lg leading-relaxed">
                                    {selectedPost.content.map((paragraph, idx) => (
                                        <p key={idx}>{paragraph}</p>
                                    ))}
                                </div>

                                <div className="mt-12 pt-8 border-t border-stone-100">
                                    <p className="text-sm text-stone-400 italic">
                                        Author: The JAMANGO Team
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Blogs;
