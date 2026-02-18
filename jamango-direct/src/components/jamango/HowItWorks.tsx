import { motion } from "framer-motion";
import { ShoppingBag, MessageCircle, CreditCard, MapPin, CheckCircle2, Clock, Send, Link } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
};

const HowItWorks = () => {
  const websiteSteps = [
    { label: "Select your mango box", desc: "Choose your favorite variety" },
    { label: "Enter secure delivery details", desc: "We deliver to your doorstep" },
    { label: "Pay securely (UPI / Card)", desc: "100% safe checkout" },
    { label: "Instant confirmation", desc: "Track your order via email" },
  ];

  const whatsappSteps = [
    { label: "Message us on WhatsApp", desc: "Chat directly with us" },
    { label: "Confirm daily availability", desc: "We check fresh stock" },
    { label: "Receive secure payment link", desc: "Pay with one click" },
    { label: "Delivery scheduled", desc: "Get updates on your phone" },
  ];

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-4">
            How to <span className="italic text-[hsl(44,80%,46%)]">Order</span>
          </h2>
          <p className="text-muted-foreground font-body max-w-lg mx-auto">
            Choose the most convenient way to bring the harvest home. Simple, secure, and transparent.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {/* Website Ordering Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative bg-[#FFFBF2] rounded-[32px] p-8 md:p-10 border border-[hsl(44,80%,46%)]/10 hover:border-[hsl(44,80%,46%)]/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-5 mb-10 pb-6 border-b border-[hsl(44,80%,46%)]/10">
              <div className="w-14 h-14 rounded-2xl bg-[hsl(44,80%,46%)] text-white flex items-center justify-center shadow-lg shadow-[hsl(44,80%,46%)]/20 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl text-charcoal">Website Order</h3>
            </div>

            <motion.ul
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-8 relative"
            >
              {/* Vertical Line */}
              <div className="absolute left-[15px] top-2 bottom-4 w-px bg-[hsl(44,80%,46%)]/20 border-l border-dashed border-[hsl(44,80%,46%)]/40 h-full -z-10" />

              {websiteSteps.map((step, i) => (
                <motion.li key={i} variants={item} className="flex items-start gap-6 relative">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-[hsl(44,80%,46%)] text-[hsl(44,80%,46%)] font-bold text-sm flex items-center justify-center shadow-sm z-10">
                    {i + 1}
                  </div>
                  <div className="pt-1">
                    <p className="font-display text-lg text-charcoal leading-none mb-1">{step.label}</p>
                    <p className="text-sm text-charcoal/60 font-body">{step.desc}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* WhatsApp Ordering Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative bg-[#F4F9F4] rounded-[32px] p-8 md:p-10 border border-[hsl(142,76%,36%)]/10 hover:border-[hsl(142,76%,36%)]/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-5 mb-10 pb-6 border-b border-[hsl(142,76%,36%)]/10">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/20 -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl text-charcoal">WhatsApp Order</h3>
            </div>

            <motion.ul
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-8 relative"
            >
              {/* Vertical Line */}
              <div className="absolute left-[15px] top-2 bottom-4 w-px bg-[#25D366]/20 border-l border-dashed border-[#25D366]/40 h-full -z-10" />

              {whatsappSteps.map((step, i) => (
                <motion.li key={i} variants={item} className="flex items-start gap-6 relative">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-[#25D366] text-[#25D366] font-bold text-sm flex items-center justify-center shadow-sm z-10">
                    {i + 1}
                  </div>
                  <div className="pt-1">
                    <p className="font-display text-lg text-charcoal leading-none mb-1">{step.label}</p>
                    <p className="text-sm text-charcoal/60 font-body">{step.desc}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
