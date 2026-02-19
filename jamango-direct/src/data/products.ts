export interface ProductVariant {
    name: string;
    price: string;
    badge?: string;
    description?: string;
    stock?: number;
}

export interface ProductData {
    title: string;
    subTitle: string;
    price: string;
    tagline: string;
    isBestSeller?: boolean;
    variants: ProductVariant[];
}

export const products: ProductData[] = [
    {
        title: "3 KG Box",
        subTitle: "6–9 Mangoes • Naturally Ripened",
        price: "₹899",
        tagline: "Perfect for small families or personal indulgence.",
        isBestSeller: true,
        variants: [
            { name: "Banganapalli (3KG)", price: "₹899" },
            { name: "Kesar (3KG)", price: "₹1,099" },
            { name: "Alphonso (3KG)", price: "₹1,299" },
        ]
    },
    {
        title: "5 KG Box",
        subTitle: "10–14 Mangoes • Family Size",
        price: "₹1,399",
        tagline: "The ideal choice for sharing the sweetness.",
        isBestSeller: true,
        variants: [
            { name: "Banganapalli (5KG)", price: "₹1,399" },
            { name: "Kesar (5KG)", price: "₹1,599" },
            { name: "Alphonso (5KG)", price: "₹1,899" },
            {
                name: "Mixed Harvest (5KG)",
                price: "₹1,599",
                badge: "SEASONAL MIX",
                description: "Can't decide? Enjoy a curated mix of seasonal mangoes."
            },
        ]
    },
];
