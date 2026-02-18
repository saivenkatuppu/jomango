import { motion } from "framer-motion";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "Are your mangoes carbide-free?",
        answer: "Yes, absolutely. We use natural hay ripening methods that take 10–12 days, with no chemicals or shortcuts. This ensures authentic taste, aroma, and natural sweetness."
    },
    {
        question: "Do you deliver pan-India?",
        answer: "Yes, we dispatch fresh mangoes across India using express courier services. For local Bangalore orders, we offer same-day or next-day delivery options."
    },
    {
        question: "Is delivery available in metropolitan cities?",
        answer: "Yes. We currently deliver to major metropolitan cities, with express and slot-based delivery options depending on location."
    },
    {
        question: "What if the mangoes are damaged in transit?",
        answer: "We use specialized reinforced corrugated boxes to prevent damage. In the rare event of damage, please share photos within 24 hours via WhatsApp, and we will issue a refund or replacement."
    },
    {
        question: "Will the mangoes arrive ripe?",
        answer: "We ship mangoes semi-ripe to ensure they travel well. They will ripen perfectly at room temperature within 2-4 days of delivery. Instructions are included in the box."
    },
    {
        question: "Can I pre-order for next week?",
        answer: "Yes, slots fill up fast! You can secure your box by ordering now and specifying your preferred dispatch date during checkout or via WhatsApp."
    }
];

const FAQSection = () => {
    return (
        <section className="section-padding bg-background">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <p className="brand-label mb-4">Concierge</p>
                    <h2 className="editorial-heading text-charcoal mb-4">
                        Frequently Asked <span className="italic text-[hsl(44,80%,46%)]">Questions</span>
                    </h2>
                    <p className="font-body text-muted-foreground">Everything you need to know about your order.</p>
                </motion.div>

                <div className="bg-white rounded-[24px] p-6 md:p-10 border border-[hsl(44,80%,46%)]/10 shadow-sm">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-0 border-[hsl(44,80%,46%)]/10 py-2">
                                <AccordionTrigger className="font-display text-lg text-charcoal hover:text-[hsl(44,80%,46%)] hover:no-underline transition-colors text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="font-body text-charcoal/70 leading-relaxed text-base">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
