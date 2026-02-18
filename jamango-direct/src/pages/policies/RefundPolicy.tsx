
import React from 'react';
import { motion } from 'framer-motion';

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-[#FBF7F0] text-charcoal font-body py-24 px-6 md:px-12">
            <div className="max-w-4xl mx-auto mb-8 pt-4">
                <Link to="/">
                    <motion.button
                        whileHover={{ scale: 1.02, x: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-[hsl(44,80%,46%)]/30 rounded-full shadow-sm hover:shadow-md hover:border-[hsl(44,80%,46%)] transition-all duration-300"
                    >
                        <div className="w-8 h-8 rounded-full bg-[hsl(44,90%,50%)]/10 flex items-center justify-center group-hover:bg-[hsl(44,90%,50%)] transition-colors duration-300">
                            <ArrowLeft className="h-4 w-4 text-[hsl(44,90%,35%)] group-hover:text-white transition-colors duration-300" />
                        </div>
                        <span className="font-medium text-[hsl(44,90%,35%)] tracking-wide text-sm">Return to Home</span>
                    </motion.button>
                </Link>
            </div>
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-[hsl(44,30%,90%)]">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-4xl md:text-5xl text-[hsl(44,90%,45%)] mb-8"
                >
                    Refund & Cancellation Policy
                </motion.h1>

                <div className="prose prose-stone max-w-none text-charcoal/80 space-y-6 leading-relaxed">
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">1. Order Cancellation</h3>
                    <p>
                        We understand that plans can change. You can cancel your order within <strong>24 hours</strong> of placing it, free of charge. After this period, we may not be able to cancel as harvest preparation begins. To cancel, please email us at <a href="mailto:hello@jamango.in" className="text-[hsl(44,80%,46%)] hover:underline">hello@jamango.in</a> with your Order ID.
                    </p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">2. Refunds</h3>
                    <p>
                        If you cancel your order within the 24-hour window, we will process a full refund to your original payment method within <strong>5-7 business days</strong>.
                    </p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">3. Quality Guarantee & Returns</h3>
                    <p>
                        Due to the perishable nature of our mangoes, we generally do not accept returns. However, we stand behind the quality of our produce. If you receive mangoes that are significantly damaged, spoiled, or not as described, please contact us within <strong>24 hours of delivery</strong>.
                    </p>
                    <p>To request a replacement or refund under our Quality Guarantee:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Send an email to <a href="mailto:hello@jamango.in" className="text-[hsl(44,80%,46%)] hover:underline">hello@jamango.in</a>.</li>
                        <li>Include your Order ID.</li>
                        <li>Attach clear photos of the damaged/spoiled mangoes (including packaging if relevant).</li>
                    </ul>
                    <p>
                        We will review your claim and, if approved, offer a replacement box (subject to availability) or a partial/full refund based on the extent of the issue.
                    </p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">4. Refund Processing</h3>
                    <p>
                        Once a refund is approved, it will be processed and credited to your original payment method within <strong>5-7 business days</strong>. Please note that bank processing times may vary.
                    </p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">5. Non-Refundable Items</h3>
                    <p>
                        We cannot offer refunds for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Delays caused by incorrect shipping addresses provided by you.</li>
                        <li>Deliveries refused or uncollected by the recipient.</li>
                        <li>Normal variations in fruit size/color/taste (as mangoes are natural products).</li>
                        <li>Any issues reported after 24 hours of delivery.</li>
                    </ul>

                    <h3 className="font-display text-2xl text-charcoal mt-8">6. Contact Us</h3>
                    <p>
                        For any refund or cancellation queries, please reach out to us at <a href="mailto:hello@jamango.in" className="text-[hsl(44,80%,46%)] hover:underline">hello@jamango.in</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicy;
