import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const OrderingOptions = () => {
    const websiteSteps = [
        { title: "Select your mango box", desc: "Choose your preferred variety and box size" },
        { title: "Enter delivery details", desc: "Fresh mangoes delivered to your doorstep" },
        { title: "Pay securely (UPI / Card)", desc: "256-bit SSL secured checkout" },
        { title: "Instant confirmation", desc: "Order updates via email and SMS" }
    ];

    const whatsappSteps = [
        { title: "Message us on WhatsApp", desc: "Chat directly with our team" },
        { title: "Confirm today’s availability", desc: "We check fresh harvest stock" },
        { title: "Receive secure payment link", desc: "Pay easily in one click" },
        { title: "Delivery scheduled", desc: "Get order updates on your phone" }
    ];

    return (
        <section className="py-20 bg-[#FBF7F0]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-display text-4xl md:text-5xl text-charcoal"
                    >
                        Choose How You’d Like to <span className="text-[hsl(44,80%,46%)] italic">Order</span>
                    </motion.h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Website Order Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-[#FFFDF5] rounded-[2.5rem] p-10 border border-[hsl(44,60%,90%)] shadow-xl shadow-[hsl(44,60%,90%)]/40 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(44,90%,50%)]/5 rounded-full blur-3xl -mr-32 -mt-32" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(44,90%,50%)] to-[hsl(35,90%,45%)] flex items-center justify-center shadow-lg shadow-[hsl(44,90%,50%)]/30">
                                    <ShoppingBag className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="font-display text-3xl text-charcoal">Website Order</h3>
                            </div>

                            <div className="space-y-8">
                                {websiteSteps.map((step, index) => (
                                    <div key={index} className="flex gap-5">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[hsl(44,80%,46%)]/30 text-[hsl(44,80%,40%)] font-bold text-sm flex items-center justify-center bg-[hsl(44,90%,96%)]">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-display text-lg text-charcoal leading-tight mb-1">{step.title}</h4>
                                            <p className="text-sm text-charcoal/60 font-medium">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border-[hsl(44,80%,46%)]/10 flex items-center justify-between text-[hsl(44,80%,40%)]">
                                <span className="text-xs font-bold uppercase tracking-widest">Best for instant checkout</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </motion.div>

                    {/* WhatsApp Order Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        onClick={() => window.open('https://wa.me/919866425756?text=Hi,%20I%20would%20like%20to%20order%20mangoes', '_blank')}
                        className="bg-[#F0FFF4] rounded-[2.5rem] p-10 border border-[#DCFCE7] shadow-xl shadow-[#DCFCE7]/60 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#25D366]/5 rounded-full blur-3xl -mr-32 -mt-32" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-lg shadow-[#25D366]/30">
                                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </div>
                                <h3 className="font-display text-3xl text-charcoal">WhatsApp Order</h3>
                            </div>

                            <div className="space-y-8">
                                {whatsappSteps.map((step, index) => (
                                    <div key={index} className="flex gap-5">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#25D366]/30 text-[#128C7E] font-bold text-sm flex items-center justify-center bg-[#E8FDF0]">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-display text-lg text-charcoal leading-tight mb-1">{step.title}</h4>
                                            <p className="text-sm text-charcoal/60 font-medium">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border-[#25D366]/10 flex items-center justify-between text-[#128C7E]">
                                <span className="text-xs font-bold uppercase tracking-widest">Best for custom orders</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default OrderingOptions;
