import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const StickyWhatsApp = () => {
    const [isVisible, setIsVisible] = useState(false);
    const whatsappUrl = "https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20order%20mangoes.%20Is%20it%20available%20today%3F";

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button after scrolling down 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1]
                    }}
                    className="fixed bottom-6 right-6 z-50 bg-whatsapp hover:bg-[hsl(142,70%,36%)] text-accent-foreground rounded-full p-4 shadow-2xl hover:shadow-[0_20px_50px_rgba(34,197,94,0.4)] flex items-center gap-3 font-body font-semibold text-sm md:hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    aria-label="Order on WhatsApp"
                >
                    <MessageCircle className="h-6 w-6" />
                    <span className="pr-1">Order Now</span>
                </motion.a>
            )}
        </AnimatePresence>
    );
};

export default StickyWhatsApp;
