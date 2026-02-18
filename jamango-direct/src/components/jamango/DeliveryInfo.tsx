import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Package, Clock, Building, MapPin, ChevronDown, ChevronUp } from "lucide-react";

const DeliveryInfo = () => {
  const [showCities, setShowCities] = useState(false);

  const deliveryPoints = [
    {
      icon: Truck,
      text: "Next-Day Delivery in metropolitan cities.",
      sub: "Farm to home in 24 hours"
    },
    {
      icon: Package,
      text: "2–4 Day Express Shipping Pan India",
      sub: "Secure & damage-proof packing"
    },
    {
      icon: Clock,
      text: "Slot-Based Delivery in Select Cities",
      sub: "Convenience at your command"
    },
    {
      icon: Building,
      text: "Bulk & Apartment Orders Available",
      sub: "Special handling for large orders"
    }
  ];

  const cities = [
    "Pune", "Mumbai", "Nagpur", "Nashik", "Bangalore",
    "Chennai", "Hyderabad", "Kolkata", "Ahmedabad", "Delhi",
    "Jaipur", "Lucknow", "Surat", "Chandigarh", "Visakhapatnam",
    "Gurugram", "Indore", "Noida", "Patna", "And more!"
  ];

  return (
    <section className="section-padding bg-[#FDFBF7] relative overflow-hidden">
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-heritage-pattern opacity-[0.03] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-4 leading-tight">
            Delivered Across India. <br className="hidden md:block" />
            <span className="italic text-[hsl(44,80%,46%)] font-normal">Handled With Care.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 lg:gap-12">
          {deliveryPoints.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center gap-5 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-[hsl(44,80%,46%)]/10 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:scale-110 group-hover:border-[hsl(44,80%,46%)]/40 transition-all duration-500 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[hsl(44,80%,46%)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <item.icon className="h-7 w-7 text-[hsl(44,80%,46%)] relative z-10" />
              </div>

              <div className="text-center space-y-2 max-w-[240px] md:max-w-none mx-auto">
                <h3 className="font-display text-lg font-semibold text-charcoal group-hover:text-[hsl(44,80%,46%)] transition-colors duration-300 leading-tight">
                  {item.text}
                </h3>
                {item.sub && (
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{item.sub}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <button
            onClick={() => setShowCities(!showCities)}
            className="px-8 py-3 rounded-full border border-[hsl(44,80%,46%)]/40 text-[hsl(44,80%,46%)] font-display text-sm font-medium hover:bg-[hsl(44,80%,46%)]/5 transition-all duration-300 tracking-wide flex items-center gap-2 mx-auto group bg-white shadow-sm"
          >
            <span className="group-hover:translate-x-0.5 transition-transform duration-300">
              {showCities ? "Hide Available Cities" : "View Available Cities"}
            </span>
            <MapPin className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            {showCities ? <ChevronUp className="w-4 h-4 ml-1 opacity-60" /> : <ChevronDown className="w-4 h-4 ml-1 opacity-60" />}
          </button>
        </motion.div>

        {/* Cities Grid */}
        <AnimatePresence>
          {showCities && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="max-w-5xl mx-auto pt-10 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {cities.map((city, index) => (
                    <motion.div
                      key={city}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="bg-white border border-[hsl(44,30%,90%)] rounded-lg py-2.5 px-2 text-sm md:text-base font-medium text-charcoal/80 shadow-sm hover:border-[hsl(44,80%,46%)]/30 hover:shadow-md transition-all cursor-default select-none flex items-center justify-center min-h-[48px]"
                    >
                      {city}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 pt-8 border-t border-[hsl(44,80%,46%)]/10 inline-block px-12"
        >
          <p className="text-sm font-medium text-charcoal/60 italic font-body">
            * Delivery timelines vary by location and variety.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DeliveryInfo;
