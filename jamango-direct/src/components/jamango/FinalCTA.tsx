import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
    return (
        <section className="py-20 bg-[hsl(44,80%,46%)] text-charcoal relative overflow-hidden">
            {/* Background Pattern/Texture for depth - optional subtle overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-multiply"></div>

            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
                        Ready to taste the <span className="italic text-white">difference?</span>
                    </h2>
                    <p className="font-body text-lg md:text-xl mb-10 text-charcoal/80 max-w-2xl mx-auto leading-relaxed">
                        Authentic Alphonso mangoes are seasonal and rare. <br className="hidden md:block" />
                        Secure your family's box before the harvest ends.
                    </p>

                    <a
                        href="#products"
                        className="inline-flex items-center gap-2 px-10 py-5 bg-charcoal text-white font-medium text-lg rounded-full shadow-xl hover:bg-black hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group"
                    >
                        Order Your Harvest Now
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </a>

                    <p className="mt-6 text-sm font-medium opacity-70 uppercase tracking-widest">
                        — Next Dispatch: Tomorrow Morning —
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default FinalCTA;
