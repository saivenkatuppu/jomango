import { motion } from "framer-motion";
import { XCircle, ThermometerSnowflake, Sun, Home } from "lucide-react";
import orchardImage from "@/assets/orchard.jpg";

const BrandStory = () => {
  return (
    <section className="section-padding bg-organic-blooms relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative z-10">

        {/* Text Content - Left Side */}
        <div className="w-full lg:w-[55%] order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <p className="brand-label mb-6">Our Story</p>

            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal mb-6 leading-[1.2]">
              From Generations of <br />
              Mango Expertise <br />
              <span className="italic text-[hsl(44,80%,46%)] font-normal">To Your Doorstep</span>
            </h2>

            <div className="w-24 h-px bg-[hsl(44,80%,46%)]/40 mb-10" />

            <div className="space-y-6 text-lg md:text-xl text-muted-foreground font-body leading-relaxed">
              <p>
                <span className="float-left text-5xl md:text-6xl font-display text-[hsl(44,80%,46%)] mr-4 mt-[-6px] leading-[1]">J</span>
                amango is built on decades of expertise under the House of Munagala,
                trusted by premium domestic and international markets. From supplying elite wholesale buyers,
                we now bring the same hand-selected mangoes directly to discerning families.
              </p>

              <p className="font-medium text-charcoal/80">
                No middlemen. No cold storage. Only naturally ripened mangoes packed fresh and delivered to your doorstep.
              </p>
            </div>

            <div className="mt-12">
              <p className="font-display text-2xl text-charcoal italic">
                — The Munagala Family
              </p>
            </div>
          </motion.div>
        </div>

        {/* Image Content - Right Side */}
        <div className="w-full lg:w-[45%] order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative rounded-[24px] overflow-hidden shadow-2xl shadow-[hsl(44,80%,46%)]/10 aspect-[4/5] lg:aspect-[3/4]">
              <img
                src={orchardImage}
                alt="Munagala family mango orchard"
                className="w-full h-full object-cover transition-transform duration-[2s] ease-out hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[24px]" />
            </div>

          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default BrandStory;
