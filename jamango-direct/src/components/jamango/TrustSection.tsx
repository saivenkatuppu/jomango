import { motion } from "framer-motion";

const reasons = [
  {
    id: "01",
    title: "Generations in Mango Trade",
    desc: "Decades of expertise under the House of Munagala. A legacy of identifying the perfect harvest."
  },
  {
    id: "02",
    title: "Naturally Ripened",
    desc: "No carbide, no chemicals. Just patience and nature's sweetness, developed fully on the tree."
  },
  {
    id: "03",
    title: "Fresh Daily Selection",
    desc: "Hand-picked every morning from our trusted orchards and delivered immediately to ensure peak taste."
  },
];

const TrustSection = () => {
  return (
    <section className="section-padding bg-heritage-pattern relative">
      {/* Optional Overlay to soften if needed */}
      <div className="absolute inset-0 bg-[hsl(44,80%,46%)]/5 pointer-events-none mix-blend-multiply" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 lg:gap-20 relative z-10">
        {reasons.map((reason, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.2 }}
            className="relative p-8 md:p-10 border-l border-[hsl(44,80%,46%)]/30 group"
          >
            {/* Large Faint Number */}
            <span className="absolute -top-10 -left-6 font-display text-[8rem] leading-none text-[hsl(44,80%,46%)]/5 select-none pointer-events-none group-hover:text-[hsl(44,80%,46%)]/10 transition-colors duration-500">
              {reason.id}
            </span>

            <div className="relative z-10">
              <h3 className="font-display text-2xl md:text-3xl text-charcoal mb-4 group-hover:text-[hsl(44,80%,46%)] transition-colors duration-300">
                {reason.title}
              </h3>
              <p className="text-muted-foreground font-body text-lg leading-relaxed">
                {reason.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrustSection;
