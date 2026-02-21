import { useState, useEffect } from "react";
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
        title: "Why You Should Buy Carbide-Free, Naturally Ripened Mangoes",
        excerpt: "Discover the health benefits of authentic, naturally ripened Alphonso and Banganapalli mangoes vs. chemically treated alternatives. Order premium chemical-free mangoes online.",
        date: "May 15, 2026",
        image: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=1000&auto=format&fit=crop",
        readTime: "4 min read",
        content: [
            "When looking to buy mangoes online in India, the most important factor to consider is how the fruit was ripened. In the rush to deliver early crops, many suppliers rely on Calcium Carbide, a chemical ripening agent. While this produces a uniformly yellow fruit, it completely stunts the natural development of sugars, leading to a sour, flavorless experience. Furthermore, chemically ripened mangoes often contain traces of harmful toxins like arsenic and phosphorus.",
            "At JAMANGO, we are committed to sustainable farming and your family's health. We strictly specialize in premium, 100% carbide-free mangoes. Our fruits are naturally ripened using traditional grass and hay methods. This organic ripening process allows the mango's natural enzymes to break down starches into complex sugars, resulting in the intensely sweet, aromatic flavor profile that authentic Alphonso and Banganapalli mangoes are famous for globally.",
            "Choosing to buy naturally ripened mangoes directly impacts your nutritional intake. A chemical-free ripening process naturally protects the fruit's rich reserves of Vitamin C, Vitamin A, and essential antioxidants. We guarantee that every JAMANGO delivery provides maximum health benefits without compromising on taste.",
            "Don't settle for artificially forced flavors. When you order a premium mango box from JAMANGO, you are investing in farm-fresh, naturally ripened fruit delivered straight from our orchards to your doorstep. Taste the authentic sweetness of India's finest mangoes today."
        ]
    },
    {
        id: 2,
        title: "Farm to Table: How We Deliver Fresh Mangoes Nationwide",
        excerpt: "Learn about JAMANGO's premium supply chain. From careful hand-harvesting at our orchards to fast overnight mango delivery direct to your home in India.",
        date: "May 10, 2026",
        image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?q=80&w=1000&auto=format&fit=crop",
        readTime: "3 min read",
        content: [
            "Ordering fresh fruit online requires trust. How does a delicate fruit travel safely from the farm to your table? The JAMANGO farm-to-doorstep process is engineered for ultimate freshness. Our journey begins at sunrise, where expert harvesters hand-pick premium Banganapalli and Alphonso mangoes only when they reach peak horticultural maturity.",
            "Once harvested, each fruit undergoes a rigorous quality control check. We gently wash the mangoes to remove natural sap and sort them meticulously based on size, weight, and visual perfection. Only the top 5% of export-quality fruit makes it into a JAMANGO premium mango shipment.",
            "High-quality packaging is critical for safe mango delivery. We utilize eco-friendly, ventilated corrugated boxes integrated with protective honeycomb separators. This advanced packaging technique ensures that mangoes do not bruise each other during transit while maintaining the essential airflow needed for the natural ripening process.",
            "Partnering with India's fastest logistics networks, we ensure priority dispatch on all orders. Within 24 hours of packing, your authentic mango box is shipped with live tracking updates. Experience the ultimate convenience of buying fresh, farm-direct mangoes online with JAMANGO."
        ]
    },
    {
        id: 3,
        title: "Banganapalli vs. Alphonso: A Guide to India's Best Mango Varieties",
        excerpt: "Compare the taste, texture, and aroma of authentic Alphonso and Banganapalli mangoes. Find out which premium Indian mango variety is perfect for your palate.",
        date: "May 5, 2026",
        image: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?q=80&w=1000&auto=format&fit=crop",
        readTime: "6 min read",
        content: [
            "India is the world's capital of mangoes, boasting hundreds of cultivars. However, when customers look to buy premium mangoes online, two elite varieties dominate the market: the legendary Alphonso (Hapus) and the majestic Banganapalli (Benishan). Understanding the differences between these two exotic fruits will elevate your tasting experience.",
            "The **Alphonso Mango**, universally acclaimed as the King of Mangoes, originates from the mineral-rich soils of the Konkan coast. Recognized by its distinctive golden-saffron hue and medium size, the authentic Alphonso offers a fiberless, buttery texture. Its flavor profile is globally revered—an intense, complex sweetness balanced with a subtle tartness, accompanied by a powerful, tropical floral aroma.",
            "The **Banganapalli Mango**, affectionately known as the Pride of Andhra, is characteristically larger and features unblemished, bright yellow skin. As a Geographical Indication (GI) tagged fruit, it boasts a firm, meaty, and exceptionally sweet flesh with almost zero fiber. Its mild, pleasant fragrance and substantial size make it the perfect slicing mango for family desserts.",
            "Which is the best mango variety to buy? If you desire an intensely fragrant, creamy dessert fruit, the Alphonso is unmatched. If you prefer a larger, satisfyingly sweet and firm fruit, the Banganapalli is the ideal choice. Explore our shop to order authentic, export-quality Alphonso and Banganapalli mangoes shipped directly from the farm."
        ]
    }
];

const Blogs = () => {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    // SEO Optimization
    useEffect(() => {
        // Update basic meta tags
        document.title = selectedPost
            ? `${selectedPost.title} | JAMANGO Blogs`
            : "The Mango Chronicles - Discover Carbide-Free Mangoes | JAMANGO";

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", selectedPost
                ? selectedPost.excerpt
                : "Read the latest stories and guides on naturally ripened, carbide-free Alphonso and Banganapalli mangoes. Learn about from-farm-to-doorstep freshness with JAMANGO.");
        } else {
            const newMeta = document.createElement('meta');
            newMeta.name = "description";
            newMeta.content = selectedPost
                ? selectedPost.excerpt
                : "Read the latest stories and guides on naturally ripened, carbide-free Alphonso and Banganapalli mangoes. Learn about from-farm-to-doorstep freshness with JAMANGO.";
            document.head.appendChild(newMeta);
        }

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute("href", window.location.href);

        // JSON-LD Structured Data
        let script = document.getElementById('seo-json-ld');
        if (!script) {
            script = document.createElement('script');
            script.id = 'seo-json-ld';
            script.setAttribute('type', 'application/ld+json');
            document.head.appendChild(script);
        }

        const structuredData = selectedPost ? {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": selectedPost.title,
            "image": selectedPost.image,
            "datePublished": selectedPost.date,
            "description": selectedPost.excerpt,
            "author": {
                "@type": "Organization",
                "name": "JAMANGO"
            }
        } : {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "The Mango Chronicles",
            "description": "Educational articles about natural, carbide-free mango farming and varieties.",
            "url": window.location.href,
            "blogPost": blogPosts.map(post => ({
                "@type": "BlogPosting",
                "headline": post.title,
                "datePublished": post.date,
                "description": post.excerpt,
                "image": post.image
            }))
        };

        script.textContent = JSON.stringify(structuredData);

        return () => {
            // Cleanup title and description when component unmounts
            document.title = "JAMANGO - Pure Mangoes";
            if (metaDesc) metaDesc.setAttribute("content", "Jamango offers premium quality, naturally ripened, carbide-free mangoes.");

            const existingScript = document.getElementById('seo-json-ld');
            if (existingScript) existingScript.remove();
        };
    }, [selectedPost]);

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
