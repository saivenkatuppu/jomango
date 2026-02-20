import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
    id: string; // Unique ID for the item (product + variant)
    name: string;
    variant?: string;
    price: number;
    quantity: number;
    discountLabel?: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "id" | "quantity">) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const storedCart = localStorage.getItem("jamango_cart");
        if (storedCart) {
            try {
                setCart(JSON.parse(storedCart));
            } catch (e) {
                console.error("Failed to parse cart from local storage", e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("jamango_cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (newItem: Omit<CartItem, "id" | "quantity">) => {
        setCart((prevCart) => {
            // Create a unique ID based on name and variant
            const itemId = newItem.variant
                ? `${newItem.name}-${newItem.variant}`
                : newItem.name;

            const existingItemIndex = prevCart.findIndex((item) => item.id === itemId);

            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += 1;
                toast.success("Updated cart quantity", {
                    description: `${newItem.name}${newItem.variant ? ` (${newItem.variant})` : ""} quantity increased.`
                });
                return newCart;
            } else {
                toast.success("Added to cart", {
                    description: `${newItem.name}${newItem.variant ? ` (${newItem.variant})` : ""} added to your cart.`
                });
                return [...prevCart, { ...newItem, id: itemId, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                total,
                itemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
