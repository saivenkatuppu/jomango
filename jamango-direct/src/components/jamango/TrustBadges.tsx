
import { motion } from "framer-motion";
import { Leaf, Sun, Award, Lock } from "lucide-react";

const TrustBadges = () => {
    return (
        <section className="bg-[hsl(80,45%,15%)] py-12 px-6 border-y border-[hsl(44,80%,46%)]/10">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col items-center text-center gap-4 group"
                    >
                        <div className="p-4 rounded-full bg-[hsl(44,80%,46%)]/10 text-[hsl(44,80%,46%)] group-hover:bg-[hsl(44,80%,46%)] group-hover:text-white transition-all duration-300 shadow-lg shadow-[hsl(44,80%,46%)]/10">
                            <Leaf className="h-6 w-6 md:h-8 md:w-8" />
                        </div>
                        <div>
                            <h3 className="text-[#F8F4EC] text-sm md:text-base font-bold uppercase tracking-widest mb-1">Carbide-Free</h3>
                            <p className="text-[#F8F4EC]/60 text-xs md:text-sm">Certified Naturally Grown</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center text-center gap-4 group"
                    >
                        <div className="p-4 rounded-full bg-[hsl(44,80%,46%)]/10 text-[hsl(44,80%,46%)] group-hover:bg-[hsl(44,80%,46%)] group-hover:text-white transition-all duration-300 shadow-lg shadow-[hsl(44,80%,46%)]/10">
                            <Sun className="h-6 w-6 md:h-8 md:w-8" />
                        </div>
                        <div>
                            <h3 className="text-[#F8F4EC] text-sm md:text-base font-bold uppercase tracking-widest mb-1">10-Day Ripening</h3>
                            <p className="text-[#F8F4EC]/60 text-xs md:text-sm">Tree-Ripened Perfection</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col items-center text-center gap-4 group"
                    >
                        <div className="p-4 rounded-full bg-[hsl(44,80%,46%)]/10 text-[hsl(44,80%,46%)] group-hover:bg-[hsl(44,80%,46%)] group-hover:text-white transition-all duration-300 shadow-lg shadow-[hsl(44,80%,46%)]/10">
                            <Award className="h-6 w-6 md:h-8 md:w-8" />
                        </div>
                        <div>
                            <h3 className="text-[#F8F4EC] text-sm md:text-base font-bold uppercase tracking-widest mb-1">Heritage</h3>
                            <p className="text-[#F8F4EC]/60 text-xs md:text-sm">Generations of Expertise</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col items-center text-center gap-4 group"
                    >
                        <div className="p-4 rounded-full bg-[hsl(44,80%,46%)]/10 text-[hsl(44,80%,46%)] group-hover:bg-[hsl(44,80%,46%)] group-hover:text-white transition-all duration-300 shadow-lg shadow-[hsl(44,80%,46%)]/10">
                            <Lock className="h-6 w-6 md:h-8 md:w-8" />
                        </div>
                        <div>
                            <h3 className="text-[#F8F4EC] text-sm md:text-base font-bold uppercase tracking-widest mb-1">Secure</h3>
                            <p className="text-[#F8F4EC]/60 text-xs md:text-sm">100% Safe Checkout</p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default TrustBadges;
