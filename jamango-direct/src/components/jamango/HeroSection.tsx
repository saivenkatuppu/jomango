import { motion } from "framer-motion";
import { MessageCircle, Shield, ArrowRight, Leaf, Sun, Award, Lock } from "lucide-react";
import heroImage from "@/assets/hero-mangoes.jpg";

const HeroSection = () => {
  const whatsappUrl = "https://wa.me/919866425756?text=Hi%2C%20I%20want%20to%20order%20mangoes.%20Is%20it%20available%20today%3F";

  return (
    <section className="relative min-h-screen flex flex-col justify-start overflow-hidden">
      {/* Full Background Image with Zoom Effect - Optimized */}
      <div className="absolute inset-0 z-0 bg-black">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="w-full h-full will-change-transform" // Hardware acceleration
          style={{ transform: "translateZ(0)" }}
        >
          <img
            src={heroImage}
            alt="Premium Alphonso mangoes"
            className="w-full h-full object-cover opacity-80" // Increased opacity slightly for contrast
            loading="eager"
            decoding="async"
          />
        </motion.div>

        {/* Cinematic Gradient Overlay: Dark on left, transparent on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />

        {/* Additional bottom gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>

      {/* Content Container - Added pt-32/pt-48 to force content down */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-32 md:pt-48 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-3xl w-full"
        >

          {/* Main Heading - Refined Line Height & Spacing */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] md:leading-[1.1] mb-8 text-white drop-shadow-xl tracking-tight">
            Fresh Mangoes. <br />
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="italic text-[hsl(44,80%,46%)] font-normal inline-block"
            >
              Delivered Right.
            </motion.span>
          </h1>

          {/* Subheadline - Lighter Weight & More Breathing Room */}
          <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed font-body font-normal drop-shadow-md">
            Premium Seasonal Mango Varieties Naturally Ripened & Hand-Selected.
          </p>

          {/* Supporting Line - Improved Variety List Spacing */}
          <p className="text-base md:text-lg text-white/80 mb-12 max-w-xl leading-relaxed font-body drop-shadow-sm font-light tracking-wide">
            <span className="text-[hsl(44,80%,46%)] font-semibold uppercase tracking-wider text-base md:text-lg block mb-2">
              Alphonso • Banganapalli • Kesar
            </span>
            Curated daily and delivered across India.
          </p>

          {/* Buttons - Refined & Responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 mb-16">
            {/* Primary CTA: Secure Your Harvest */}
            <a
              href="#products"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[hsl(44,80%,46%)] text-[#1a1a1a] font-bold text-base uppercase tracking-wider rounded-full shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] hover:shadow-[0_6px_20px_rgba(234,179,8,0.23)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-out w-full sm:w-auto"
            >
              SECURE YOUR HARVEST
            </a>

            {/* Secondary CTA: Order via WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[hsl(44,80%,46%)] text-[#1a1a1a] font-bold text-base uppercase tracking-wider rounded-full shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] hover:shadow-[0_6px_20px_rgba(234,179,8,0.23)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-out w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" />
              ORDER VIA WHATSAPP
            </a>
          </div>

        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
