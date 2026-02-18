import { motion } from "framer-motion";
import { Sun, Truck, PackageCheck, Clock } from "lucide-react"; // Using Lucide icons as placeholders for process steps

const steps = [
    {
        icon: Sun,
        title: "04:00 AM — Predawn Harvest",
        description: "Our farmers hand-pick mangoes before sunrise to retain maximum moisture and natural sweetness."
    },
    {
        icon: Clock,
        title: "10-Day Natural Ripening",
        description: "Placed in hay stacks for slow, chemical-free ripening. No carbide. No shortcuts. Just patience."
    },
    {
        icon: PackageCheck,
        title: "Triple Quality Check",
        description: "Each mango is inspected for size, color, and aroma before being placed in our premium boxes."
    },
    {
        icon: Truck,
        title: "Express Dispatch",
        description: "Once packed, boxes are dispatched immediately to ensure they reach your home within hours."
    }
];

const ProcessTimeline = () => {
    return (
        <section className="section-padding bg-heritage-pattern relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <p className="brand-label mb-4">The Journey</p>
                    <h2 className="editorial-heading text-charcoal">
                        From Orchard to <span className="italic text-[hsl(44,80%,46%)]">Table</span>
                    </h2>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[2.5rem] left-0 w-full h-px bg-[hsl(44,80%,46%)]/20 z-0"></div>

                    <div className="grid md:grid-cols-4 gap-12">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.15 }}
                                className="relative z-10 flex flex-col items-center text-center group"
                            >
                                {/* Icon Circle */}
                                <div className="w-20 h-20 rounded-full bg-white border border-[hsl(44,80%,46%)]/30 flex items-center justify-center text-[hsl(44,80%,46%)] shadow-sm mb-6 group-hover:bg-[hsl(44,80%,46%)] group-hover:text-white transition-all duration-500">
                                    <step.icon className="h-8 w-8 stroke-[1.5]" />
                                </div>

                                <h3 className="font-display text-xl font-medium text-charcoal mb-3">{step.title}</h3>
                                <p className="font-body text-sm text-muted-foreground leading-relaxed px-2">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProcessTimeline;
