import { motion } from "framer-motion";

const VarietyGuide = () => {
    const varieties = [
        {
            name: "Banganapalli",
            aka: "The Family Favourite",
            desc: "Large, golden yellow with thin skin and juicy, mild sweetness. Fiber-free and perfect for every member of the family.",
            bestFor: "Slicing, Shakes & Pulp",
            color: "bg-[#FFD700]"
        },
        {
            name: "Alphonso",
            aka: "The King of Mangoes",
            desc: "World-renowned for its rich, buttery texture and intense aromatic sweetness. A premium indulgence with zero fiber.",
            bestFor: "Gifting & Pure Indulgence",
            color: "bg-[#FFB700]"
        },
        {
            name: "Kesar",
            aka: "The Queen of Fragrance",
            desc: "Distinguished by its incredible saffron aroma and vibrant orange pulp. Distinctly sweet with a unique flavor profile.",
            bestFor: "Aamras & Traditional Desserts",
            color: "bg-[#FFA500]"
        }
    ];

    return (
        <section className="section-padding bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-4">
                        Know Your <span className="text-[hsl(44,80%,46%)] italic">Mangoes</span>
                    </h2>
                    <p className="text-muted-foreground uppercase tracking-widest text-sm font-medium">
                        A guide to our seasonal harvest
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {varieties.map((variety, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative p-8 rounded-[32px] bg-[#FDFBF7] border border-[hsl(44,80%,46%)]/10 hover:border-[hsl(44,80%,46%)]/30 hover:shadow-xl transition-all duration-300"
                        >
                            {/* Decorative Dot */}
                            <div className={`w-12 h-12 rounded-full ${variety.color} mb-6 opacity-80 group-hover:scale-110 transition-transform duration-500`} />

                            <h3 className="font-display text-2xl text-charcoal mb-1">{variety.name}</h3>
                            <p className="text-[hsl(44,80%,46%)] font-medium text-sm tracking-wide uppercase mb-4">{variety.aka}</p>

                            <p className="text-charcoal/70 leading-relaxed mb-6 font-body text-sm md:text-base">
                                {variety.desc}
                            </p>

                            <div className="pt-6 border-t border-[hsl(44,80%,46%)]/10">
                                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Best For</p>
                                <p className="font-medium text-charcoal">{variety.bestFor}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default VarietyGuide;
