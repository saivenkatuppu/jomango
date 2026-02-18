
import React from 'react';
import { motion } from 'framer-motion';

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
                    Privacy Policy
                </motion.h1>

                <div className="prose prose-stone max-w-none text-charcoal/80 space-y-6 leading-relaxed">
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">1. Introduction</h3>
                    <p>
                        Welcome to Jamango. We value your trust and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit our website or purchase our premium mangoes.
                    </p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">2. Information We Collect</h3>
                    <p>We may collect the following types of information:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address, and billing information when you make a purchase.</li>
                        <li><strong>Usage Data:</strong> Information about how you interact with our website, such as IP address, browser type, and pages visited.</li>
                        <li><strong>Cookies:</strong> We use cookies to enhance your shopping experience and analyze site traffic.</li>
                    </ul>

                    <h3 className="font-display text-2xl text-charcoal mt-8">3. How We Use Your Information</h3>
                    <p>Your data is used to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Process and deliver your orders efficiently.</li>
                        <li>Send order updates, tracking information, and invoices.</li>
                        <li>Improve our website functionality and customer service.</li>
                        <li>Send promotional emails about new harvests or offers (only if you opt-in).</li>
                    </ul>

                    <h3 className="font-display text-2xl text-charcoal mt-8">4. Data Sharing and Security</h3>
                    <p>
                        We do not sell your personal information. We may share data with trusted third-party service providers (e.g., payment gateways like Razorpay, logistics partners, and email services) solely for the purpose of fulfilling your order and improving our services. We implement robust security measures to protect your data from unauthorized access.
                    </p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">5. Your Rights</h3>
                    <p>
                        You have the right to access, correct, or delete your personal information. You can also opt-out of marketing communications at any time.
                    </p>

                    <h3 className="font-display text-2xl text-charcoal mt-8">6. Contact Us</h3>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@jamango.in" className="text-[hsl(44,80%,46%)] hover:underline">hello@jamango.in</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
