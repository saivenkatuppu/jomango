
import React from 'react';
import { motion } from 'framer-motion';

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
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
                    Terms of Service
                </motion.h1>

                <div className="prose prose-stone max-w-none text-charcoal/80 space-y-6 leading-relaxed">
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">1. Acceptance of Terms</h3>
                    <p>
                        By accessing or using the Jamango website, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our services.
                    </p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">2. Use of Services</h3>
                    <p>
                        You may use our services for personal, non-commercial purposes only. You agree not to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Use the website for any illegal or unauthorized purpose.</li>
                        <li>Interfere with or disrupt the website's functionality.</li>
                        <li>Attempt to gain unauthorized access to our systems.</li>
                    </ul>

                    <h3 className="font-display text-2xl text-charcoal mt-8">3. Orders and Payment</h3>
                    <p>
                        All orders are subject to availability and acceptance. We reserve the right to refuse or cancel any order for any reason, including errors in product description or pricing. Payment must be made in full at the time of purchase using our secure payment gateway (Razorpay). Prices are listed in Indian Rupees (INR) and include applicable taxes. We reserve the right to change prices at any time without prior notice.
                    </p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">4. Delivery</h3>
                    <p>
                        We strive to deliver freshly harvested mangoes within the estimated timeframe. However, delivery times may vary due to factors beyond our control (e.g., weather, harvest delays, logistics issues). We are not liable for any delays. Please ensure someone is available to receive the delivery.
                    </p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">5. Product Description</h3>
                    <p>
                        We take great care to accurately display and describe our mangoes. However, as mangoes are a natural product, variations in size, color, and taste may occur. Such variations do not constitute a defect.
                    </p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">6. Limitation of Liability</h3>
                    <p>
                        To the fullest extent permitted by law, Jamango shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of our services or products.
                    </p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">7. Governing Law</h3>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.
                    </p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">8. Changes to Terms</h3>
                    <p>
                        We may update these Terms from time to time. Changes will be posted on this page. Your continued use of the website after changes constitutes your acceptance of the new Terms.
                    </p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">9. Contact Us</h3>
                    <p>
                        If you have any questions about these Terms, please contact us at <a href="mailto:hello@jamango.in" className="text-[hsl(44,80%,46%)] hover:underline">hello@jamango.in</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
