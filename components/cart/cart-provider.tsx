'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = {
    productId: string;
    productSizeId: string;
    productName: string;
    size: string;
    quantity: number;
    maxStock: number;
    printShopId: string;
    stocksByShop: Record<string, number>;
};

type CartContextValue = {
    items: CartItem[];
    itemCount: number;
    orderSheetOpen: boolean;
    setOrderSheetOpen: (open: boolean) => void;
    openOrderSheet: () => void;
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    updateQuantity: (productSizeId: string, quantity: number) => void;
    updatePrintShop: (productSizeId: string, printShopId: string) => void;
    removeItem: (productSizeId: string) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'targeter-cart';

function readStoredCart(): CartItem[] {
    if (typeof window === 'undefined') return [];

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as CartItem[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [hydrated, setHydrated] = useState(false);
    const [orderSheetOpen, setOrderSheetOpen] = useState(false);

    useEffect(() => {
        setItems(readStoredCart());
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items, hydrated]);

    const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
        const quantity = item.quantity ?? 1;

        setItems((current) => {
            const existing = current.find((entry) => entry.productSizeId === item.productSizeId);

            if (existing) {
                const nextQuantity = Math.min(existing.maxStock, existing.quantity + quantity);
                return current.map((entry) =>
                    entry.productSizeId === item.productSizeId
                        ? {
                              ...entry,
                              quantity: nextQuantity,
                              maxStock: item.stocksByShop[item.printShopId] ?? item.maxStock,
                              stocksByShop: item.stocksByShop,
                              printShopId: item.printShopId,
                          }
                        : entry,
                );
            }

            return [
                ...current,
                {
                    productId: item.productId,
                    productSizeId: item.productSizeId,
                    productName: item.productName,
                    size: item.size,
                    quantity: Math.min(item.maxStock, quantity),
                    maxStock: item.maxStock,
                    printShopId: item.printShopId,
                    stocksByShop: item.stocksByShop,
                },
            ];
        });
    }, []);

    const updateQuantity = useCallback((productSizeId: string, quantity: number) => {
        setItems((current) =>
            current
                .map((entry) =>
                    entry.productSizeId === productSizeId
                        ? { ...entry, quantity: Math.min(entry.maxStock, Math.max(0, quantity)) }
                        : entry,
                )
                .filter((entry) => entry.quantity > 0),
        );
    }, []);

    const updatePrintShop = useCallback((productSizeId: string, printShopId: string) => {
        setItems((current) =>
            current.map((entry) => {
                if (entry.productSizeId !== productSizeId) return entry;

                const maxStock = entry.stocksByShop[printShopId] ?? 0;

                return {
                    ...entry,
                    printShopId,
                    maxStock,
                    quantity: Math.min(entry.quantity, maxStock),
                };
            }),
        );
    }, []);

    const removeItem = useCallback((productSizeId: string) => {
        setItems((current) => current.filter((entry) => entry.productSizeId !== productSizeId));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const openOrderSheet = useCallback(() => {
        setOrderSheetOpen(true);
    }, []);

    const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

    const value = useMemo(
        () => ({
            items,
            itemCount,
            orderSheetOpen,
            setOrderSheetOpen,
            openOrderSheet,
            addItem,
            updateQuantity,
            updatePrintShop,
            removeItem,
            clearCart,
        }),
        [
            items,
            itemCount,
            orderSheetOpen,
            openOrderSheet,
            addItem,
            updateQuantity,
            updatePrintShop,
            removeItem,
            clearCart,
        ],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }

    return context;
}
